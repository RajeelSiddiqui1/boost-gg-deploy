const mongoose = require('mongoose');

const accountListingSchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: [true, 'Please link this account to a game'],
        index: true
    },
    gameSlug: {
        type: String,
        trim: true,
        index: true
    },
    // Account title/name
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [150, 'Title cannot exceed 150 characters']
    },
    // Price of the account
    price: {
        type: Number,
        required: [true, 'Please set a price'],
        min: [0, 'Price cannot be negative']
    },
    // Original price (for showing discounts)
    originalPrice: {
        type: Number,
        default: 0
    },
    // Rank information
    rank: {
        type: String,
        trim: true,
        default: 'Unranked'
    },
    // Rank tier (for filtering/sorting: Bronze, Silver, Gold, Platinum, Diamond, etc.)
    rankTier: {
        type: String,
        trim: true
    },
    // Server name
    server: {
        type: String,
        trim: true,
        default: 'Any'
    },
    // Region
    region: {
        type: String,
        trim: true,
        default: 'Global',
        index: true
    },
    // Account level
    level: {
        type: Number,
        default: 0
    },
    // Screenshots/images of the account
    screenshots: [{
        type: String,
        trim: true
    }],
    // Thumbnail/preview image
    thumbnail: {
        type: String,
        default: ''
    },
    // Account specifications (flexible object)
    specifications: {
        // Items count
        itemsCount: { type: Number, default: 0 },
        // Skins count
        skinsCount: { type: Number, default: 0 },
        // Champions count (LoL)
        championsCount: { type: Number, default: 0 },
        // Achievements count
        achievementsCount: { type: Number, default: 0 },
        // Win rate %
        winRate: { type: Number, default: 0 },
        // Total wins
        wins: { type: Number, default: 0 },
        // Total losses  
        losses: { type: Number, default: 0 },
        // Hours played
        hoursPlayed: { type: Number, default: 0 },
        // Rare items (array of strings)
        rareItems: [{ type: String }],
        // Notable skins (array of strings)
        notableSkins: [{ type: String }],
        // Game-specific extras (flexible)
        extras: { type: mongoose.Schema.Types.Mixed }
    },
    // Highlights (bullet points shown on card)
    highlights: [{
        type: String,
        trim: true
    }],
    // Description
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    // Instant delivery (most accounts are instant)
    instantDelivery: {
        type: Boolean,
        default: true
    },
    // Delivery time text
    deliveryTimeText: {
        type: String,
        default: 'Instant'
    },
    // Secure transfer guaranteed
    secureTransfer: {
        type: Boolean,
        default: true
    },
    // Account status
    status: {
        type: String,
        enum: ['active', 'sold', 'reserved', 'inactive', 'draft'],
        default: 'active',
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    // Is featured
    isFeatured: {
        type: Boolean,
        default: false
    },
    // Display order
    displayOrder: {
        type: Number,
        default: 0
    },
    // Tags for search/filtering
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    // Who bought it (for sold tracking)
    soldTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    soldAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual to populate game info
accountListingSchema.virtual('game', {
    ref: 'Game',
    localField: 'gameId',
    foreignField: '_id',
    justOne: true
});

// Indexes
accountListingSchema.index({ gameId: 1, isActive: 1, status: 1, displayOrder: 1 });
accountListingSchema.index({ price: 1 });
accountListingSchema.index({ region: 1, server: 1 });
accountListingSchema.index({ isFeatured: 1 });
accountListingSchema.index({ tags: 1 });
accountListingSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('AccountListing', accountListingSchema);
