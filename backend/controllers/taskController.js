const Task = require('../models/Task');
const { isMongoActive, FallbackTask } = require('../models/store');
const { uploadToCloudinaryOrLocal } = require('../config/cloudinary');
const { getWeatherByCity } = require('../utils/weatherService');
const { sendTaskCreatedEmail, sendTaskCompletedEmail } = require('../utils/emailService');

const getTaskModel = () => (isMongoActive() ? Task : FallbackTask);

// @desc    Get logged-in user's tasks with filtering, search, sorting & pagination
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      startDate,
      endDate,
      location,
      tag,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Strict user data isolation
    const query = { user: req.user._id };

    // Filter by Status
    if (status && ['PENDING', 'IN_PROGRESS', 'DONE'].includes(status)) {
      query.status = status;
    }

    // Filter by Priority
    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      query.priority = priority;
    }

    // Filter by Location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by Tag
    if (tag) {
      query.tags = tag;
    }

    // Search query against Title and Description
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { location: searchRegex }];
    }

    // Date range filter on Due Date
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) {
        query.dueDate.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.dueDate.$lte = end;
      }
    }

    const numericPage = Math.max(1, parseInt(page, 10));
    const numericLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (numericPage - 1) * numericLimit;

    // Build sort object
    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    sort[sortBy] = order;

    const TaskModel = getTaskModel();
    const [tasks, total] = await Promise.all([
      TaskModel.find(query).sort(sort).skip(skip).limit(numericLimit),
      TaskModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;

    return res.json({
      success: true,
      data: tasks,
      meta: {
        total,
        page: numericPage,
        limit: numericLimit,
        totalPages,
        hasMore: numericPage < totalPages,
      },
    });
  } catch (error) {
    console.error('[TaskController] getTasks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tasks',
      error: error.message,
    });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const TaskModel = getTaskModel();
    const task = await TaskModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access unauthorized',
      });
    }

    // Optionally refresh weather if location is present
    let liveWeather = task.weatherSnapshot;
    if (task.location) {
      const freshWeather = await getWeatherByCity(task.location);
      if (freshWeather) {
        liveWeather = freshWeather;
      }
    }

    return res.json({
      success: true,
      data: {
        ...task.toObject(),
        liveWeather,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch task details',
      error: error.message,
    });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, location, tags } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    // Parse tags if sent as JSON string or comma-separated
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }
    }

    // Handle file upload if present
    let fileData = {};
    if (req.file) {
      const uploadResult = await uploadToCloudinaryOrLocal(req.file, 'task_attachments');
      if (uploadResult) {
        fileData = {
          fileUrl: uploadResult.url,
          fileName: uploadResult.originalName,
          fileType: uploadResult.format,
          fileSize: uploadResult.size,
        };
      }
    }

    // Fetch live weather if location is provided
    let weatherSnapshot = null;
    if (location && location.trim()) {
      weatherSnapshot = await getWeatherByCity(location.trim());
    }

    const TaskModel = getTaskModel();
    const task = await TaskModel.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'PENDING',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      location: location ? location.trim() : '',
      tags: parsedTags,
      weatherSnapshot,
      ...fileData,
    });

    // Send task creation email asynchronously
    sendTaskCreatedEmail(req.user, task).catch((err) =>
      console.error('[EmailService] Async task create email error:', err.message)
    );

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    console.error('[TaskController] createTask error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message,
    });
  }
};

// @desc    Update an existing task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const TaskModel = getTaskModel();
    const task = await TaskModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access unauthorized',
      });
    }

    const previousStatus = task.status;
    const { title, description, status, priority, dueDate, location, tags, removeFile } = req.body;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

    // Tags update
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        task.tags = tags;
      } else if (typeof tags === 'string') {
        try {
          task.tags = JSON.parse(tags);
        } catch {
          task.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }
    }

    // Location update & fresh weather
    if (location !== undefined) {
      task.location = location.trim();
      if (task.location) {
        const weather = await getWeatherByCity(task.location);
        if (weather) {
          task.weatherSnapshot = weather;
        }
      } else {
        task.weatherSnapshot = null;
      }
    }

    // Remove file flag
    if (removeFile === 'true' || removeFile === true) {
      task.fileUrl = '';
      task.fileName = '';
      task.fileType = '';
      task.fileSize = 0;
    }

    // Upload new file if attached
    if (req.file) {
      const uploadResult = await uploadToCloudinaryOrLocal(req.file, 'task_attachments');
      if (uploadResult) {
        task.fileUrl = uploadResult.url;
        task.fileName = uploadResult.originalName;
        task.fileType = uploadResult.format;
        task.fileSize = uploadResult.size;
      }
    }

    const updatedTask = await task.save();

    // Check if task status transitioned to DONE -> Send completion email
    if (previousStatus !== 'DONE' && updatedTask.status === 'DONE') {
      sendTaskCompletedEmail(req.user, updatedTask).catch((err) =>
        console.error('[EmailService] Async task completion email error:', err.message)
      );
    }

    return res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    console.error('[TaskController] updateTask error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message,
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const TaskModel = getTaskModel();
    const task = await TaskModel.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access unauthorized',
      });
    }

    return res.json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message,
    });
  }
};

// @desc    Get summary statistics for dashboard
// @route   GET /api/tasks/stats/summary
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const TaskModel = getTaskModel();

    const [total, pending, inProgress, done, highPriority, overdue] = await Promise.all([
      TaskModel.countDocuments({ user: userId }),
      TaskModel.countDocuments({ user: userId, status: 'PENDING' }),
      TaskModel.countDocuments({ user: userId, status: 'IN_PROGRESS' }),
      TaskModel.countDocuments({ user: userId, status: 'DONE' }),
      TaskModel.countDocuments({ user: userId, priority: { $in: ['HIGH', 'URGENT'] }, status: { $ne: 'DONE' } }),
      TaskModel.countDocuments({
        user: userId,
        status: { $ne: 'DONE' },
        dueDate: { $lt: now, $ne: null },
      }),
    ]);

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return res.json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        done,
        highPriority,
        overdue,
        completionRate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve task metrics',
      error: error.message,
    });
  }
};

// @desc    Preview live weather for any city
// @route   GET /api/tasks/weather/preview
// @access  Private
const getWeatherPreview = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ success: false, message: 'City parameter is required' });
    }

    const weather = await getWeatherByCity(city);
    return res.json({
      success: true,
      data: weather,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch weather preview',
      error: error.message,
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  getWeatherPreview,
};
