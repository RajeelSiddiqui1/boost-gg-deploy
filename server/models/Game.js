const mongoose = require('mongoose');
const slugify = require('slugify');

// Game categories enum
const GAME_CATEGORIES = [
    'RPG',
    'FPS',
    'MOBA',
    'MMORPG',
    'Action',
    'Adventure',
    'Strategy',
    'Sports',
    'Racing',
    'Fighting',
    'Puzzle',
    'Simulation',
    'Survival',
    'Horror',
    'Sandbox',
    'Battle Royale',
    'Card Game',
    'Other'
];

const gameSchema = new mongoose.Schema({
    // Game name/title
    name: {
        type: String,
        required: [true, 'Please add a game name'],
        trim: true,
        unique: true
    },
    // Title field (same as name for frontend compatibility)
    title: {
        type: String,
        trim: true
    },
    // URL-friendly slug
    slug: {
        type: String,
        unique: true
    },
    // Subtitle for display
    subtitle: {
        type: String,
        trim: true,
        default: ''
    },
    // Description
    description: {
        type: String,
        trim: true,
        default: ''
    },
    // Category for game classification
    category: {
        type: String,
        enum: GAME_CATEGORIES,
        default: 'Other'
    },
    // Icon image (smaller, for lists and cards)
    icon: {
        type: String,
        default: ''
    },
    // Banner image (larger, for game detail pages)
    banner: {
        type: String,
        default: ''
    },
    // Main image (backward compatibility)
    image: {
        type: String
    },
    // Background image
    bgImage: {
        type: String,
        default: ''
    },
    // Character image for game page
    characterImage: {
        type: String,
        default: ''
    },
    // Display order
    displayOrder: {
        type: Number,
        default: 0
    },
    // Offers count - stored in database for quick access
    offersCount: {
        type: Number,
        default: 0,
        min: 0
    },
    // Services count - stored in database for quick access
    servicesCount: {
        type: Number,
        default: 0,
        min: 0
    },
    // Orders count - stored in database for quick access
    ordersCount: {
        type: Number,
        default: 0,
        min: 0
    },
    // Reference to services for this game (ObjectId array)
    serviceIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
    // Game status
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    // Is game active (for quick queries)
    isActive: {
        type: Boolean,
        default: true
    },
    // Is popular game
    isPopular: {
        type: Boolean,
        default: false
    },
    // Is hot/trending game
    isHot: {
        type: Boolean,
        default: false
    },
    // Mode flags (Skycoach Style)
    modes: {
        services: { type: Boolean, default: true },
        currency: { type: Boolean, default: false },
        accounts: { type: Boolean, default: false }
    },
    // Custom service categories for this specific game (SkyCoach style)
    serviceCategories: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            trim: true
        },
        description: String,
        icon: String,
        displayOrder: {
            type: Number,
            default: 0
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create slug from name before saving
gameSchema.pre('save', async function () {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    // Auto-set title to name if not provided
    if (!this.title && this.name) {
        this.title = this.name;
    }
});

// INDEXES FOR PERFORMANCE
// Index on displayOrder for sorting
gameSchema.index({ displayOrder: 1 });
// Index on status for filtering
gameSchema.index({ status: 1 });
// Index on category for filtering
gameSchema.index({ category: 1 });
// Index on services array for quick lookup
gameSchema.index({ serviceIds: 1 });
// Compound index for popular games query
gameSchema.index({ isPopular: 1, isHot: 1, displayOrder: 1 });
// Compound index for active status
gameSchema.index({ isActive: 1, status: 1 });
// Index for text search
gameSchema.index({ name: 'text', description: 'text' });

// Virtual for getting active services count
gameSchema.virtual('services', {
    ref: 'Service',
    localField: '_id',
    foreignField: 'gameId'
});

// Static method to get games with dynamic service and order counts
gameSchema.statics.getGamesWithCounts = function (options = {}) {
    const { status, isActive = true, isHot, limit, skip } = options;

    return this.aggregate([
        // Match games by filters
        {
            $match: {
                ...(status && { status }),
                ...(isActive !== undefined && { isActive }),
                ...(isHot !== undefined && { isHot }),
                ...(options.name && { name: options.name })
            }
        },
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
        // Lookup orders through services for each game
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
        },
        // Sort by display order
        { $sort: { displayOrder: 1, createdAt: -1 } },
        // Pagination
        ...(skip ? [{ $skip: skip }] : []),
        ...(limit ? [{ $limit: limit }] : [])
    ]);
};

// Static method to get single game with counts
gameSchema.statics.getGameWithCounts = function (gameId) {
    return this.aggregate([
        {
            $match: { _id: mongoose.Types.ObjectId(gameId) }
        },
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
};

// Static method to sync services array and counts from Service collection
// Call this once to migrate existing data
gameSchema.statics.syncServices = async function () {
    const Service = require('./Service');

    // Get all games
    const games = await this.find({});

    for (const game of games) {
        // Get all services for this game
        const services = await Service.find({ gameId: game._id });

        // Extract service IDs
        const serviceIds = services.map(s => s._id);

        // Update game with services array and counts
        await this.findByIdAndUpdate(game._id, {
            $set: {
                serviceIds: serviceIds,
                servicesCount: serviceIds.length
            }
        });
    }

    console.log(`Synced services for ${games.length} games`);
};

module.exports = mongoose.model('Game', gameSchema);
module.exports.GAME_CATEGORIES = GAME_CATEGORIES;
