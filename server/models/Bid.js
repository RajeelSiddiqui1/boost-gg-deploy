const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        index: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    bidPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bid', bidSchema);
