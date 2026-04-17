const mongoose = require('mongoose');
const slugify = require('slugify');

// Service types enum
const SERVICE_TYPES = [
    'boosting',        // Rank boosting, level boosting
    'coaching',        // Player coaching, tips
    'accounts',        // Account selling
    'items',           // In-game items/currency
    'gold',            // Gold/Currency selling (new)
    'currency',        // Virtual currency (new)
    'packs',           // Package deals
    'misc'             // Miscellaneous services
];

// Service status enum
const SERVICE_STATUS = ['active', 'inactive', 'draft'];

// Pricing types enum
const PRICING_TYPES = [
    'fixed',           // Fixed price for the entire service
    'per_level',       // Price per level/rank
    'per_win',         // Price per win
    'hourly',          // Price per hour
    'tiered',          // Tiered pricing based on options
    'dynamic',         // Dynamic pricing based on parameters
    'quantity'         // Quantity-based pricing (e.g., gold)
];

// Service categories
const SERVICE_CATEGORIES = [
    'boosting',
    'coaching',
    'accounts',
    'items',
    'gold',
    'currency',
    'packs',
    'misc'
];

// Dynamic field types for service configuration
const FIELD_TYPES = [
    'select',          // Dropdown selection
    'radio',           // Radio buttons
    'checkbox',        // Checkboxes
    'number',          // Number input
    'range',           // Range slider
    'tier'             // Tiered selection (like level ranges)
];

const serviceSchema = new mongoose.Schema({
    // Service title/name
    title: {
        type: String,
        required: [true, 'Please add a service title'],
        trim: true,
        maxlength: [100, 'Service title cannot exceed 100 characters']
    },
    // URL-friendly slug
    slug: {
        type: String,
        unique: true
    },
    // Dynamic fields configuration (SkyCoach style)
    // Admin can define custom fields for each service
    dynamicFields: [{
        // Field identifier
        fieldId: {
            type: String,
            required: true
        },
        // Field display name
        label: {
            type: String,
            required: true
        },
        // Field type: select, radio, checkbox, number, range, tier
        fieldType: {
            type: String,
            enum: FIELD_TYPES,
            default: 'select'
        },
        // Is this field required?
        required: {
            type: Boolean,
            default: false
        },
        // Options for select/radio/checkbox (for tier type, this is level ranges)
        options: [{
            // Option value
            value: String,
            // Option display label
            label: String,
            // Price modifier (percentage or fixed)
            priceModifier: {
                type: Number,
                default: 0
            },
            // Is this option selected by default?
            default: {
                type: Boolean,
                default: false
            }
        }],
        // For range type - min/max values
        rangeConfig: {
            min: Number,
            max: Number,
            step: {
                type: Number,
                default: 1
            },
            unit: String  // e.g., "levels", "wins", "hours"
        },
        // Display order
        displayOrder: {
            type: Number,
            default: 0
        }
    }],
    // Service description
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    // Reference to the Game this service belongs to
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: [true, 'Please link this service to a game'],
        index: true
    },
    // Reference to the Category (New relational structure)
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please link this service to a category'],
        index: true
    },
    // Reference to the PRO/Service Provider who created this service
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    // Service category slug (backward compatibility for filtering)
    categorySlug: {
        type: String,
        default: 'boosting',
        index: true
    },
    // Service type
    serviceType: {
        type: String,
        enum: SERVICE_TYPES,
        default: 'boosting'
    },
    // Boost type (for SkyCoach Mode 1 — boosting services only)
    boostType: {
        type: String,
        enum: ['piloted', 'self-play', 'both'],
        default: 'both',
        index: true
    },
    // Boost category (specific service category within boosting mode)
    boostCategory: {
        type: String,
        enum: ['rank-boost', 'raid-boost', 'dungeon-boost', 'pvp-boost', 'coaching', 'other'],
        default: 'rank-boost',
        index: true
    },
    // Advanced Pricing Rules (Production Ready)
    pricingRules: {
        type: {
            type: String,
            enum: ['fixed', 'range', 'quantity'],
            default: 'fixed'
        },
        basePrice: Number, // For fixed
        min_value: Number, // For range/quantity
        max_value: Number, // For range/quantity
        price_per_unit: Number, // For range/quantity
        multiplier_logic: String, // e.g. "x1.2 handle"
        discount_percentage: {
            type: Number,
            default: 0
        }
    },
    // Icon/image for the service
    icon: {
        type: String,
        default: ''
    },
    // Main background image for the service (displayed on cards)
    image: {
        type: String,
        default: ''
    },
    // Background image for service card (JPG/JPEG)
    backgroundImage: {
        type: String,
        default: ''
    },
    // Character/foreground image for service card (PNG transparent)
    characterImage: {
        type: String,
        default: ''
    },
    // List for cards/lists
    shortDescription: {
        type: String,
        trim: true,
        maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    // Pricing configuration
    pricing: {
        // Type of pricing
        type: {
            type: String,
            enum: PRICING_TYPES,
            default: 'fixed'
        },
        // Base price (for fixed pricing)
        basePrice: {
            type: Number,
            default: 0,
            min: [0, 'Base price cannot be negative']
        },
        // Price per unit (for per_level, per_win, hourly)
        pricePerUnit: {
            type: Number,
            default: 0,
            min: [0, 'Price per unit cannot be negative']
        },
        // Minimum price
        minPrice: {
            type: Number,
            default: 0,
            min: [0, 'Minimum price cannot be negative']
        },
        // Maximum price
        maxPrice: {
            type: Number,
            default: 0,
            min: [0, 'Maximum price cannot be negative']
        },
        // Discount percentage (0-100)
        discountPercent: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot exceed 100%'],
            max: [100, 'Discount cannot exceed 100%']
        },
        // Tiered pricing options (for tiered pricing)
        tiers: [{
            name: {
                type: String,
                required: true
            },
            description: String,
            price: {
                type: Number,
                required: true,
                min: 0
            },
            multiplier: {
                type: Number,
                default: 1
            }
        }],
        // Dynamic pricing parameters
        dynamicConfig: {
            enabled: {
                type: Boolean,
                default: false
            },
            formula: String,
            variables: mongoose.Schema.Types.Mixed
        }
    },
    // Price (computed/virtual field for easy access)
    price: {
        type: Number,
        default: 0
    },
    // Delivery time estimate (in hours)
    deliveryTime: {
        type: Number,
        default: 24,
        min: [0, 'Delivery time cannot be negative']
    },
    // Delivery time text (e.g., "1-2 days")
    deliveryTimeText: {
        type: String,
        default: ''
    },
    // Estimated Times (SkyCoach Style)
    estimatedStartTime: {
        type: String,
        default: '15 min'
    },
    estimatedCompletionTime: {
        type: String,
        default: '24 hours'
    },
    // Features included (array of strings)
    features: [{
        type: String,
        trim: true
    }],
    // Sample Reviews (SkyCoach Style - Social Proof)
    sampleReviews: [{
        reviewerName: String,
        rating: { type: Number, default: 5 },
        text: String,
        isVerified: { type: Boolean, default: true },
        date: { type: String, default: () => new Date().toLocaleDateString() }
    }],
    // Requirements for this service
    requirements: [{
        type: String,
        trim: true
    }],
    // Platforms available for this service
    platforms: [{
        type: String,
        enum: ['PC', 'PS4', 'PS5', 'Xbox', 'Mobile', 'Switch', 'Any'],
        default: 'Any'
    }],
    // Regions available for this service
    regions: [{
        type: String,
        enum: ['EU', 'US', 'Oceanic', 'Asia', 'Global', 'Any'],
        default: 'Any'
    }],
    // Dynamic Options (Legacy support)
    serviceOptions: [{
        name: { type: String, required: true }, // e.g., "Loot Options", "Extras"
        type: {
            type: String,
            enum: ['dropdown', 'checkbox', 'slider'],
            default: 'dropdown'
        },
        choices: [{
            label: String, // e.g., "Full Loot Priority"
            addPrice: { type: Number, default: 0 }, // Fixed addition
            multiplier: { type: Number, default: 1 } // Multiplier addition
        }],
        // For sliders
        min: Number,
        max: Number,
        step: Number
    }],
    // NEW: Fully Dynamic Sidebar Configurator (Skycoach Style)
    sidebarSections: [{
        id: String,
        heading: String,
        fieldType: {
            type: String,
            enum: ['radio', 'checkbox', 'dropdown', 'stepper', 'text_input'],
            default: 'radio'
        },
        required: { type: Boolean, default: false },
        displayOrder: Number,
        options: [{
            id: String,
            label: String,
            priceModifier: { type: Number, default: 0 },
            priceLabel: String,
            isDefault: { type: Boolean, default: false },
            badge: String,
            showInfo: { type: Boolean, default: false },
            tooltip: String
        }],
        stepperConfig: {
            min: { type: Number, default: 1 },
            max: Number,
            default: { type: Number, default: 1 },
            unitLabel: String,
            pricePerUnit: { type: Number, default: 0 },
            bulkDiscount: {
                threshold: Number,
                discountPercent: Number,
                bannerText: String
            }
        },
        placeholder: String
    }],
    showVAT: { type: Boolean, default: true },
    cashbackPercent: { type: Number, default: 5 },
    speedOptions: {
        express: {
            enabled: { type: Boolean, default: true },
            label: { type: String, default: 'Express' },
            priceModifier: { type: Number, default: 0 },
            tooltip: String
        },
        superExpress: {
            enabled: { type: Boolean, default: true },
            label: { type: String, default: 'Super Express' },
            priceModifier: { type: Number, default: 0 },
            tooltip: String
        }
    },
    // Is this service active?
    isActive: {
        type: Boolean,
        default: true
    },
    // Service status
    status: {
        type: String,
        enum: SERVICE_STATUS,
        default: 'active',
        index: true
    },
    // Display order within the game
    displayOrder: {
        type: Number,
        default: 0
    },
    // Is this service featured/promoted?
    isFeatured: {
        type: Boolean,
        default: false
    },
    // Is this a hot offer?
    is_hot_offer: {
        type: Boolean,
        default: false
    },
    // Popularity score for sorting
    popularityScore: {
        type: Number,
        default: 0,
        index: true
    },
    // Orders count (realistic seeding)
    orders_count: {
        type: Number,
        default: 0
    },
    // Tags for search
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    // Metadata
    meta: {
        title: String,
        description: String,
        keywords: [String]
    },
    // View count
    views: {
        type: Number,
        default: 0
    },
    // Rating (average)
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    // Number of reviews
    reviewsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create slug and sync category info before saving
serviceSchema.pre('save', async function (next) {
    // Handle title-to-slug conversion
    if (this.isModified('title')) {
        // Generate base slug from title
        let baseSlug = slugify(this.title, { lower: true, strict: true });

        // Check for existing slugs with same base
        const existingService = await this.constructor.findOne({
            slug: baseSlug,
            _id: { $ne: this._id }
        });

        if (existingService) {
            // Append timestamp to make it unique
            baseSlug = `${baseSlug}-${Date.now()}`;
        }

        this.slug = baseSlug;
    }

    // NEW: Sync categorySlug from categoryId
    if (this.isModified('categoryId') || !this.categorySlug || this.categorySlug === 'boosting') {
        try {
            const Category = mongoose.model('Category');
            const category = await Category.findById(this.categoryId);
            if (category) {
                this.categorySlug = category.slug;
            }
        } catch (error) {
            console.error('Error syncing categorySlug in Service model:', error.message);
        }
    }

    // Set price from pricing basePrice
    if (this.pricing && this.pricing.basePrice) {
        let calculatedPrice = this.pricing.basePrice;

        // Apply discount
        if (this.pricing.discountPercent > 0) {
            calculatedPrice = calculatedPrice * (1 - this.pricing.discountPercent / 100);
        }

        // Ensure within min/max bounds
        if (this.pricing.minPrice > 0 && calculatedPrice < this.pricing.minPrice) {
            calculatedPrice = this.pricing.minPrice;
        }
        if (this.pricing.maxPrice > 0 && calculatedPrice > this.pricing.maxPrice) {
            calculatedPrice = this.pricing.maxPrice;
        }

        this.price = Math.round(calculatedPrice * 100) / 100;
    }
});

// INDEXES FOR PERFORMANCE
// Compound index for game services query
serviceSchema.index({ gameId: 1, isActive: 1, displayOrder: 1 });
// Index on serviceType
serviceSchema.index({ serviceType: 1 });
// Index on category
serviceSchema.index({ category: 1 });
// Compound index for active status
serviceSchema.index({ isActive: 1, status: 1 });
// Index for featured services
serviceSchema.index({ isFeatured: 1 });
// Index for popularity
serviceSchema.index({ popularityScore: -1 });
// Index on tags
serviceSchema.index({ tags: 1 });
// Text search index
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });
// Index on gameId and status
serviceSchema.index({ gameId: 1, status: 1 });

// Virtual to populate game info
serviceSchema.virtual('game', {
    ref: 'Game',
    localField: 'gameId',
    foreignField: '_id',
    justOne: true
});

// Static method to get services by game
serviceSchema.statics.findByGame = function (gameId, options = {}) {
    const query = { gameId };

    if (options.activeOnly !== false) {
        query.isActive = true;
        query.status = 'active';
    }

    if (options.serviceType) {
        query.serviceType = options.serviceType;
    }

    if (options.category) {
        query.category = options.category;
    }

    return this.find(query)
        .sort({ displayOrder: 1, createdAt: -1 })
        .populate('gameId', 'name slug icon bgImage');
};

// Static method to get services with order counts
serviceSchema.statics.getServicesWithOrderCounts = function (gameId) {
    return this.aggregate([
        {
            $match: { gameId: mongoose.Types.ObjectId(gameId) }
        },
        // Lookup orders for each service
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'serviceId',
                as: 'orders'
            }
        },
        // Add orders count
        {
            $addFields: {
                ordersCount: { $size: '$orders' }
            }
        },
        // Project final fields
        {
            $project: {
                orders: 0
            }
        },
        // Sort
        { $sort: { displayOrder: 1, createdAt: -1 } }
    ]);
};

// Static method to calculate price
serviceSchema.statics.calculatePrice = function (service, params = {}) {
    const { pricing } = service;

    if (!pricing) return 0;

    let price = 0;

    switch (pricing.type) {
        case 'fixed':
            price = pricing.basePrice || 0;
            break;

        case 'per_level':
        case 'per_win':
        case 'hourly':
            price = (pricing.pricePerUnit || 0) * (params.units || 1);
            break;

        case 'tiered':
            if (params.tierIndex !== undefined && pricing.tiers && pricing.tiers[params.tierIndex]) {
                price = pricing.tiers[params.tierIndex].price;
            } else if (pricing.basePrice) {
                price = pricing.basePrice;
            }
            break;

        case 'dynamic':
            // Dynamic pricing would be handled by a separate pricing engine
            // For now, return base price as fallback
            price = pricing.basePrice || 0;
            break;

        default:
            price = pricing.basePrice || 0;
    }

    // Apply discount
    if (pricing.discountPercent > 0) {
        price = price * (1 - pricing.discountPercent / 100);
    }

    // Ensure within min/max bounds
    if (pricing.minPrice > 0 && price < pricing.minPrice) {
        price = pricing.minPrice;
    }
    if (pricing.maxPrice > 0 && price > pricing.maxPrice) {
        price = pricing.maxPrice;
    }

    return Math.round(price * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model('Service', serviceSchema);
module.exports.SERVICE_TYPES = SERVICE_TYPES;
module.exports.SERVICE_STATUS = SERVICE_STATUS;
module.exports.PRICING_TYPES = PRICING_TYPES;
module.exports.SERVICE_CATEGORIES = SERVICE_CATEGORIES;
module.exports.FIELD_TYPES = FIELD_TYPES;
