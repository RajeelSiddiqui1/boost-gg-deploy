const mongoose = require('mongoose');

// Order status enum
const ORDER_STATUS = ['pending', 'processing', 'completed', 'disputed', 'cancelled'];

const orderSchema = new mongoose.Schema({
    // Reference to the Service being ordered
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Please specify a service'],
        index: true
    },
    // Reference to the User (customer)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Reference to the Pro/Booster (optional - assigned when order is accepted)
    pro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Order amount/price
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    // Currency
    currency: {
        type: String,
        default: 'USD'
    },
    // Order status
    status: {
        type: String,
        enum: ORDER_STATUS,
        default: 'pending',
        index: true
    },

    // Customer contact information
    contactInfo: {
        discord: { type: String },
        email: { type: String },
        inGameName: { type: String }
    },
    // Selected options/add-ons for the service
    selectedOptions: {
        type: Object
    },
    // Calculated value (e.g., slider value for level/rank)
    calcValue: {
        type: Number
    },
    // Transaction ID to group orders from same checkout
    transactionId: {
        type: String
    },
    // Platform selected by customer
    platform: { type: String },
    // Region selected by customer
    region: { type: String },
    // Cashback earned on this order
    cashbackEarned: { type: Number, default: 0 },
    // Chat messages between customer and booster
    chat: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    // Proof of completion (multiple screenshots/videos)
    proofs: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
        uploadedAt: { type: Date, default: Date.now }
    }],
    // The specific amount the booster earns for this order (after commission)
    boosterEarnings: {
        type: Number,
        default: 0
    },
    // When the order was completed
    completedAt: {
        type: Date
    },
    // Customer rating (1-5)
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    // Customer review
    review: String,
    // Affiliate tracking
    affiliateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    affiliateCommission: {
        type: Number,
        default: 0
    },
    referralCode: {
        type: String
    },
    // ── SkyCoach Mode fields ──
    // Which platform mode this order belongs to
    orderMode: {
        type: String,
        enum: ['boosting', 'currency', 'accounts'],
        default: 'boosting',
        index: true
    },
    // ── Boosting-specific ──
    // Whether the customer chose piloted or self-play
    selectedBoostType: {
        type: String,
        enum: ['piloted', 'self-play']
    },
    // ── Currency-specific ──
    // Reference to the currency listing
    currencyListingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CurrencyListing'
    },
    // Amount of currency ordered
    currencyQuantity: {
        type: Number,
        min: 0
    },
    // Delivery method chosen by customer
    deliveryMethod: {
        type: String
    },
    // ── Accounts-specific ──
    // Reference to the account listing
    accountListingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountListing'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-save middleware to update timestamps
orderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Set completedAt when status changes to completed
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }

    next();
});

// INDEXES FOR PERFORMANCE
// Compound index for user's orders
orderSchema.index({ userId: 1, createdAt: -1 });
// Compound index for pro's orders
orderSchema.index({ pro: 1, status: 1 });
// Compound index for service orders
orderSchema.index({ serviceId: 1, status: 1 });
// Compound index for transaction grouping
orderSchema.index({ transactionId: 1 });
// Compound index for recent orders
orderSchema.index({ createdAt: -1, status: 1 });
// Index for affiliate tracking
orderSchema.index({ affiliateId: 1 });

// Virtual to populate service info
orderSchema.virtual('service', {
    ref: 'Service',
    localField: 'serviceId',
    foreignField: '_id',
    justOne: true
});

// Virtual to populate user info
orderSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Static method to get orders by user
orderSchema.statics.findByUser = function (userId, options = {}) {
    const query = { userId };

    if (options.status) {
        query.status = options.status;
    }

    return this.find(query)
        .populate('serviceId', 'title slug icon price')
        .sort({ createdAt: -1 });
};

// Static method to get orders by service
orderSchema.statics.findByService = function (serviceId, options = {}) {
    const query = { serviceId };

    if (options.status) {
        query.status = options.status;
    }

    return this.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
};

// Static method to get orders by pro
orderSchema.statics.findByPro = function (proId, options = {}) {
    const query = { pro: proId };

    if (options.status) {
        query.status = options.status;
    }

    return this.find(query)
        .populate('serviceId', 'title slug price')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
};

// Static method to get orders with service and user info
orderSchema.statics.getOrdersWithDetails = function (filters = {}, options = {}) {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    return this.find(filters)
        .populate('serviceId', 'title slug icon price gameId')
        .populate('userId', 'name email avatar')
        .populate('pro', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit);
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = function (filters = {}) {
    return this.aggregate([
        { $match: filters },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalRevenue: { $sum: '$price' }
            }
        }
    ]);
};

// Static method to complete order and process affiliate commission
orderSchema.statics.completeOrderWithAffiliate = async function (orderId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await this.findById(orderId).session(session);

        if (!order || order.status !== 'completed') {
            throw new Error('Order not found or already completed');
        }

        // Process affiliate commission if applicable
        if (order.affiliateId) {
            const affiliate = await User.findById(order.affiliateId).session(session);

            if (affiliate) {
                const commissionAmount = order.affiliateCommission || (order.price * (affiliate.affiliateCommissionRate / 100));

                // Update affiliate earnings
                await User.findByIdAndUpdate(order.affiliateId, {
                    $inc: {
                        affiliateEarnings: commissionAmount,
                        affiliateConversions: 1
                    }
                }, { session });

                // Create commission record
                const { AffiliateCommission } = require('./Affiliate');
                await AffiliateCommission.create([{
                    affiliateId: order.affiliateId,
                    orderId: order._id,
                    amount: commissionAmount,
                    rate: affiliate.affiliateCommissionRate,
                    orderAmount: order.price,
                    status: 'approved'
                }], { session });

                // Update referral status
                const { AffiliateReferral } = require('./Affiliate');
                await AffiliateReferral.findOneAndUpdate(
                    { referredUserId: order.userId, affiliateId: order.affiliateId },
                    {
                        status: 'converted',
                        convertedAt: new Date(),
                        commissionEarned: commissionAmount,
                        firstPurchaseDate: new Date(),
                        firstPurchaseAmount: order.price
                    },
                    { session }
                );
            }
        }

        await session.commitTransaction();
        return true;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUS = ORDER_STATUS;
