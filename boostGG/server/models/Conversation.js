const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        guestId: {
            type: String,
            index: true
        },
        isGuest: {
            type: Boolean,
            default: false
        },
        lastMessage: {
            type: String,
        },
        status: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open',
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: {},
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
