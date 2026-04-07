const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllCurrencyListings,
    getCurrencyListingsByGame,
    getCurrencyListing,
    calculateCurrencyPrice,
    createCurrencyListing,
    updateCurrencyListing,
    deleteCurrencyListing,
    toggleCurrencyStatus,
    getAdminCurrencyListings
} = require('../controllers/currencyController');

// Public routes
router.get('/', getAllCurrencyListings);
router.get('/game/:gameId', getCurrencyListingsByGame);
router.get('/:id', getCurrencyListing);
router.post('/calculate', calculateCurrencyPrice);

// Admin routes
router.get('/admin/all', [protect, authorize('admin')], getAdminCurrencyListings);
router.post('/admin', [protect, authorize('admin')], createCurrencyListing);
router.put('/admin/:id', [protect, authorize('admin')], updateCurrencyListing);
router.delete('/admin/:id', [protect, authorize('admin')], deleteCurrencyListing);
router.patch('/admin/:id/status', [protect, authorize('admin')], toggleCurrencyStatus);

module.exports = router;
