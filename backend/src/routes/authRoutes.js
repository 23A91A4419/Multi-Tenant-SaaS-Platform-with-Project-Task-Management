const express = require('express');
const router = express.Router();

const {
  registerTenant,
  login,
  getCurrentUser,
  logout
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/register-tenant', registerTenant);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);

router.post('/logout', authMiddleware, logout);

module.exports = router;