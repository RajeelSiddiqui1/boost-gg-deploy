const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Role enums
const ROLES = {
    CUSTOMER: 'customer',
    PRO: 'pro',
    ADMIN: 'admin',
    AFFILIATE: 'affiliate'
};

// PRO subtypes (for service providers)
const PRO_TYPES = {
    BOOSTER: 'booster',
    GOLD_SELLER: 'gold_seller',
    ACCOUNT_SELLER: 'account_seller',
    CONTENT_CREATOR: 'content_creator',
    INFLUENCER_PARTNER: 'influencer_partner',
    BLOGGER: 'blogger'
};

// Affiliate subtypes
const AFFILIATE_TYPES = {
    CREATOR: 'creator',
    PROMOTER: 'promoter'
};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    surname: {
        type: String,
        trim: true,
        maxlength: [50, 'Surname cannot be more than 50 characters']
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        maxlength: [30, 'Username cannot be more than 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    // Main role
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.CUSTOMER
    },
    // PRO sub-type (only applicable when role is 'pro')
    proType: {
        type: String,
        enum: [...Object.values(PRO_TYPES), null],
        default: null
    },
    // PRO status
    isProVerified: {
        type: Boolean,
        default: false
    },
    // PRO application status
    proStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
    },
    // PRO specializations (games they can boost/coach)
    proSpecializations: [{
        game: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        },
        rank: String,
        hoursPlayed: Number
    }],
    // Affiliate sub-type (only applicable when role is 'affiliate')
    affiliateType: {
        type: String,
        enum: [...Object.values(AFFILIATE_TYPES), null],
        default: null
    },
    // Affiliate tracking
    affiliateCode: {
        type: String,
        unique: true,
        sparse: true
    },
    // Who referred this user
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Affiliate earnings and commission tracking
    affiliateEarnings: {
        type: Number,
        default: 0
    },
    affiliatePendingEarnings: {
        type: Number,
        default: 0
    },
    affiliateCommissionRate: {
        type: Number,
        default: 10 // 10% default commission
    },
    affiliateTotalReferrals: {
        type: Number,
        default: 0
    },
    // Number of successful affiliate conversions
    affiliateConversions: {
        type: Number,
        default: 0
    },
    // PRO wallet and earnings
    walletBalance: {
        type: Number,
        default: 0
    },
    earnings: {
        type: Number,
        default: 0
    },
    pendingEarnings: {
        type: Number,
        default: 0
    },
    // PRO stats
    totalOrdersCompleted: {
        type: Number,
        default: 0
    },
    boosterCommissionRate: {
        type: Number,
        default: 80 // 80% default to booster
    },
    // Avatar
    avatar: {
        type: String,
        default: ''
    },
    // PRO rating (average from reviews)
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    // Legacy field - kept for backward compatibility
    completedOrders: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    // PRO Profile Data
    proProfile: {
        bio: { type: String, trim: true, maxlength: 1000 },
        tagline: { type: String, trim: true, maxlength: 100 },
        socialLinks: {
            youtube: String,
            twitch: String,
            tiktok: String,
            twitter: String,
            instagram: String,
            facebook: String
        },
        portfolio: [{
            title: String,
            url: String,
            type: { type: String, enum: ['video', 'image', 'link', 'article'] },
            description: String
        }],
        specialties: [String],
        languages: [String],
        timezone: String
    },
    // PRO Permissions
    permissions: [{
        type: String,
        enum: ['post_blog', 'manage_orders', 'view_analytics', 'manage_inventory']
    }],
    // PRO Application data
    proApplication: {
        discord: { type: String, trim: true },
        games: { type: String, trim: true },
        experience: { type: String, trim: true },
        appliedAt: { type: Date }
    },
    // Payout Preferences
    payoutMethod: {
        type: String,
        enum: ['easypaisa', 'jazzcash', 'bank', 'binance', 'wise', null],
        default: null
    },
    payoutDetails: {
        type: String, // Account number / Wallet address
        trim: true
    },
    savedGames: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Virtual for checking if user is a PRO
userSchema.virtual('isPro').get(function () {
    return this.role === ROLES.PRO && this.proStatus === 'approved';
});

// Virtual for checking if user is an affiliate
userSchema.virtual('isAffiliate').get(function () {
    return this.role === ROLES.AFFILIATE;
});

// Single pre-save hook: handles password hashing + affiliate code generation
userSchema.pre('save', async function () {
    // Hash password only if it was modified
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // Generate affiliate code when user becomes an affiliate (runs regardless of password change)
    if (this.role === ROLES.AFFILIATE && !this.affiliateCode) {
        this.affiliateCode = crypto.randomBytes(6).toString('hex').toUpperCase();
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Generate affiliate code
userSchema.methods.generateAffiliateCode = function () {
    return crypto.randomBytes(6).toString('hex').toUpperCase();
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
module.exports.PRO_TYPES = PRO_TYPES;
module.exports.AFFILIATE_TYPES = AFFILIATE_TYPES;
