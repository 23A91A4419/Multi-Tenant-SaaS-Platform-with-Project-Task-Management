const express = require('express');
const router = express.Router();

const { updateUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// API 10
router.put('/:userId', authMiddleware, updateUser);

// API 11
router.delete('/:userId', authMiddleware, deleteUser);

module.exports = router;