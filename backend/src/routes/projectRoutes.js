const express = require('express');
const router = express.Router();

const {
  createProject,
  listProjects,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

const authMiddleware = require('../middleware/authMiddleware');
const taskRoutes = require('./taskRoutes'); // ✅ REQUIRED IMPORT

// API 12: Create Project
router.post('/', authMiddleware, createProject);

// API 13: List Projects
router.get('/', authMiddleware, listProjects);

// API 14: Update Project
router.put('/:projectId', authMiddleware, updateProject);

// API 15: Delete Project
router.delete('/:projectId', authMiddleware, deleteProject);

// API 16 & 17 (Tasks under Project)
router.use('/:projectId/tasks', authMiddleware, taskRoutes);

module.exports = router;