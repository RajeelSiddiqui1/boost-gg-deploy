const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true,
        index: true
    },
    message: {
        type: String,
        required: [true, 'Please provide details about your request'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    budget: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'resolved', 'cancelled'],
        default: 'pending',
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CustomOrder', customOrderSchema);
