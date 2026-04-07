const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const PromoCode = require('../models/PromoCode');

// @desc    Validate promo code (public)
// @route   POST /api/v1/promo/validate
// @access  Public
router.post('/validate', async (req, res) => {
    try {
        const { code, orderAmount = 0 } = req.body;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Promo code is required'
            });
        }
        
        const result = await PromoCode.validateCode(code, null, orderAmount);
        
        if (!result.valid) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }
        
        res.json({
            success: true,
            data: {
                code: result.promo.code,
                description: result.promo.description,
                discountType: result.promo.discountType,
                discountValue: result.promo.discountValue,
                discount: result.discount,
                minOrderAmount: result.promo.minOrderAmount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error validating promo code'
        });
    }
});

// @desc    Get all promo codes (Admin)
// @route   GET /api/v1/admin/promo
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (status) query.status = status;
        
        const promoCodes = await PromoCode.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await PromoCode.countDocuments(query);
        
        res.json({
            success: true,
            data: promoCodes,
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
            message: 'Error fetching promo codes'
        });
    }
});

// @desc    Create promo code (Admin)
// @route   POST /api/v1/admin/promo
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const promoData = {
            ...req.body,
            createdBy: req.user._id
        };
        
        const promoCode = await PromoCode.create(promoData);
        
        res.status(201).json({
            success: true,
            message: 'Promo code created successfully',
            data: promoCode
        });
    } catch (err) {
        console.error(err);
        
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Promo code already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error creating promo code'
        });
    }
});

// @desc    Update promo code (Admin)
// @route   PUT /api/v1/admin/promo/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);
        
        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: 'Promo code not found'
            });
        }
        
        // Don't allow changing code value
        delete req.body.code;
        
        Object.assign(promoCode, req.body);
        await promoCode.save();
        
        res.json({
            success: true,
            message: 'Promo code updated successfully',
            data: promoCode
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error updating promo code'
        });
    }
});

// @desc    Delete promo code (Admin)
// @route   DELETE /api/v1/admin/promo/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);
        
        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: 'Promo code not found'
            });
        }
        
        await promoCode.deleteOne();
        
        res.json({
            success: true,
            message: 'Promo code deleted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error deleting promo code'
        });
    }
});

// @desc    Get single promo code (Admin)
// @route   GET /api/v1/admin/promo/:id
// @access  Private (Admin)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id)
            .populate('createdBy', 'name email');
        
        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: 'Promo code not found'
            });
        }
        
        res.json({
            success: true,
            data: promoCode
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching promo code'
        });
    }
});

module.exports = router;
