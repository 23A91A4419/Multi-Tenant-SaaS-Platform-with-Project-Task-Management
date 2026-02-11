const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  createTask,
  listTasks,
  updateTaskStatus,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const authMiddleware = require('../middleware/authMiddleware');

// API 16: Create Task
router.post('/', authMiddleware, createTask);

// API 17: List Tasks
router.get('/', authMiddleware, listTasks);

// API 18: Update Task Status
router.patch('/:taskId/status', authMiddleware, updateTaskStatus);

// API 19: Update Task
router.put('/:taskId', authMiddleware, updateTask);

router.delete('/:taskId', authMiddleware, deleteTask);

module.exports = router;