const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  getWeatherPreview,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All task routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(upload.single('file'), createTask);

router.get('/stats/summary', getTaskStats);
router.get('/weather/preview', getWeatherPreview);

router.route('/:id')
  .get(getTaskById)
  .put(upload.single('file'), updateTask)
  .delete(deleteTask);

module.exports = router;
