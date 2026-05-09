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
    },
    bidders: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    claims: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    assignedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    chat: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['pro', 'customer', 'admin'],
            required: true
        },
        type: {
            type: String,
            enum: ['text', 'image', 'video', 'pdf'],
            default: 'text'
        },
        attachment: {
            url: String,
            name: String,
            size: Number,
            mimeType: String
        },
        seen: {
            type: Boolean,
            default: false
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    // ── Completion Workflow ──────────────────────────────────
    completionStatus: {
        type: String,
        enum: ['none', 'pro_submitted', 'customer_submitted', 'approved', 'rejected'],
        default: 'none'
    },

    // Pro submits proof of completion
    completionProof: {
        imageUrl: String,          // path: uploads/orders/complete-order-proof
        comment: String,
        submittedAt: Date
    },

    // Customer submits their confirmation proof
    customerProof: {
        imageUrl: String,          // path: uploads/orders/customer-order-proof
        comment: String,
        status: { type: String, enum: ['approved', 'rejected'] }, // customer's choice
        approved: { type: Boolean, default: null },  // null = not reviewed, true/false = admin decision
        submittedAt: Date
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Bid', bidSchema);
