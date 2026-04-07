const Game = require('../models/Game');
const Service = require('../models/Service');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const logger = require('../config/logger');
const path = require('path');
const fs = require('fs');

// Helper function to delete file
const deleteFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// Helper function to get file URL
const getFileUrl = (filename) => {
    return `/uploads/games/${filename}`;
};

// @desc    Get all active games with dynamic counts (Public)
// @route   GET /api/games
// @access  Public
exports.getAllGames = async (req, res, next) => {
    try {
        const { status, isHot, limit, skip } = req.query;
        const query = { isActive: true };

        if (status) query.status = status;
        else query.status = 'active';

        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }

        if (isHot !== undefined) {
            query.isHot = isHot === 'true';
        }

        // Use aggregation to get games with dynamic counts
        const games = await Game.getGamesWithCounts({
            status: query.status,
            isActive: query.isActive,
            isHot: query.isHot,
            name: query.name, // Pass name regex filter
            limit: parseInt(limit) || undefined,
            skip: parseInt(skip) || undefined
        });

        res.status(200).json({
            success: true,
            count: games.length,
            data: games
        });
    } catch (error) {
        logger.error(`Error fetching games: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get all games for admin with dynamic counts (includes inactive)
// @route   GET /api/games/admin/all
// @access  Private/Admin
exports.getAdminGames = async (req, res, next) => {
    try {
        const { limit, skip } = req.query;

        // Use aggregation to get games with dynamic counts
        const games = await Game.getGamesWithCounts({
            limit: parseInt(limit) || undefined,
            skip: parseInt(skip) || undefined
        });

        res.status(200).json({
            success: true,
            count: games.length,
            data: games
        });
    } catch (error) {
        logger.error(`Error fetching admin games: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get single game with dynamic counts
// @route   GET /api/games/:id
// @access  Public
exports.getGame = async (req, res, next) => {
    try {
        const gameId = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(gameId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid game ID'
            });
        }

        // Use aggregation to get game with dynamic counts
        const games = await Game.getGameWithCounts(gameId);

        if (!games || games.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        res.status(200).json({
            success: true,
            data: games[0]
        });
    } catch (error) {
        logger.error(`Error fetching game ${req.params.id}: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Create game with images
// @route   POST /api/admin/games
// @access  Private/Admin
exports.createGame = async (req, res, next) => {
    try {
        const { title, subtitle, description, category, displayOrder, status, offersCount, servicesCount, ordersCount } = req.body;

        // Check if images were uploaded
        if (!req.files || !req.files.bgImage) {
            return res.status(400).json({
                success: false,
                error: 'Background image is required'
            });
        }

        const gameData = {
            name: title,
            subtitle: subtitle || '',
            description: description || '',
            category: category || 'Other',
            bgImage: getFileUrl(req.files.bgImage[0].filename),
            characterImage: req.files.characterImage ? getFileUrl(req.files.characterImage[0].filename) : '',
            icon: req.files.icon ? getFileUrl(req.files.icon[0].filename) : '',
            banner: req.files.banner ? getFileUrl(req.files.banner[0].filename) : '',
            image: getFileUrl(req.files.bgImage[0].filename), // Backward compatibility
            displayOrder: parseInt(displayOrder) || 0,
            offersCount: parseInt(offersCount) || 0,
            servicesCount: parseInt(servicesCount) || 0,
            ordersCount: parseInt(ordersCount) || 0,
            status: status || 'active',
            isPopular: req.body.isPopular === 'true' || req.body.isPopular === true,
            isHot: req.body.isHot === 'true' || req.body.isHot === true,
            serviceCategories: req.body.serviceCategories ? (typeof req.body.serviceCategories === 'string' ? JSON.parse(req.body.serviceCategories) : req.body.serviceCategories) : []
        };

        const game = await Game.create(gameData);

        // --- AUTOMATIC GENERATION (Skycoach Style) ---
        const CurrencyListing = require('../models/CurrencyListing');
        const AccountListing = require('../models/AccountListing');

        // 1. Generate 10-15 Currencies
        const currencyCount = Math.floor(Math.random() * 6) + 10; // 10-15
        const regions = ['EU', 'US', 'Oceanic', 'Asia'];
        const methods = ['face-to-face', 'mail', 'auction-house'];

        const currencies = [];
        for (let i = 0; i < currencyCount; i++) {
            const region = regions[Math.floor(Math.random() * regions.length)];
            const selectedMethod = methods[Math.floor(Math.random() * methods.length)];
            currencies.push({
                gameId: game._id,
                gameSlug: game.slug,
                currencyType: 'Gold',
                server: `${region} Server ${i + 1}`,
                region: region,
                pricePerUnit: (Math.random() * 0.05 + 0.01).toFixed(4),
                minQuantity: 1000,
                maxQuantity: 1000000,
                deliveryMethods: [selectedMethod],
                defaultDeliveryMethod: selectedMethod,
                estimatedDeliveryHours: 1,
                deliveryTimeText: '15-60 minutes',
                isActive: true,
                status: 'active'
            });
        }
        await CurrencyListing.insertMany(currencies);

        // 2. Generate 20-25 Accounts
        const accountCount = Math.floor(Math.random() * 6) + 20; // 20-25
        const rankTiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Challenger'];

        const accounts = [];
        for (let i = 0; i < accountCount; i++) {
            const tier = rankTiers[Math.floor(Math.random() * rankTiers.length)];
            const price = Math.floor(Math.random() * 450) + 50;
            accounts.push({
                gameId: game._id,
                gameSlug: game.slug,
                title: `${tier} Account #${i + 1} - High Winrate`,
                price: price,
                originalPrice: price + 50,
                rank: `${tier} IV`,
                rankTier: tier,
                region: regions[Math.floor(Math.random() * regions.length)],
                server: 'Main',
                level: Math.floor(Math.random() * 100) + 30,
                instantDelivery: true,
                secureTransfer: true,
                status: 'active',
                isActive: true,
                specifications: {
                    skinsCount: Math.floor(Math.random() * 50),
                    itemsCount: Math.floor(Math.random() * 100),
                    winRate: Math.floor(Math.random() * 20) + 50
                },
                highlights: ['Full Access', 'Instant Delivery', 'High Security']
            });
        }
        await AccountListing.insertMany(accounts);

        logger.info(`Game created with auto-content: ${game.name} by user ${req.user?.id || 'admin'}`);

        res.status(201).json({
            success: true,
            data: game
        });
    } catch (error) {
        logger.error(`Error creating game: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update game
// @route   PUT /api/admin/games/:id
// @access  Private/Admin
exports.updateGame = async (req, res, next) => {
    try {
        let game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        const { title, subtitle, description, category, displayOrder, status, offersCount, servicesCount, ordersCount } = req.body;

        // Prepare update data
        const updateData = {
            name: title || game.name, // Use name field
            subtitle: subtitle !== undefined ? subtitle : game.subtitle,
            description: description !== undefined ? description : game.description,
            category: category || game.category,
            displayOrder: displayOrder !== undefined ? (parseInt(displayOrder) || 0) : game.displayOrder,
            offersCount: offersCount !== undefined ? (parseInt(offersCount) || 0) : game.offersCount,
            servicesCount: servicesCount !== undefined ? (parseInt(servicesCount) || 0) : game.servicesCount,
            ordersCount: ordersCount !== undefined ? (parseInt(ordersCount) || 0) : game.ordersCount,
            status: status || game.status,
            isPopular: req.body.isPopular !== undefined ? (req.body.isPopular === 'true' || req.body.isPopular === true) : game.isPopular,
            isHot: req.body.isHot !== undefined ? (req.body.isHot === 'true' || req.body.isHot === true) : game.isHot,
            serviceCategories: req.body.serviceCategories ? (typeof req.body.serviceCategories === 'string' ? JSON.parse(req.body.serviceCategories) : req.body.serviceCategories) : game.serviceCategories,
            updatedAt: Date.now()
        };

        // Handle image updates
        if (req.files) {
            if (req.files.bgImage) {
                if (game.bgImage) {
                    const oldFilename = path.basename(game.bgImage);
                    deleteFile(path.join(__dirname, '../uploads/games', oldFilename));
                }
                updateData.bgImage = getFileUrl(req.files.bgImage[0].filename);
                updateData.image = getFileUrl(req.files.bgImage[0].filename);
            }
            if (req.files.characterImage) {
                if (game.characterImage) {
                    const oldFilename = path.basename(game.characterImage);
                    deleteFile(path.join(__dirname, '../uploads/games', oldFilename));
                }
                updateData.characterImage = getFileUrl(req.files.characterImage[0].filename);
            }
            if (req.files.icon) {
                if (game.icon) {
                    const oldFilename = path.basename(game.icon);
                    deleteFile(path.join(__dirname, '../uploads/games', oldFilename));
                }
                updateData.icon = getFileUrl(req.files.icon[0].filename);
            }
            if (req.files.banner) {
                if (game.banner) {
                    const oldFilename = path.basename(game.banner);
                    deleteFile(path.join(__dirname, '../uploads/games', oldFilename));
                }
                updateData.banner = getFileUrl(req.files.banner[0].filename);
            }
        }

        game = await Game.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        logger.info(`Game updated: ${game.name} by user ${req.user?.id || 'admin'}`);

        res.status(200).json({
            success: true,
            data: game
        });
    } catch (error) {
        logger.error(`Error updating game ${req.params.id}: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete game (hard delete)
// @route   DELETE /api/v1/games/admin/:id
// @access  Private/Admin
exports.deleteGame = async (req, res, next) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        // Delete associated images from disk
        if (game.bgImage) deleteFile(path.join(__dirname, '../uploads/games', path.basename(game.bgImage)));
        if (game.characterImage) deleteFile(path.join(__dirname, '../uploads/games', path.basename(game.characterImage)));
        if (game.icon) deleteFile(path.join(__dirname, '../uploads/games', path.basename(game.icon)));
        if (game.banner) deleteFile(path.join(__dirname, '../uploads/games', path.basename(game.banner)));

        await game.deleteOne();

        logger.info(`Game hard deleted: ${game.name} by user ${req.user?.id || 'admin'}`);

        res.status(200).json({
            success: true,
            message: 'Game deleted successfully'
        });
    } catch (error) {
        logger.error(`Error deleting game ${req.params.id}: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Toggle game status
// @route   PATCH /api/v1/games/admin/:id/status
// @access  Private/Admin
exports.toggleGameStatus = async (req, res, next) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        game.status = game.status === 'active' ? 'inactive' : 'active';
        game.isActive = game.status === 'active'; // Sync isActive with status
        game.updatedAt = Date.now();
        await game.save();

        logger.info(`Game status toggled: ${game.name} to ${game.status}`);

        res.status(200).json({
            success: true,
            data: game
        });
    } catch (error) {
        logger.error(`Error toggling game status ${req.params.id}: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Update display order for multiple games
// @route   PATCH /api/v1/games/admin/reorder
// @access  Private/Admin
exports.reorderGames = async (req, res, next) => {
    try {
        const { games } = req.body; // Array of { id, displayOrder }

        if (!games || !Array.isArray(games)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request format'
            });
        }

        // Update each game's display order
        const updatePromises = games.map(({ id, displayOrder }) =>
            Game.findByIdAndUpdate(id, { displayOrder, updatedAt: Date.now() })
        );

        await Promise.all(updatePromises);

        logger.info(`Games reordered by user ${req.user?.id || 'admin'}`);

        res.status(200).json({
            success: true,
            message: 'Games reordered successfully'
        });
    } catch (error) {
        logger.error(`Error reordering games: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Bulk delete games
// @route   DELETE /api/v1/games/admin/bulk
// @access  Private/Admin
exports.bulkDeleteGames = async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an array of game IDs'
            });
        }

        const games = await Game.find({ _id: { $in: ids } });

        // Delete associated images from disk
        for (const game of games) {
            if (game.bgImage) deleteFile(path.join(__dirname, '../uploads/games', path.basename(game.bgImage)));
            if (game.characterImage) deleteFile(path.join(__dirname, '../uploads/games', path.basename(game.characterImage)));
        }

        const result = await Game.deleteMany({ _id: { $in: ids } });

        logger.info(`Bulk delete games: ${result.deletedCount} games hard deleted by user ${req.user.id}`);

        res.status(200).json({
            success: true,
            count: result.deletedCount,
            data: {}
        });
    } catch (error) {
        logger.error(`Error bulk deleting games: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get single game by slug with dynamic counts
// @route   GET /api/games/slug/:slug
// @access  Public
exports.getGameBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        // Create match query (allow slug OR id)
        const matchQuery = { $or: [{ slug }] };
        if (mongoose.Types.ObjectId.isValid(slug)) {
            matchQuery.$or.push({ _id: mongoose.Types.ObjectId(slug) });
        }

        // Use aggregation to get game with dynamic counts
        const games = await Game.aggregate([
            { $match: matchQuery },
            // Lookup active services for each game
            {
                $lookup: {
                    from: 'services',
                    let: { gameId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$gameId', '$$gameId'] },
                                isActive: true,
                                status: 'active'
                            }
                        },
                        { $count: 'count' }
                    ],
                    as: 'servicesData'
                }
            },
            // Lookup services for orders
            {
                $lookup: {
                    from: 'services',
                    let: { gameId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$gameId', '$$gameId'] }
                            }
                        },
                        { $project: { _id: 1 } }
                    ],
                    as: 'gameServices'
                }
            },
            // Lookup orders from services
            {
                $lookup: {
                    from: 'orders',
                    let: { serviceIds: '$gameServices._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$serviceId', '$$serviceIds'] }
                            }
                        },
                        { $count: 'count' }
                    ],
                    as: 'ordersData'
                }
            },
            // Add counts to output
            {
                $addFields: {
                    servicesCount: {
                        $ifNull: [{ $arrayElemAt: ['$servicesData.count', 0] }, 0]
                    },
                    ordersCount: {
                        $ifNull: [{ $arrayElemAt: ['$ordersData.count', 0] }, 0]
                    }
                }
            },
            // Project final fields
            {
                $project: {
                    servicesData: 0,
                    gameServices: 0,
                    ordersData: 0
                }
            }
        ]);

        if (!games || games.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        res.status(200).json({
            success: true,
            data: games[0]
        });
    } catch (error) {
        logger.error(`Error fetching game by slug ${req.params.slug}: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get game statistics (services count, orders count)
// @route   GET /api/games/:id/stats
// @access  Public
exports.getGameStats = async (req, res, next) => {
    try {
        const gameId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(gameId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid game ID'
            });
        }

        // Get service count using aggregation
        const serviceStats = await Service.aggregate([
            { $match: { gameId: mongoose.Types.ObjectId(gameId), isActive: true, status: 'active' } },
            { $count: 'activeServices' }
        ]);

        // Get order count through services
        const gameServices = await Service.find({ gameId }).select('_id');
        const serviceIds = gameServices.map(s => s._id);

        const orderStats = await Order.aggregate([
            { $match: { serviceId: { $in: serviceIds } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const totalOrders = orderStats.reduce((sum, stat) => sum + stat.count, 0);

        res.status(200).json({
            success: true,
            data: {
                servicesCount: serviceStats[0]?.activeServices || 0,
                ordersCount: totalOrders,
                ordersByStatus: orderStats
            }
        });
    } catch (error) {
        logger.error(`Error fetching game stats ${req.params.id}: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
