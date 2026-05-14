const Deal = require('../models/Deal');

// @desc    Get all deals
// @route   GET /api/v1/deals
// @access  Public
exports.getDeals = async (req, res) => {
    try {
        const deals = await Deal.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: deals.length, data: deals });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single deal
// @route   GET /api/v1/deals/:id
// @access  Public
exports.getDeal = async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id);
        if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
        res.status(200).json({ success: true, data: deal });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new deal
// @route   POST /api/v1/deals
// @access  Private/Admin
exports.createDeal = async (req, res) => {
    try {
        const deal = await Deal.create(req.body);
        res.status(201).json({ success: true, data: deal });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update deal
// @route   PUT /api/v1/deals/:id
// @access  Private/Admin
exports.updateDeal = async (req, res) => {
    try {
        const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
        res.status(200).json({ success: true, data: deal });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete deal
// @route   DELETE /api/v1/deals/:id
// @access  Private/Admin
exports.deleteDeal = async (req, res) => {
    try {
        const deal = await Deal.findByIdAndDelete(req.params.id);
        if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
