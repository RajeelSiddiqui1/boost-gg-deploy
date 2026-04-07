const mongoose = require('mongoose');

const affiliateReferralSchema = new mongoose.Schema({
    // The affiliate who referred this user
    affiliateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // The referred user
    referredUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Referral code used
    referralCode: {
        type: String,
        required: true
    },
    // Status of the referral (pending -> active -> converted)
    status: {
        type: String,
        enum: ['pending', 'active', 'converted', 'cancelled'],
        default: 'pending'
    },
    // First purchase made by referred user
    firstPurchaseDate: Date,
    // First purchase amount
    firstPurchaseAmount: Number,
    // Commission earned from this referral
    commissionEarned: {
        type: Number,
        default: 0
    },
    // Conversion date
    convertedAt: Date
}, {
    timestamps: true
});

// Compound indexes
affiliateReferralSchema.index({ affiliateId: 1, status: 1 });
affiliateReferralSchema.index({ referredUserId: 1 });
affiliateReferralSchema.index({ referralCode: 1 });

const affiliateCommissionSchema = new mongoose.Schema({
    // The affiliate earning commission
    affiliateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // The referral this commission is for
    referralId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AffiliateReferral'
    },
    // The order that generated this commission
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        index: true
    },
    // Commission amount
    amount: {
        type: Number,
        required: true
    },
    // Commission rate percentage
    rate: {
        type: Number,
        required: true
    },
    // Order amount (for reference)
    orderAmount: {
        type: Number,
        required: true
    },
    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'paid', 'cancelled'],
        default: 'pending'
    },
    // Payment date
    paidAt: Date,
    // Notes
    notes: String
}, {
    timestamps: true
});

// Indexes
affiliateCommissionSchema.index({ affiliateId: 1, status: 1 });
affiliateCommissionSchema.index({ createdAt: -1 });

// Static method to get affiliate stats
affiliateCommissionSchema.statics.getAffiliateStats = async function(affiliateId) {
    const stats = await this.aggregate([
        {
            $match: { 
                affiliateId: mongoose.Types.ObjectId(affiliateId),
                status: { $in: ['approved', 'paid'] }
            }
        },
        {
            $group: {
                _id: null,
                totalCommission: { $sum: '$amount' },
                pendingCommission: {
                    $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] }
                },
                paidCommission: {
                    $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] }
                },
                totalOrders: { $sum: 1 }
            }
        }
    ]);
    
    return stats[0] || { totalCommission: 0, pendingCommission: 0, paidCommission: 0, totalOrders: 0 };
};

// Static method to record commission from order
affiliateCommissionSchema.statics.createFromOrder = async function(orderId, affiliateId, rate = 10) {
    const Order = require('./Order');
    const order = await Order.findById(orderId);
    
    if (!order) {
        throw new Error('Order not found');
    }
    
    const amount = order.price * (rate / 100);
    
    return this.create({
        affiliateId,
        orderId,
        amount,
        rate,
        orderAmount: order.price,
        status: 'pending'
    });
};

const AffiliateReferral = mongoose.model('AffiliateReferral', affiliateReferralSchema);
const AffiliateCommission = mongoose.model('AffiliateCommission', affiliateCommissionSchema);

module.exports = {
    AffiliateReferral,
    AffiliateCommission
};
