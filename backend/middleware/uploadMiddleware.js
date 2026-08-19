const multer = require('multer');
const path = require('path');

// Memory storage keeps file buffer in RAM for processing
const storage = multer.memoryStorage();

// File filter: accept images, PDF, documents, text files, spreadsheets
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif|pdf|doc|docx|txt|csv|xlsx|xls/;
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedExtensions.test(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('text/') || file.mimetype.includes('pdf') || file.mimetype.includes('document') || file.mimetype.includes('sheet');

  if (extname || mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images, PDFs, Word documents, Excel sheets, and text files are allowed!'), false);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
  fileFilter,
});

module.exports = upload;
