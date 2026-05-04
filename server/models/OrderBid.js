const mongoose = require('mongoose');

const orderBidSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    proId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    bidAmount: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['bid', 'claim'],
        default: 'bid'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Ensure a Pro can only bid once per order
orderBidSchema.index({ orderId: 1, proId: 1 }, { unique: true });

module.exports = mongoose.model('OrderBid', orderBidSchema);
