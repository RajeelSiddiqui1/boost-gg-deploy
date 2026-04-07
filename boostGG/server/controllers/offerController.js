const Offer = require('../models/Offer');
const logger = require('../config/logger');

// @desc    Get all offers for admin (includes inactive)
// @route   GET /api/v1/offers/admin/all
// @access  Private/Admin
exports.getAdminOffers = async (req, res, next) => {
    try {
        const { game } = req.query;
        const query = {};
        if (game) query.game = game;

        const offers = await Offer.find(query)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: offers.length,
            data: offers
        });
    } catch (error) {
        logger.error(`Error fetching admin offers: ${error.message}`);
        next(error);
    }
};

// @desc    Get all active offers
// @route   GET /api/v1/offers
// @access  Public
exports.getAllOffers = async (req, res, next) => {
    try {
        const { game, limit = 20, page = 1 } = req.query;

        const query = { isActive: true };
        if (game) query.game = game;
        if (req.query.isHot) query.isHot = req.query.isHot === 'true';
        if (req.query.search) {
            query.title = { $regex: req.query.search, $options: 'i' };
        }

        const offers = await Offer.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Offer.countDocuments(query);

        res.status(200).json({
            success: true,
            count: offers.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: offers
        });
    } catch (error) {
        logger.error(`Error fetching offers: ${error.message}`);
        next(error);
    }
};

// @desc    Get single offer
// @route   GET /api/v1/offers/:id
// @access  Public
exports.getOffer = async (req, res, next) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (!offer) {
            return res.status(404).json({
                success: false,
                error: 'Offer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: offer
        });
    } catch (error) {
        logger.error(`Error fetching offer ${req.params.id}: ${error.message}`);
        next(error);
    }
};

// @desc    Create offer
// @route   POST /api/v1/offers
// @access  Private/Admin
exports.createOffer = async (req, res, next) => {
    try {
        const offer = await Offer.create(req.body);

        logger.info(`Offer created: ${offer.title} by user ${req.user.id}`);

        res.status(201).json({
            success: true,
            data: offer
        });
    } catch (error) {
        logger.error(`Error creating offer: ${error.message}`);
        next(error);
    }
};

// @desc    Update offer
// @route   PUT /api/v1/offers/:id
// @access  Private/Admin
exports.updateOffer = async (req, res, next) => {
    try {
        const offer = await Offer.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!offer) {
            return res.status(404).json({
                success: false,
                error: 'Offer not found'
            });
        }

        logger.info(`Offer updated: ${offer.title} by user ${req.user.id}`);

        res.status(200).json({
            success: true,
            data: offer
        });
    } catch (error) {
        logger.error(`Error updating offer ${req.params.id}: ${error.message}`);
        next(error);
    }
};

// @desc    Toggle offer status
// @route   PATCH /api/v1/offers/admin/:id/status
// @access  Private/Admin
exports.toggleOfferStatus = async (req, res, next) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (!offer) {
            return res.status(404).json({
                success: false,
                error: 'Offer not found'
            });
        }

        offer.isActive = !offer.isActive;
        offer.updatedAt = Date.now();
        await offer.save();

        logger.info(`Offer status toggled: ${offer.title} to ${offer.isActive ? 'active' : 'inactive'}`);

        res.status(200).json({
            success: true,
            data: offer
        });
    } catch (error) {
        logger.error(`Error toggling offer status ${req.params.id}: ${error.message}`);
        next(error);
    }
};
// @desc    Delete offer
// @route   DELETE /api/v1/offers/:id
// @access  Private/Admin
exports.deleteOffer = async (req, res, next) => {
    try {
        const offer = await Offer.findByIdAndUpdate(
            req.params.id,
            { isActive: false, updatedAt: Date.now() },
            { new: true }
        );

        if (!offer) {
            return res.status(404).json({
                success: false,
                error: 'Offer not found'
            });
        }

        logger.info(`Offer soft deleted: ${offer.title} by user ${req.user.id}`);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        logger.error(`Error deleting offer ${req.params.id}: ${error.message}`);
        next(error);
    }
};
// @desc    Bulk delete offers
// @route   DELETE /api/v1/offers/admin/bulk
// @access  Private/Admin
exports.bulkDeleteOffers = async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an array of offer IDs'
            });
        }

        const result = await Offer.updateMany(
            { _id: { $in: ids } },
            { isActive: false, updatedAt: Date.now() }
        );

        logger.info(`Bulk delete offers: ${result.modifiedCount} offers soft deleted by user ${req.user.id}`);

        res.status(200).json({
            success: true,
            count: result.modifiedCount,
            data: {}
        });
    } catch (error) {
        logger.error(`Error bulk deleting offers: ${error.message}`);
        next(error);
    }
};
