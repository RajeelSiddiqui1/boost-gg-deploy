const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { isPro } = require('../middleware/rbac');
const serviceUpload = require('../middleware/serviceUpload');
const {
    getAllServices,
    getServicesByGame,
    getService,
    getServiceBySlug,
    calculateServicePrice,
    getAdminServices,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    bulkUpdateServices,
    reorderServices,
    validatePricing
} = require('../controllers/serviceController');

// Public routes
router.get('/', getAllServices);
router.get('/game/:gameId', getServicesByGame);
router.get('/slug/:slug', getServiceBySlug);
router.get('/:id', getService);

// Price calculation (public - for product pages)
router.post('/calculate-price', calculateServicePrice);

// Admin routes (protected)
router.get('/admin/all', [protect, authorize('admin')], getAdminServices);

router.post(
    '/admin',
    [protect, authorize('admin')],
    serviceUpload.fields([
        { name: 'icon', maxCount: 1 },
        { name: 'image', maxCount: 1 },
        { name: 'backgroundImage', maxCount: 1 }
    ]),
    createService
);

router.put(
    '/admin/:id',
    [protect, authorize('admin')],
    serviceUpload.fields([
        { name: 'icon', maxCount: 1 },
        { name: 'image', maxCount: 1 },
        { name: 'backgroundImage', maxCount: 1 }
    ]),
    updateService
);

router.patch('/admin/bulk', [protect, authorize('admin')], bulkUpdateServices);
router.delete('/admin/:id', [protect, authorize('admin')], deleteService);

router.patch('/admin/:id/status', [protect, authorize('admin')], toggleServiceStatus);
router.patch('/admin/reorder', [protect, authorize('admin')], reorderServices);

// Validate pricing config
router.post('/admin/validate-pricing', [protect, authorize('admin')], validatePricing);

// PRO routes - Create service (verified PRO only)
router.post(
    '/pro',
    [protect, isPro],
    serviceUpload.fields([
        { name: 'icon', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]),
    createService
);

// PRO routes - Update own service
router.put(
    '/pro/:id',
    [protect, isPro],
    serviceUpload.fields([
        { name: 'icon', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]),
    updateService
);

// PRO routes - Delete own service
router.delete('/pro/:id', [protect, isPro], deleteService);

// PRO routes - Toggle own service status
router.patch('/pro/:id/status', [protect, isPro], toggleServiceStatus);

module.exports = router;
