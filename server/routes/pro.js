const express = require('express');
const router = express.Router();
const { protect, authorize, optionalProtect } = require('../middleware/auth');
const { isPro, hasProType, hasRole, canManageOrders } = require('../middleware/rbac');
const ROLES = require('../models/User').ROLES;

// PRO Controllers (to be implemented)
const proController = require('../controllers/proController');

// Public: Get PRO types info
router.get('/types', (req, res) => {
    const PRO_TYPES = require('../models/User').PRO_TYPES;
    res.json({
        success: true,
        data: {
            types: PRO_TYPES,
            descriptions: {
                booster: 'Provide boosting services (rank/level boosting)',
                gold_seller: 'Sell in-game gold/currency',
                account_seller: 'Sell game accounts',
                content_creator: 'Create content (guides, streams, videos)',
                influencer_partner: 'Promote services as an influencer'
            }
        }
    });
});

// Public: Apply to become PRO (Guest or User)
router.post('/apply', optionalProtect, proController.apply);

// PRO Protected Routes
// Get PRO dashboard data
router.get('/dashboard', protect, isPro, proController.getDashboard);

// Get PRO orders
router.get('/orders', protect, isPro, proController.getOrders);

// Accept/claim an order
router.post('/orders/:orderId/accept', protect, isPro, proController.acceptOrder);

// Update order status
router.put('/orders/:orderId/status', protect, isPro, proController.updateOrderStatus);

// Add chat message to order
router.post('/orders/:orderId/chat', protect, isPro, proController.addChatMessage);

// PRO type specific routes
// For boosters: get available orders
router.get('/boosting/orders', protect, hasProType('booster'), proController.getAvailableBoostingOrders);

// For gold sellers: manage inventory
router.get('/gold/inventory', protect, hasProType('gold_seller'), proController.getGoldInventory);
router.post('/gold/inventory', protect, hasProType('gold_seller'), proController.addGoldInventory);
router.put('/gold/inventory/:itemId', protect, hasProType('gold_seller'), proController.updateGoldInventory);
router.delete('/gold/inventory/:itemId', protect, hasProType('gold_seller'), proController.deleteGoldInventory);

// For account sellers: manage accounts
router.get('/accounts', protect, hasProType('account_seller'), proController.getAccountListings);
router.post('/accounts', protect, hasProType('account_seller'), proController.createAccountListing);
router.put('/accounts/:accountId', protect, hasProType('account_seller'), proController.updateAccountListing);
router.delete('/accounts/:accountId', protect, hasProType('account_seller'), proController.deleteAccountListing);

// PRO: Get earnings
router.get('/earnings', protect, isPro, proController.getEarnings);

// PRO: Request payout
router.post('/payout/request', protect, isPro, proController.requestPayout);

// PRO: Get services
router.get('/services', protect, isPro, proController.getMyServices);

// PRO: Create service
router.post('/services', protect, isPro, proController.createService);

// PRO: Update service
router.put('/services/:serviceId', protect, isPro, proController.updateService);

// PRO: Delete service
router.delete('/services/:serviceId', protect, isPro, proController.deleteService);

// PRO: Get profile
router.get('/profile', protect, isPro, proController.getProfile);

// PRO: Update profile
router.put('/profile', protect, isPro, proController.updateProfile);

module.exports = router;
