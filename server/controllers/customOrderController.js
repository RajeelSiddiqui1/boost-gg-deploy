const CustomOrder = require('../models/CustomOrder');
const Game = require('../models/Game');
const logger = require('../config/logger');
const Joi = require('joi');

// @desc    Create custom order request
// @route   POST /api/v1/custom-orders
// @access  Private
exports.createCustomOrder = async (req, res, next) => {
    try {
        const schema = Joi.object({
            gameId: Joi.string().required(),
            message: Joi.string().min(10).max(2000).required(),
            budget: Joi.number().min(0).optional()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        // Check if game exists
        const game = await Game.findById(value.gameId);
        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        const customOrder = await CustomOrder.create({
            ...value,
            userId: req.user.id
        });

        logger.info(`Custom order created by user ${req.user.id} for game ${value.gameId}`);

        res.status(201).json({
            success: true,
            data: customOrder,
            message: 'Your custom request has been submitted. We will contact you soon!'
        });
    } catch (error) {
        logger.error(`Error creating custom order: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get all custom orders (Admin)
// @route   GET /api/v1/admin/custom-orders
// @access  Private/Admin
exports.getAdminCustomOrders = async (req, res, next) => {
    try {
        const customOrders = await CustomOrder.find()
            .populate('userId', 'name email avatar')
            .populate('gameId', 'title slug')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: customOrders.length,
            data: customOrders
        });
    } catch (error) {
        logger.error(`Error fetching custom orders: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
