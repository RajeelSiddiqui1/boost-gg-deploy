const Payout = require('../models/Payout');
const User = require('../models/User');

// @desc    Request payout
// @route   POST /api/v1/payouts/request
// @access  Private (Pro only)
exports.requestPayout = async (req, res) => {
    try {
        const { amount, method, accountDetails } = req.body;
        const user = await User.findById(req.user.id);

        // Validate user is a pro
        if (user.role !== 'pro') {
            return res.status(403).json({ success: false, message: 'Only PRO players can request payouts' });
        }

        // Check if user has enough earnings
        if (user.earnings < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient earnings balance' });
        }

        // Minimum payout amount
        if (amount < 1000) {
            return res.status(400).json({ success: false, message: 'Minimum payout amount is Rs. 1000' });
        }

        // Create payout request
        const payout = await Payout.create({
            booster: req.user.id,
            amount,
            method,
            accountDetails
        });

        // Move earnings to pending
        user.earnings -= amount;
        user.pendingEarnings += amount;
        await user.save({ validateBeforeSave: false });

        res.status(201).json({ success: true, data: payout });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get my payouts
// @route   GET /api/v1/payouts/me
// @access  Private (Pro only)
exports.getMyPayouts = async (req, res) => {
    try {
        const payouts = await Payout.find({ booster: req.user.id })
            .sort({ requestedAt: -1 });

        res.status(200).json({ success: true, data: payouts });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all payouts (Admin)
// @route   GET /api/v1/payouts
// @access  Private (Admin only)
exports.getAllPayouts = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const payouts = await Payout.find(filter)
            .populate('booster', 'name email')
            .sort({ requestedAt: -1 });

        res.status(200).json({ success: true, data: payouts });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Approve/Reject payout
// @route   PUT /api/v1/payouts/:id
// @access  Private (Admin only)
exports.updatePayout = async (req, res) => {
    try {
        const { status, notes, rejectionReason } = req.body;
        const payout = await Payout.findById(req.params.id);

        if (!payout) {
            return res.status(404).json({ success: false, message: 'Payout not found' });
        }

        if (payout.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Payout already processed' });
        }

        payout.status = status;
        payout.processedAt = Date.now();
        payout.processedBy = req.user.id;
        if (notes) payout.notes = notes;
        if (rejectionReason) payout.rejectionReason = rejectionReason;

        await payout.save();

        // If rejected, return money to earnings
        if (status === 'rejected') {
            const user = await User.findById(payout.booster);
            user.pendingEarnings -= payout.amount;
            user.earnings += payout.amount;
            await user.save({ validateBeforeSave: false });
        }

        // If approved, deduct from pending
        if (status === 'approved' || status === 'paid') {
            const user = await User.findById(payout.booster);
            user.pendingEarnings -= payout.amount;
            await user.save({ validateBeforeSave: false });
        }

        res.status(200).json({ success: true, data: payout });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
