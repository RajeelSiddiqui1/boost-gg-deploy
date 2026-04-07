const User = require('../models/User');
const { AffiliateReferral, AffiliateCommission } = require('../models/Affiliate');
const { ROLES, AFFILIATE_TYPES } = require('../models/User');

// @desc    Sign up as affiliate
// @route   POST /api/affiliate/signup
// @access  Private
exports.signupAsAffiliate = async (req, res) => {
    try {
        const { affiliateType } = req.body;

        // Check if user is already an affiliate
        if (req.user.role === ROLES.AFFILIATE) {
            return res.status(400).json({
                success: false,
                message: 'You are already an affiliate'
            });
        }

        // Validate affiliate type
        const validTypes = Object.values(AFFILIATE_TYPES);
        if (!affiliateType || !validTypes.includes(affiliateType)) {
            return res.status(400).json({
                success: false,
                message: 'Valid affiliate type is required: creator or promoter'
            });
        }

        // Update user to affiliate
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                role: ROLES.AFFILIATE,
                affiliateType,
                affiliateCode: crypto.randomBytes(6).toString('hex').toUpperCase()
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'You are now an affiliate!',
            data: {
                role: user.role,
                affiliateType: user.affiliateType,
                affiliateCode: user.affiliateCode
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error signing up as affiliate'
        });
    }
};

// @desc    Get affiliate dashboard
// @route   GET /api/affiliate/dashboard
// @access  Private (Affiliate)
exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Get referral stats
        const referralStats = await AffiliateReferral.aggregate([
            { $match: { affiliateId: req.user._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get commission stats
        const commissionStats = await AffiliateCommission.getAffiliateStats(req.user._id);

        // Get recent referrals
        const recentReferrals = await AffiliateReferral.find({ affiliateId: req.user._id })
            .populate('referredUserId', 'name email createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                profile: user,
                referralStats,
                commissionStats,
                recentReferrals
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard'
        });
    }
};

// @desc    Get referrals
// @route   GET /api/affiliate/referrals
// @access  Private (Affiliate)
exports.getReferrals = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = { affiliateId: req.user._id };
        if (status) {
            query.status = status;
        }

        const referrals = await AffiliateReferral.find(query)
            .populate('referredUserId', 'name email createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await AffiliateReferral.countDocuments(query);

        res.json({
            success: true,
            data: referrals,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching referrals'
        });
    }
};

// @desc    Get commissions
// @route   GET /api/affiliate/commissions
// @access  Private (Affiliate)
exports.getCommissions = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = { affiliateId: req.user._id };
        if (status) {
            query.status = status;
        }

        const commissions = await AffiliateCommission.find(query)
            .populate('orderId', 'price status')
            .populate('referralId', 'referredUserId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await AffiliateCommission.countDocuments(query);

        res.json({
            success: true,
            data: commissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching commissions'
        });
    }
};

// @desc    Get affiliate stats
// @route   GET /api/affiliate/stats
// @access  Private (Affiliate)
exports.getStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        const commissionStats = await AffiliateCommission.getAffiliateStats(req.user._id);

        res.json({
            success: true,
            data: {
                affiliateCode: user.affiliateCode,
                commissionRate: user.affiliateCommissionRate,
                totalReferrals: user.affiliateTotalReferrals,
                conversions: user.affiliateConversions,
                totalEarnings: commissionStats.totalCommission,
                pendingEarnings: commissionStats.pendingCommission,
                paidEarnings: commissionStats.paidCommission
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats'
        });
    }
};

// @desc    Get promo tools
// @route   GET /api/affiliate/promo-tools
// @access  Private (Affiliate)
exports.getPromoTools = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        // Generate tracking link
        const trackingLink = `${baseUrl}/register?ref=${user.affiliateCode}`;

        // Get available banners (could be stored in settings)
        const banners = [
            {
                id: 'banner_1',
                name: 'Hero Banner',
                size: '728x90',
                image: '/banners/hero-banner.png',
                code: `<a href="${trackingLink}"><img src="${baseUrl}/banners/hero-banner.png" alt="BoostGG" /></a>`
            },
            {
                id: 'banner_2',
                name: 'Sidebar Banner',
                size: '300x250',
                image: '/banners/sidebar-banner.png',
                code: `<a href="${trackingLink}"><img src="${baseUrl}/banners/sidebar-banner.png" alt="BoostGG" /></a>`
            },
            {
                id: 'banner_3',
                name: 'Mobile Banner',
                size: '320x50',
                image: '/banners/mobile-banner.png',
                code: `<a href="${trackingLink}"><img src="${baseUrl}/banners/mobile-banner.png" alt="BoostGG" /></a>`
            }
        ];

        res.json({
            success: true,
            data: {
                affiliateCode: user.affiliateCode,
                trackingLink,
                banners
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching promo tools'
        });
    }
};

// @desc    Generate tracking link
// @route   POST /api/affiliate/track
// @access  Private (Affiliate)
exports.generateTrackingLink = async (req, res) => {
    try {
        const { destination } = req.body;
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        
        const user = await User.findById(req.user._id);
        
        const trackingLink = destination 
            ? `${destination}?ref=${user.affiliateCode}`
            : `${baseUrl}/register?ref=${user.affiliateCode}`;

        res.json({
            success: true,
            data: {
                affiliateCode: user.affiliateCode,
                trackingLink
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error generating tracking link'
        });
    }
};

// @desc    Request payout
// @route   POST /api/affiliate/payout/request
// @access  Private (Affiliate)
exports.requestPayout = async (req, res) => {
    try {
        const { amount, paymentMethod, paymentDetails } = req.body;
        
        const user = await User.findById(req.user._id);

        // Check minimum payout
        const minimumPayout = 50; // Could be from settings
        if (amount < minimumPayout) {
            return res.status(400).json({
                success: false,
                message: `Minimum payout is $${minimumPayout}`
            });
        }

        // Check available balance
        if (amount > user.affiliateEarnings) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient earnings'
            });
        }

        // Create payout request
        // For now, just update the user's pending earnings
        // In production, you'd create a Payout record
        await User.findByIdAndUpdate(req.user._id, {
            $inc: {
                affiliateEarnings: -amount,
                affiliatePendingEarnings: amount
            }
        });

        res.json({
            success: true,
            message: 'Payout request submitted',
            data: {
                amount,
                paymentMethod,
                status: 'pending'
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error requesting payout'
        });
    }
};
