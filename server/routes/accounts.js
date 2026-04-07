const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllAccountListings,
    getAccountListingsByGame,
    getAccountListing,
    createAccountListing,
    updateAccountListing,
    deleteAccountListing,
    toggleAccountStatus,
    markAccountSold,
    getAdminAccountListings
} = require('../controllers/accountController');

// Public routes
router.get('/', getAllAccountListings);
router.get('/game/:gameId', getAccountListingsByGame);
router.get('/:id', getAccountListing);

// Admin routes
router.get('/admin/all', [protect, authorize('admin')], getAdminAccountListings);
router.post('/admin', [protect, authorize('admin')], createAccountListing);
router.put('/admin/:id', [protect, authorize('admin')], updateAccountListing);
router.delete('/admin/:id', [protect, authorize('admin')], deleteAccountListing);
router.patch('/admin/:id/status', [protect, authorize('admin')], toggleAccountStatus);
router.patch('/admin/:id/sold', [protect, authorize('admin')], markAccountSold);

module.exports = router;
