const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a file buffer to Cloudinary or falls back to local file storage.
 * @param {Object} file - Multer file object with buffer, originalname, mimetype
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<{url: string, public_id: string, originalName: string}>}
 */
const uploadToCloudinaryOrLocal = (file, folder = 'task_attachments') => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return resolve(null);
    }

    if (isCloudinaryConfigured) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary] Upload Error:', error);
            // Fallback to local on failure
            return saveLocally(file, resolve, reject);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            originalName: file.originalname,
            format: result.format || path.extname(file.originalname).replace('.', ''),
            size: result.bytes || file.size,
          });
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    } else {
      // Local fallback
      saveLocally(file, resolve, reject);
    }
  });
};

const saveLocally = (file, resolve, reject) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeFilename = `${uniqueSuffix}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeFilename);

    fs.writeFileSync(filePath, file.buffer);

    const port = process.env.PORT || 5000;
    const fileUrl = `http://localhost:${port}/uploads/${safeFilename}`;

    resolve({
      url: fileUrl,
      publicId: safeFilename,
      originalName: file.originalname,
      format: path.extname(file.originalname).replace('.', ''),
      size: file.size,
    });
  } catch (err) {
    console.error('[FileUpload] Local save error:', err);
    reject(err);
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinaryOrLocal,
};
