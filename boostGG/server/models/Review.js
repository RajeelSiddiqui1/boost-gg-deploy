const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: [true, 'Please link this review to a game'],
        index: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        index: true
    },
    reviewerName: {
        type: String,
        required: [true, 'Please add a reviewer name'],
        trim: true
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating between 1 and 5'],
        min: 1,
        max: 5
    },
    text: {
        type: String,
        required: [true, 'Please add review text']
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
