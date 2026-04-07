const express = require('express');
const { getAnalytics, getUsers, getUser, updateUser, deleteUser, getSettings, updateSettings, getProEarnings } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // All admin routes require admin role

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/pros/:id/earnings', getProEarnings);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
