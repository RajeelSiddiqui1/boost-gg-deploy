const User = require('../models/User');
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const Service = require('../models/Service');
const Game = require('../models/Game');

// @desc    Get admin analytics
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin only)
exports.getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProPlayers = await User.countDocuments({ role: 'pro' });
        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ status: 'completed' });

        // Calculate total revenue (all completed orders)
        const revenueData = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Get monthly revenue (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$price' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Get recent activity
        const recentOrders = await Order.find()
            .populate('userId', 'name')
            .populate('serviceId', 'title')
            .sort({ createdAt: -1 })
            .limit(10);

        const pendingPayouts = await Payout.find({ status: 'pending' })
            .populate('booster', 'name')
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalProPlayers,
                    totalOrders,
                    completedOrders,
                    totalRevenue
                },
                monthlyRevenue,
                recentOrders,
                pendingPayouts
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get PRO earnings (Admin view)
// @route   GET /api/v1/admin/pros/:id/earnings
// @access  Private (Admin only)
exports.getProEarnings = async (req, res) => {
    try {
        const pro = await User.findById(req.params.id);

        if (!pro || pro.role !== 'pro') {
            return res.status(404).json({ success: false, message: 'PRO not found' });
        }

        // Get earnings breakdown
        const completedOrders = await Order.aggregate([
            { $match: { pro: pro._id, status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$price' },
                    orderCount: { $sum: 1 },
                    avgOrderValue: { $avg: '$price' }
                }
            }
        ]);

        // Get pending earnings
        const pendingOrders = await Order.aggregate([
            { $match: { pro: pro._id, status: 'processing' } },
            {
                $group: {
                    _id: null,
                    pendingEarnings: { $sum: '$price' },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        // Get recent completed orders
        const recentCompleted = await Order.find({ pro: pro._id, status: 'completed' })
            .populate('serviceId', 'title')
            .sort({ completedAt: -1 })
            .limit(10);

        // Get payouts
        const payouts = await Payout.find({ booster: pro._id })
            .sort({ requestedAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                pro: {
                    _id: pro._id,
                    name: pro.name,
                    email: pro.email,
                    rating: pro.rating,
                    walletBalance: pro.walletBalance,
                    earnings: pro.earnings,
                    pendingEarnings: pro.pendingEarnings
                },
                completedOrders: completedOrders[0] || { totalEarnings: 0, orderCount: 0, avgOrderValue: 0 },
                pendingOrders: pendingOrders[0] || { pendingEarnings: 0, orderCount: 0 },
                recentCompleted,
                payouts
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/v1/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update user role/status (Admin)
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res) => {
    try {
        const userToUpdate = await User.findById(req.params.id);

        if (!userToUpdate) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Protect Super Admin Role
        if (userToUpdate.email === 'admin@boostgg.com' && req.body.role && req.body.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Super Admin role cannot be changed.' });
        }

        // Handle Status Update (Map 'active'/'suspended' to isActive boolean)
        if (req.body.status) {
            // Check if requester is Super Admin
            const requestingUser = await User.findById(req.user.id);
            if (requestingUser.email !== 'admin@boostgg.com') {
                return res.status(403).json({ success: false, message: 'Only Super Admin can change user status.' });
            }

            // Protect Super Admin Status
            if (userToUpdate.email === 'admin@boostgg.com') {
                return res.status(403).json({ success: false, message: 'Super Admin status cannot be changed.' });
            }

            // Map status string to isActive boolean
            req.body.isActive = req.body.status === 'active';
            delete req.body.status; // Remove status from body to prevent schema error if strict
        }

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
// @desc    Get all settings (Admin)
// @route   GET /api/v1/admin/settings
// @access  Private (Admin only)
exports.getSettings = async (req, res) => {
    try {
        const settings = await require('../models/Setting').find().sort({ group: 1, key: 1 });
        res.status(200).json({ success: true, count: settings.length, data: settings });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get public settings
// @route   GET /api/v1/public/settings
// @access  Public
exports.getPublicSettings = async (req, res) => {
    try {
        const settings = await require('../models/Setting').find({ isPublic: true }).select('key value');
        // Convert to object for easier frontend consumption
        const config = {};
        settings.forEach(s => {
            config[s.key] = s.value;
        });
        res.status(200).json({ success: true, data: config });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single user (Admin)
// @route   GET /api/v1/admin/users/:id
// @access  Private (Admin only)
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Protect Super Admin Deletion
        if (user.email === 'admin@boostgg.com') {
            return res.status(403).json({ success: false, message: 'Super Admin cannot be deleted.' });
        }

        await user.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update settings (Admin)
// @route   PUT /api/v1/admin/settings
// @access  Private (Admin only)
exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body; // Expecting an array of updates or object
        const results = [];

        // Handle both object {key: value} or array [{key, value}]
        if (Array.isArray(updates)) {
            for (const update of updates) {
                const setting = await require('../models/Setting').findOne({ key: update.key });
                if (setting) {
                    setting.value = update.value;
                    await setting.save();
                    results.push(setting);
                }
            }
        } else {
            // Object format
            const keys = Object.keys(updates);
            for (const key of keys) {
                const setting = await require('../models/Setting').findOne({ key });
                if (setting) {
                    setting.value = updates[key];
                    await setting.save();
                    results.push(setting);
                }
            }
        }

        res.status(200).json({ success: true, data: results });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Initialize default settings (Internal)
exports.seedSettings = async () => {
    const Setting = require('../models/Setting');
    const defaults = [
        { key: 'site_name', value: 'BoostGG', label: 'Site Name', group: 'general', isPublic: true },
        { key: 'site_description', value: 'Premium Gaming Services', label: 'Site Description', group: 'general', isPublic: true },
        { key: 'maintenance_mode', value: false, label: 'Maintenance Mode', group: 'general', type: 'boolean', isPublic: true },
        { key: 'support_email', value: 'support@boostgg.com', label: 'Support Email', group: 'email', isPublic: true },
        { key: 'allow_registration', value: true, label: 'Allow User Registration', group: 'security', type: 'boolean' },
        {
            key: 'currencies',
            value: {
                base: 'USD',
                supported: ['USD', 'EUR'],
                rates: { USD: 1, EUR: 0.92 },
                symbols: { USD: '$', EUR: '€' }
            },
            label: 'Currency Settings',
            group: 'general',
            type: 'json',
            isPublic: true
        }
    ];

    for (const def of defaults) {
        const exists = await Setting.findOne({ key: def.key });
        if (!exists) {
            await Setting.create(def);
        }
    }
};
