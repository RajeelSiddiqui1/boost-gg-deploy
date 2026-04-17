const express = require('express');
const { getAnalytics, getUsers, getUser, updateUser, deleteUser, getSettings, updateSettings, getProEarnings, createService, updateService, deleteService, getAllServices, getService, toggleServiceStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const serviceUpload = require('../middleware/serviceUpload');

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

// Service Admin Routes
router.get('/services', getAllServices);
router.get('/services/:id', getService);
const uploadFields = [
    { name: 'icon', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'characterImage', maxCount: 1 }
];
router.post('/services', serviceUpload.fields(uploadFields), createService);
router.put('/services/:id', serviceUpload.fields(uploadFields), updateService);
router.patch('/services/:id/status', toggleServiceStatus);
router.delete('/services/:id', deleteService);

module.exports = router;
