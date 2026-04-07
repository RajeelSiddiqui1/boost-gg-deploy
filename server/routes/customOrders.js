const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createCustomOrder, getAdminCustomOrders } = require('../controllers/customOrderController');

// User routes
router.post('/', protect, createCustomOrder);

// Admin routes
router.get('/admin', [protect, authorize('admin')], getAdminCustomOrders);

module.exports = router;
