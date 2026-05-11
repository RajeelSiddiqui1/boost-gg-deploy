const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
            'bid_created',    // Admin creates/activates bid → matching pros notified
            'bid_active',     // Admin re-activates bid → matching pros notified
            'booster_bid',    // Pro places bid → admin notified
            'bid_placed',     // Pro places bid → other bidders notified
            'bid_approved',   // Admin approves bid → all other bidders notified (generic)
            'bid_won',        // Admin approves bid → winning bidder specifically notified
            'bid_claimed',    // Pro instant-claims → admin/pro/customer notified
            'claim_assigned', // Claim auto-assign → admin/pro/customer notified
            'order_update',   // General order status updates
            'system',         // System-level messages
            'payout',         // Wallet / payout events
            'payout_update',  // Detailed payout events
            'chat_message'    // Delayed chat notifications
        ],
        default: 'system'
    },
    link: {
        type: String,
        default: ''
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30 // auto-delete after 30 days
    }
}, {
    timestamps: true
});

// Compound indexes for fast per-user queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
