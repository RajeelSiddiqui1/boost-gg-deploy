const mongoose = require('mongoose');

const CURRENCY_TYPES = ['Gold', 'Silver', 'Coins', 'Gems', 'Crystals', 'Credits', 'Tokens', 'Gil', 'Platinum', 'Other'];
const DELIVERY_METHODS = ['face-to-face', 'mail', 'auction-house', 'cod', 'direct-trade'];
const REGIONS = ['EU', 'US', 'Oceanic', 'Asia', 'Latin America', 'Global', 'Any'];
const SERVERS = ['Any'];

const currencyListingSchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: [true, 'Please link this listing to a game'],
        index: true
    },
    gameSlug: {
        type: String,
        trim: true,
        index: true
    },
    // The type of currency (e.g., "Gold", "Coins")
    currencyType: {
        type: String,
        required: [true, 'Please specify the currency type'],
        trim: true
    },
    // Custom currency name if "Other"
    currencyName: {
        type: String,
        trim: true
    },
    // Server name (game-specific, e.g. "Benediction", "EU Hardcore")
    server: {
        type: String,
        trim: true,
        default: 'Any'
    },
    // Region
    region: {
        type: String,
        trim: true,
        default: 'Global'
    },
    // Price per 1 unit of currency (e.g., $0.002 per 1 Gold)
    pricePerUnit: {
        type: Number,
        required: [true, 'Please set a price per unit'],
        min: [0.0001, 'Price per unit must be positive']
    },
    // Minimum quantity a buyer can order
    minQuantity: {
        type: Number,
        default: 100,
        min: [1, 'Minimum quantity must be at least 1']
    },
    // Maximum quantity a buyer can order
    maxQuantity: {
        type: Number,
        default: 1000000
    },
    // Delivery method
    deliveryMethods: [{
        type: String,
        enum: DELIVERY_METHODS
    }],
    // Default delivery method
    defaultDeliveryMethod: {
        type: String,
        enum: DELIVERY_METHODS,
        default: 'face-to-face'
    },
    // Estimated delivery time in hours
    estimatedDeliveryHours: {
        type: Number,
        default: 1,
        min: [0, 'Delivery time cannot be negative']
    },
    // Display text for delivery (e.g., "15-30 mins")
    deliveryTimeText: {
        type: String,
        default: '15-30 minutes'
    },
    // Icon/image for the currency
    icon: {
        type: String,
        default: ''
    },
    // Short description
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // Discount percentage
    discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    // Is listing active
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active',
        index: true
    },
    // Display order
    displayOrder: {
        type: Number,
        default: 0
    },
    // Orders count
    ordersCount: {
        type: Number,
        default: 0
    },
    // Featured
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual to populate game info
currencyListingSchema.virtual('game', {
    ref: 'Game',
    localField: 'gameId',
    foreignField: '_id',
    justOne: true
});

// Static: calculate price for a given quantity
currencyListingSchema.statics.calculatePrice = function (listing, quantity) {
    // Treat pricePerUnit as the price for the base 'minQuantity' package
    const minQty = Math.max(1, listing.minQuantity || 1);
    let price = listing.pricePerUnit * (quantity / minQty);

    if (listing.discountPercent > 0) {
        price = price * (1 - listing.discountPercent / 100);
    }
    return price;
};

// Indexes
currencyListingSchema.index({ gameId: 1, isActive: 1, displayOrder: 1 });
currencyListingSchema.index({ region: 1, server: 1 });
currencyListingSchema.index({ currencyType: 1 });

module.exports = mongoose.model('CurrencyListing', currencyListingSchema);
module.exports.CURRENCY_TYPES = CURRENCY_TYPES;
module.exports.DELIVERY_METHODS = DELIVERY_METHODS;
module.exports.REGIONS = REGIONS;
