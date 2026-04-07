const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../models/User');
const ProApplication = require('../models/ProApplication');
const User = require('../models/User');

// All routes require admin
router.use(protect);
router.use(authorize(ROLES.ADMIN));

// Get all PRO applications
router.get('/applications', async (req, res) => {
    try {
        const { status, proType, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (proType) query.proType = proType;

        const applications = await ProApplication.find(query)
            .populate('userId', 'name email avatar rating createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await ProApplication.countDocuments(query);

        res.json({
            success: true,
            data: applications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get single application
router.get('/applications/:id', async (req, res) => {
    try {
        const application = await ProApplication.findById(req.params.id)
            .populate('userId', 'name email avatar rating createdAt');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.json({ success: true, data: application });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Review application (approve/reject)
router.post('/applications/:id/review', async (req, res) => {
    try {
        const { status, reviewNotes } = req.body;

        const application = await ProApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        application.status = status;
        application.reviewNotes = {
            reviewerId: req.user._id,
            notes: reviewNotes,
            reviewedAt: new Date()
        };

        if (status === 'approved') {
            application.approvedAt = new Date();

            // Define default permissions based on proType
            let defaultPermissions = ['view_analytics'];
            const type = application.proType;

            if (type === 'booster') {
                defaultPermissions.push('manage_orders');
            } else if (type === 'gold_seller' || type === 'account_seller') {
                defaultPermissions.push('manage_inventory', 'manage_orders');
            } else if (type === 'content_creator' || type === 'blogger') {
                defaultPermissions.push('post_blog');
            }

            // Update user to PRO
            await User.findByIdAndUpdate(application.userId, {
                role: ROLES.PRO,
                proType: application.proType,
                proStatus: 'approved',
                isProVerified: true,
                permissions: defaultPermissions
            });
        } else {
            application.rejectionReason = reviewNotes;
        }

        await application.save();

        res.json({
            success: true,
            message: `Application ${status}`,
            data: application
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get all PROs
router.get('/pros', async (req, res) => {
    try {
        const { proType, proStatus, page = 1, limit = 20 } = req.query;

        const query = { role: ROLES.PRO };
        if (proType) query.proType = proType;
        if (proStatus) query.proStatus = proStatus;

        const pros = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: pros,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update PRO status
router.put('/pros/:id/status', async (req, res) => {
    try {
        const { proStatus, isProVerified } = req.body;

        const user = await User.findById(req.params.id);

        if (!user || user.role !== ROLES.PRO) {
            return res.status(404).json({ success: false, message: 'PRO not found' });
        }

        if (proStatus) user.proStatus = proStatus;
        if (isProVerified !== undefined) user.isProVerified = isProVerified;

        await user.save();

        res.json({
            success: true,
            message: 'PRO status updated',
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get all affiliates
router.get('/affiliates', async (req, res) => {
    try {
        const { affiliateType, page = 1, limit = 20 } = req.query;

        const query = { role: ROLES.AFFILIATE };
        if (affiliateType) query.affiliateType = affiliateType;

        const affiliates = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: affiliates,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update affiliate commission rate
router.put('/affiliates/:id/commission', async (req, res) => {
    try {
        const { commissionRate } = req.body;

        if (commissionRate < 0 || commissionRate > 100) {
            return res.status(400).json({ success: false, message: 'Commission rate must be 0-100' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { affiliateCommissionRate: commissionRate },
            { new: true }
        ).select('-password');

        if (!user || user.role !== ROLES.AFFILIATE) {
            return res.status(404).json({ success: false, message: 'Affiliate not found' });
        }

        res.json({
            success: true,
            message: 'Commission rate updated',
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
