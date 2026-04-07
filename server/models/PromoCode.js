const mongoose = require('mongoose');

// Promo code types
const PROMO_TYPES = ['percentage', 'fixed', 'free_delivery'];
// Promo code statuses
const PROMO_STATUS = ['active', 'expired', 'disabled', 'exhausted'];

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Promo code is required'],
        uppercase: true,
        trim: true,
        unique: true,
        minlength: [3, 'Promo code must be at least 3 characters'],
        maxlength: [20, 'Promo code cannot exceed 20 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    // Discount type: percentage, fixed, or free_delivery
    discountType: {
        type: String,
        enum: PROMO_TYPES,
        default: 'percentage'
    },
    // Discount value (percentage or fixed amount)
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0, 'Discount value cannot be negative']
    },
    // Maximum discount amount (for percentage codes)
    maxDiscountAmount: {
        type: Number,
        default: null // null means no limit
    },
    // Minimum order amount to qualify
    minOrderAmount: {
        type: Number,
        default: 0
    },
    // Maximum number of uses
    maxUses: {
        type: Number,
        default: null // null means unlimited
    },
    // Current number of uses
    currentUses: {
        type: Number,
        default: 0
    },
    // Maximum uses per user
    maxUsesPerUser: {
        type: Number,
        default: 1
    },
    // Start date
    startDate: {
        type: Date,
        default: Date.now
    },
    // Expiration date
    expiresAt: {
        type: Date,
        required: [true, 'Expiration date is required']
    },
    // Status
    status: {
        type: String,
        enum: PROMO_STATUS,
        default: 'active'
    },
    // Applicable services (empty array means all services)
    applicableServices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
    // Applicable games (empty array means all games)
    applicableGames: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    }],
    // Target user types: all, new_users, existing_users
    targetUsers: {
        type: String,
        enum: ['all', 'new_users', 'existing_users'],
        default: 'all'
    },
    // Created by admin
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for efficient queries
promoCodeSchema.index({ status: 1, expiresAt: 1 });
promoCodeSchema.index({ startDate: 1, expiresAt: 1 });

// Virtual to check if promo is valid
promoCodeSchema.virtual('isValid').get(function() {
    const now = new Date();
    const notExpired = this.expiresAt > now;
    const notStarted = this.startDate <= now;
    const notExhausted = this.maxUses === null || this.currentUses < this.maxUses;
    const isActive = this.status === 'active';
    
    return notExpired && notStarted && notExhausted && isActive;
});

// Calculate discount amount
promoCodeSchema.methods.calculateDiscount = function(orderAmount) {
    if (!this.isValid) return 0;
    if (orderAmount < this.minOrderAmount) return 0;
    
    let discount = 0;
    
    switch (this.discountType) {
        case 'percentage':
            discount = (orderAmount * this.discountValue) / 100;
            if (this.maxDiscountAmount !== null) {
                discount = Math.min(discount, this.maxDiscountAmount);
            }
            break;
        case 'fixed':
            discount = Math.min(this.discountValue, orderAmount);
            break;
        case 'free_delivery':
            discount = 0; // This is handled differently in order
            break;
    }
    
    return Math.min(discount, orderAmount);
};

// Use promo code (increment usage)
promoCodeSchema.methods.use = async function() {
    this.currentUses += 1;
    
    if (this.maxUses !== null && this.currentUses >= this.maxUses) {
        this.status = 'exhausted';
    }
    
    await this.save();
};

// Static method to validate and find promo code
promoCodeSchema.statics.validateCode = async function(code, userId = null, orderAmount = 0) {
    const promo = await this.findOne({ code: code.toUpperCase() });
    
    if (!promo) {
        return { valid: false, message: 'Invalid promo code' };
    }
    
    // Check expiration
    if (new Date() > promo.expiresAt) {
        promo.status = 'expired';
        await promo.save();
        return { valid: false, message: 'Promo code has expired' };
    }
    
    // Check start date
    if (new Date() < promo.startDate) {
        return { valid: false, message: 'Promo code is not yet active' };
    }
    
    // Check status
    if (promo.status !== 'active') {
        return { valid: false, message: `Promo code is ${promo.status}` };
    }
    
    // Check usage limit
    if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
        promo.status = 'exhausted';
        await promo.save();
        return { valid: false, message: 'Promo code has reached maximum uses' };
    }
    
    // Check minimum order amount
    if (orderAmount < promo.minOrderAmount) {
        return { 
            valid: false, 
            message: `Minimum order amount of Rs. ${promo.minOrderAmount} required` 
        };
    }
    
    // Calculate discount
    const discount = promo.calculateDiscount(orderAmount);
    
    return {
        valid: true,
        promo,
        discount,
        message: 'Promo code applied successfully'
    };
};

module.exports = mongoose.model('PromoCode', promoCodeSchema);
module.exports.PROMO_TYPES = PROMO_TYPES;
module.exports.PROMO_STATUS = PROMO_STATUS;
