const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    booster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'paid'],
        default: 'pending'
    },
    method: {
        type: String,
        enum: ['bank', 'paypal', 'jazzcash', 'easypaisa', 'binance', 'wise'],
        required: true
    },
    accountDetails: {
        accountTitle: String,
        accountNumber: String,
        bankName: String,
        email: String
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: Date,
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: String,
    rejectionReason: String
});

payoutSchema.index({ booster: 1, status: 1 });
payoutSchema.index({ status: 1, requestedAt: -1 });

module.exports = mongoose.model('Payout', payoutSchema);
