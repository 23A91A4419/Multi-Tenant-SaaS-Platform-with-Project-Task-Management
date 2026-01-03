const express = require('express');
const router = express.Router();

const {
  getTenantDetails,
  updateTenant,
  listAllTenants,
  addUserToTenant,
  listTenantUsers
} = require('../controllers/tenantController');
const authMiddleware = require('../middleware/authMiddleware');

// API 5: Get Tenant Details
router.get('/:tenantId', authMiddleware, getTenantDetails);

// API 6: Update Tenant
router.put('/:tenantId', authMiddleware, updateTenant);


// API 7
router.get('/', authMiddleware, listAllTenants);

// API 8
router.post('/:tenantId/users', authMiddleware, addUserToTenant);


// API 9
router.get('/:tenantId/users', authMiddleware, listTenantUsers);
module.exports = router;