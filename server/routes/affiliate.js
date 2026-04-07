const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { isAffiliate } = require('../middleware/rbac');

// Affiliate Controller
const affiliateController = require('../controllers/affiliateController');

// Public: Get affiliate types info
router.get('/types', (req, res) => {
    const AFFILIATE_TYPES = require('../models/User').AFFILIATE_TYPES;
    res.json({
        success: true,
        data: {
            types: AFFILIATE_TYPES,
            descriptions: {
                creator: 'Create content (blogs, guides, videos) and earn from referrals',
                promoter: 'Promote services on social media and earn commissions'
            }
        }
    });
});

// Public: Sign up as affiliate with referral code
router.post('/signup', protect, affiliateController.signupAsAffiliate);

// Protected: Affiliate dashboard
router.get('/dashboard', protect, isAffiliate, affiliateController.getDashboard);

// Protected: Get referrals
router.get('/referrals', protect, isAffiliate, affiliateController.getReferrals);

// Protected: Get commissions
router.get('/commissions', protect, isAffiliate, affiliateController.getCommissions);

// Protected: Get stats
router.get('/stats', protect, isAffiliate, affiliateController.getStats);

// Protected: Get promo tools (banners, links)
router.get('/promo-tools', protect, isAffiliate, affiliateController.getPromoTools);

// Protected: Generate tracking link
router.post('/track', protect, isAffiliate, affiliateController.generateTrackingLink);

// Protected: Request payout
router.post('/payout/request', protect, isAffiliate, affiliateController.requestPayout);

module.exports = router;
