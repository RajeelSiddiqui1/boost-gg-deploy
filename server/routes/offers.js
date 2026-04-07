const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validators, handleValidationErrors } = require('../middleware/validation');
const {
    getAllOffers,
    getAdminOffers,
    getOffer,
    createOffer,
    updateOffer,
    deleteOffer,
    bulkDeleteOffers,
    toggleOfferStatus
} = require('../controllers/offerController');

// Public routes
router.get('/', [validators.pagination, handleValidationErrors], getAllOffers);
router.get('/:id', [validators.mongoId, handleValidationErrors], getOffer);

// Protected admin routes
router.get('/admin/all', [protect, authorize('admin')], getAdminOffers);
router.post('/admin', [protect, authorize('admin')], createOffer);
router.put('/admin/:id', [protect, authorize('admin'), validators.mongoId, handleValidationErrors], updateOffer);
router.delete('/admin/:id', [protect, authorize('admin'), validators.mongoId, handleValidationErrors], deleteOffer);
router.delete('/admin/bulk', [protect, authorize('admin')], bulkDeleteOffers);
router.patch('/admin/:id/status', [protect, authorize('admin'), validators.mongoId, handleValidationErrors], toggleOfferStatus);

module.exports = router;
