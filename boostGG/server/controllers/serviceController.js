const Service = require('../models/Service');
const Game = require('../models/Game');
const logger = require('../config/logger');
const { calculateServicePrice } = require('../utils/priceCalculator');
const { serviceSchemas } = require('../utils/validationSchemas');
const Joi = require('joi');

// Helper function to validate request body
const validate = (schema, data) => {
    return schema.validate(data, { abortEarly: false, stripUnknown: true });
};

// Helper function to delete file
const deleteFile = (filePath) => {
    const fs = require('fs');
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// Helper function to get file URL
const getFileUrl = (filename) => {
    if (!filename) return '';
    return `/uploads/services/${filename}`;
};

// @desc    Get all services (public)
// @route   GET /api/v1/services
// @access  Public
exports.getAllServices = async (req, res, next) => {
    try {
        const { error, value } = validate(serviceSchemas.query, req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        const {
            gameId,
            categoryId,
            categorySlug,
            serviceType,
            status,
            isActive,
            isFeatured,
            is_hot_offer,
            search,
            tags,
            page = 1,
            limit = 20,
            sortBy = 'displayOrder',
            sortOrder = 'asc'
        } = value;

        // Build query
        const query = {};

        if (gameId) query.gameId = gameId;
        if (categoryId) query.categoryId = categoryId;
        if (categorySlug) query.categorySlug = categorySlug;
        if (serviceType) query.serviceType = serviceType;
        if (status) query.status = status;
        if (isActive !== undefined) query.isActive = isActive;
        if (isFeatured !== undefined) query.isFeatured = isFeatured;
        if (is_hot_offer !== undefined) query.is_hot_offer = is_hot_offer;
        if (tags) query.tags = { $in: tags.split(',').map(t => t.trim().toLowerCase()) };

        // Text search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Default to active services for public
        if (!status && !isActive) {
            query.isActive = true;
            query.status = 'active';
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [services, total] = await Promise.all([
            Service.find(query)
                .populate('gameId', 'name title slug icon bgImage characterImage banner image category')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Service.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: services,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error(`Error fetching services: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get WoW specific services with counters (SkyCoach style)
// @route   GET /api/v1/games/wow/services
// @access  Public
exports.getWoWServices = async (req, res, next) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            sortBy = 'popularityScore',
            sortOrder = 'desc',
            page = 1,
            limit = 12
        } = req.query;

        // Find WoW game first
        const wowGame = await Game.findOne({ slug: { $in: ['wow', 'world-of-warcraft'] } });
        if (!wowGame) {
            return res.status(404).json({ success: false, error: 'WoW game not found in system' });
        }

        // Build Match Object
        const match = {
            gameId: wowGame._id,
            isActive: true,
            status: 'active'
        };

        if (category && category !== 'all' && category !== 'hot') {
            match.categorySlug = category;
        } else if (category === 'hot') {
            match.isFeatured = true;
        }

        if (minPrice || maxPrice) {
            match.price = {};
            if (minPrice) match.price.$gte = Number(minPrice);
            if (maxPrice) match.price.$lte = Number(maxPrice);
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        // Aggregation for services + counts
        const services = await Service.aggregate([
            { $match: match },
            // Add orders count per service
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'serviceId',
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    ordersCount: { $size: '$orders' }
                }
            },
            { $project: { orders: 0 } },
            { $sort: sort },
            { $skip: skip },
            { $limit: Number(limit) }
        ]);

        const total = await Service.countDocuments(match);

        // Global counts for WoW
        const globalStats = await Service.aggregate([
            { $match: { gameId: wowGame._id, isActive: true, status: 'active' } },
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'serviceId',
                    as: 'orders'
                }
            },
            {
                $group: {
                    _id: null,
                    offersCount: { $sum: 1 },
                    totalOrders: { $sum: { $size: '$orders' } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: services,
            stats: globalStats[0] || { offersCount: 0, totalOrders: 0 },
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error(`Error fetching WoW services: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get services by game ID
// @route   GET /api/v1/services/game/:gameId
// @access  Public
exports.getServicesByGame = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const { serviceType, activeOnly = 'true' } = req.query;

        // Check if game exists
        const game = await Game.findById(gameId).select('title slug icon bgImage isActive status');
        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        // Build query
        const query = { gameId };

        if (serviceType) {
            query.serviceType = serviceType;
        }

        if (activeOnly === 'true') {
            query.isActive = true;
            query.status = 'active';
        }

        const services = await Service.find(query)
            .populate('gameId', 'name title slug icon bgImage characterImage banner image category')
            .sort({ displayOrder: 1, createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: services,
            count: services.length
        });
    } catch (error) {
        logger.error(`Error fetching services for game ${req.params.gameId}: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get single service
// @route   GET /api/v1/services/:id
// @access  Public
exports.getService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('gameId', 'name title slug icon bgImage characterImage banner image category');

        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }

        // Increment views
        service.views += 1;
        await service.save();

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        logger.error(`Error fetching service ${req.params.id}: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get service by slug
// @route   GET /api/v1/services/slug/:slug
// @access  Public
exports.getServiceBySlug = async (req, res, next) => {
    try {
        const service = await Service.findOne({ slug: req.params.slug })
            .populate('gameId', 'name title slug icon bgImage characterImage banner image category');

        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }

        // Increment views
        service.views += 1;
        await service.save();

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        logger.error(`Error fetching service by slug ${req.params.slug}: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Calculate service price
// @route   POST /api/v1/services/calculate-price
// @access  Public
exports.calculateServicePrice = async (req, res, next) => {
    try {
        const { error, value } = validate(serviceSchemas.priceCalc, req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        const { serviceId, params } = value;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }

        const price = calculateServicePrice(service.pricingRules, params);

        res.status(200).json({
            success: true,
            data: { price }
        });
    } catch (error) {
        logger.error(`Error calculating price: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get all services for admin (includes inactive)
// @route   GET /api/v1/services/admin/all
// @access  Private/Admin
exports.getAdminServices = async (req, res, next) => {
    try {
        const { error, value } = validate(serviceSchemas.query, req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        const {
            gameId,
            serviceType,
            status,
            isActive,
            isFeatured,
            search,
            tags,
            page = 1,
            limit = 20,
            sortBy = 'displayOrder',
            sortOrder = 'asc'
        } = value;

        // Build query (no default filter for admin)
        const query = {};

        if (gameId) query.gameId = gameId;
        if (serviceType) query.serviceType = serviceType;
        if (status) query.status = status;
        if (isActive !== undefined) query.isActive = isActive;
        if (isFeatured !== undefined) query.isFeatured = isFeatured;
        if (tags) query.tags = { $in: tags.split(',').map(t => t.trim().toLowerCase()) };

        // Text search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [services, total] = await Promise.all([
            Service.find(query)
                .populate('gameId', 'name title slug icon bgImage characterImage banner image')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Service.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: services,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error(`Error fetching admin services: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Create service
// @route   POST /api/v1/services/admin
// @access  Private/Admin
exports.createService = async (req, res, next) => {
    try {
        // Map name to title if title is not provided (backward compatibility)
        if (req.body.name && !req.body.title) {
            req.body.title = req.body.name;
        }

        // Enforce data types for multipart/form-data (strings to objects/arrays)
        const fieldsToParse = ['pricing', 'features', 'requirements', 'tags', 'platforms', 'regions', 'serviceOptions', 'sidebarSections', 'speedOptions', 'faqs', 'dynamicFields', 'sampleReviews', 'meta'];
        fieldsToParse.forEach(field => {
            if (typeof req.body[field] === 'string' && req.body[field].trim() !== '') {
                try {
                    req.body[field] = JSON.parse(req.body[field]);
                } catch (e) {
                    // If it's not JSON, and it's an array field, convert to array
                    // Handle comma-separated strings as well
                    if (['features', 'requirements', 'tags', 'platforms', 'regions'].includes(field)) {
                        req.body[field] = req.body[field]
                            .split(',')
                            .map(item => item.trim())
                            .filter(item => item !== '');
                    }
                }
            } else if (typeof req.body[field] === 'string' && req.body[field].trim() === '') {
                // Handle empty strings for array/object fields
                if (['features', 'requirements', 'tags', 'platforms', 'regions', 'serviceOptions'].includes(field)) {
                    req.body[field] = [];
                } else if (field === 'pricing') {
                    req.body[field] = undefined;
                }
            }
        });

        // Map game slugs/names to Mongo ObjectIds
        const mongoose = require('mongoose');
        const Category = require('../models/Category');

        if (req.body.gameId && !mongoose.Types.ObjectId.isValid(req.body.gameId)) {
            const game = await Game.findOne({ $or: [{ slug: req.body.gameId }, { title: req.body.gameId }, { name: req.body.gameId }] });
            if (game) req.body.gameId = game._id.toString();
        }

        // Map category slugs/names to Mongo ObjectIds
        const categoryInput = req.body.categoryId || req.body.categorySlug || req.body.category;
        if (categoryInput && !mongoose.Types.ObjectId.isValid(categoryInput)) {
            const cat = await Category.findOne({ $or: [{ slug: categoryInput }, { name: categoryInput }] });
            if (cat) {
                req.body.categoryId = cat._id.toString();
                req.body.categorySlug = cat.slug;
            } else {
                // Cannot find category, it will fail validation if required.
                req.body.categoryId = categoryInput;
            }
        } else if (req.body.category && mongoose.Types.ObjectId.isValid(req.body.category)) {
            req.body.categoryId = req.body.category;
        }

        const { error, value } = validate(serviceSchemas.create, req.body);
        if (error) {
            console.error("SERVICE CREATE VALIDATION ERROR:", error.details.map(d => d.message));
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        // Ensure title is set from name if provided
        if (!value.title && value.name) {
            value.title = value.name;
        }

        // Validate pricing if provided
        if (value.pricing) {
            const pricingValidation = validatePricingConfig(value.pricing);
            if (!pricingValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid pricing configuration',
                    details: pricingValidation.errors
                });
            }
        }

        // Check if game exists
        const game = await Game.findById(value.gameId);
        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        // Handle icon upload if present
        if (req.file) {
            value.icon = getFileUrl(req.file.filename);
        }

        const service = await Service.create(value);

        // Update game's services array and count
        await Game.findByIdAndUpdate(value.gameId, {
            $addToSet: { serviceIds: service._id },
            $inc: { servicesCount: 1 },
            updatedAt: Date.now()
        });

        // Populate game info
        await service.populate('gameId', 'name title slug icon bgImage characterImage banner image');

        logger.info(`Service created: ${service.name} by user ${req.user?.id || 'admin'}`);

        res.status(201).json({
            success: true,
            data: service
        });
    } catch (error) {
        logger.error(`Error creating service: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update service
// @route   PUT /api/v1/services/admin/:id
// @access  Private/Admin
exports.updateService = async (req, res, next) => {
    try {
        // Map name to title if title is not provided (backward compatibility)
        if (req.body.name && !req.body.title) {
            req.body.title = req.body.name;
        }

        // Enforce data types for multipart/form-data (strings to objects/arrays)
        const fieldsToParse = ['pricing', 'features', 'requirements', 'tags', 'platforms', 'regions', 'serviceOptions', 'sidebarSections', 'speedOptions', 'faqs', 'dynamicFields', 'sampleReviews', 'meta'];
        fieldsToParse.forEach(field => {
            if (typeof req.body[field] === 'string' && req.body[field].trim() !== '') {
                try {
                    req.body[field] = JSON.parse(req.body[field]);
                } catch (e) {
                    // If it's not JSON, and it's an array field, convert to array
                    // Handle comma-separated strings as well
                    if (['features', 'requirements', 'tags', 'platforms', 'regions'].includes(field)) {
                        req.body[field] = req.body[field]
                            .split(',')
                            .map(item => item.trim())
                            .filter(item => item !== '');
                    }
                }
            } else if (typeof req.body[field] === 'string' && req.body[field].trim() === '') {
                // Handle empty strings for array/object fields
                if (['features', 'requirements', 'tags', 'platforms', 'regions', 'serviceOptions'].includes(field)) {
                    req.body[field] = [];
                } else if (field === 'pricing') {
                    req.body[field] = undefined;
                }
            }
        });

        // Map game slugs/names to Mongo ObjectIds
        const mongoose = require('mongoose');
        const Category = require('../models/Category');

        if (req.body.gameId && !mongoose.Types.ObjectId.isValid(req.body.gameId)) {
            const game = await Game.findOne({ $or: [{ slug: req.body.gameId }, { title: req.body.gameId }, { name: req.body.gameId }] });
            if (game) req.body.gameId = game._id.toString();
        }

        // Map category slugs/names to Mongo ObjectIds
        const categoryInput = req.body.categoryId || req.body.categorySlug || req.body.category;
        if (categoryInput && !mongoose.Types.ObjectId.isValid(categoryInput)) {
            const cat = await Category.findOne({ $or: [{ slug: categoryInput }, { name: categoryInput }] });
            if (cat) {
                req.body.categoryId = cat._id.toString();
                req.body.categorySlug = cat.slug;
            } else {
                // Cannot find category, it will fail validation if required.
                req.body.categoryId = categoryInput;
            }
        } else if (req.body.category && mongoose.Types.ObjectId.isValid(req.body.category)) {
            req.body.categoryId = req.body.category;
        }

        const { error, value } = validate(serviceSchemas.update, req.body);
        if (error) {
            console.error("SERVICE UPDATE VALIDATION ERROR:", error.details.map(d => d.message));
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        // Ensure title is set from name if provided
        if (!value.title && value.name) {
            value.title = value.name;
        }

        // Validate pricing if provided
        if (value.pricing) {
            const pricingValidation = validatePricingConfig(value.pricing);
            if (!pricingValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid pricing configuration',
                    details: pricingValidation.errors
                });
            }
        }

        let service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }

        // Handle icon upload if present
        if (req.file) {
            // Delete old icon
            if (service.icon) {
                const oldFilename = require('path').basename(service.icon);
                const oldFilePath = require('path').join(__dirname, '../uploads/services', oldFilename);
                deleteFile(oldFilePath);
            }
            value.icon = getFileUrl(req.file.filename);
        }

        // Track game change for updating counts
        const oldGameId = service.gameId.toString();
        const newGameId = value.gameId || oldGameId;

        service = await Service.findByIdAndUpdate(
            req.params.id,
            { ...value, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).populate('gameId', 'name title slug icon bgImage characterImage banner image');

        // Update game service counts if game changed
        if (oldGameId !== newGameId) {
            await Game.findByIdAndUpdate(oldGameId, {
                $inc: { servicesCount: -1 },
                updatedAt: Date.now()
            });
            await Game.findByIdAndUpdate(newGameId, {
                $inc: { servicesCount: 1 },
                updatedAt: Date.now()
            });
        }

        logger.info(`Service updated: ${service.name} by user ${req.user?.id || 'admin'}`);

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        logger.error(`Error updating service ${req.params.id}: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete service (hard delete)
// @route   DELETE /api/v1/services/admin/:id
// @access  Private/Admin
exports.deleteService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }

        const gameId = service.gameId;

        // Delete icon file if exists
        if (service.icon) {
            const filename = require('path').basename(service.icon);
            const filePath = require('path').join(__dirname, '../uploads/services', filename);
            deleteFile(filePath);
        }

        await service.deleteOne();

        // Update game's services array and count
        await Game.findByIdAndUpdate(gameId, {
            $pull: { serviceIds: service._id },
            $inc: { servicesCount: -1 },
            updatedAt: Date.now()
        });

        logger.info(`Service deleted: ${service.name} by user ${req.user?.id || 'admin'}`);

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        logger.error(`Error deleting service ${req.params.id}: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Toggle service status
// @route   PATCH /api/v1/services/admin/:id/status
// @access  Private/Admin
exports.toggleServiceStatus = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }

        service.status = service.status === 'active' ? 'inactive' : 'active';
        service.isActive = service.status === 'active';
        service.updatedAt = Date.now();
        await service.save();

        logger.info(`Service status toggled: ${service.name} to ${service.status}`);

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        logger.error(`Error toggling service status ${req.params.id}: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Bulk update services
// @route   PATCH /api/v1/services/admin/bulk
// @access  Private/Admin
exports.bulkUpdateServices = async (req, res, next) => {
    try {
        const { error, value } = validate(serviceSchemas.bulk, req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        const { ids, action } = value;

        let update = {};

        switch (action) {
            case 'activate':
                update = { isActive: true, status: 'active', updatedAt: Date.now() };
                break;
            case 'deactivate':
                update = { isActive: false, status: 'inactive', updatedAt: Date.now() };
                break;
            case 'delete':
                // Get services to delete (for cleaning up files and updating game counts)
                const servicesToDelete = await Service.find({ _id: { $in: ids } });

                // Delete files
                for (const service of servicesToDelete) {
                    if (service.icon) {
                        const filename = require('path').basename(service.icon);
                        const filePath = require('path').join(__dirname, '../uploads/services', filename);
                        deleteFile(filePath);
                    }
                }

                // Update game counts
                const gameCountMap = {};
                for (const service of servicesToDelete) {
                    const gameId = service.gameId.toString();
                    gameCountMap[gameId] = (gameCountMap[gameId] || 0) + 1;
                }

                for (const [gameId, count] of Object.entries(gameCountMap)) {
                    await Game.findByIdAndUpdate(gameId, {
                        $inc: { servicesCount: -count },
                        updatedAt: Date.now()
                    });
                }

                await Service.deleteMany({ _id: { $in: ids } });

                logger.info(`Bulk deleted ${ids.length} services by user ${req.user?.id || 'admin'}`);

                return res.status(200).json({
                    success: true,
                    count: ids.length,
                    message: `${ids.length} services deleted`
                });
        }

        const result = await Service.updateMany(
            { _id: { $in: ids } },
            update
        );

        logger.info(`Bulk updated ${result.modifiedCount} services: ${action} by user ${req.user?.id || 'admin'}`);

        res.status(200).json({
            success: true,
            count: result.modifiedCount,
            data: result
        });
    } catch (error) {
        logger.error(`Error bulk updating services: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Reorder services
// @route   PATCH /api/v1/services/admin/reorder
// @access  Private/Admin
exports.reorderServices = async (req, res, next) => {
    try {
        const { services } = req.body;

        if (!services || !Array.isArray(services)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request format'
            });
        }

        // Update each service's display order
        const updatePromises = services.map(({ id, displayOrder }) =>
            Service.findByIdAndUpdate(id, { displayOrder, updatedAt: Date.now() })
        );

        await Promise.all(updatePromises);

        logger.info(`Services reordered by user ${req.user?.id || 'admin'}`);

        res.status(200).json({
            success: true,
            message: 'Services reordered successfully'
        });
    } catch (error) {
        logger.error(`Error reordering services: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Validate pricing configuration
// @route   POST /api/v1/services/admin/validate-pricing
// @access  Private/Admin
exports.validatePricing = async (req, res, next) => {
    try {
        const { pricing } = req.body;

        if (!pricing) {
            return res.status(400).json({
                success: false,
                error: 'Pricing configuration is required'
            });
        }

        const validation = validatePricingConfig(pricing);

        res.status(200).json({
            success: true,
            isValid: validation.isValid,
            errors: validation.errors
        });
    } catch (error) {
        logger.error(`Error validating pricing: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Helper function to validate pricing configuration
const validatePricingConfig = (pricing) => {
    const errors = [];

    if (!pricing.type) {
        errors.push('Pricing type is required');
    } else if (!['fixed', 'per_level', 'per_win', 'hourly', 'tiered', 'dynamic', 'quantity'].includes(pricing.type)) {
        errors.push('Invalid pricing type');
    }

    if (pricing.type === 'fixed' && (pricing.basePrice === undefined || pricing.basePrice < 0)) {
        errors.push('Base price is required and must be non-negative for fixed pricing');
    }

    if (['per_level', 'per_win', 'hourly'].includes(pricing.type) && (pricing.pricePerUnit === undefined || pricing.pricePerUnit < 0)) {
        errors.push('Price per unit is required and must be non-negative');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
