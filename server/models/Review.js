const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        index: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        index: true
    },
    title: {
        type: String,
        trim: true
    },
    reviewerName: {
        type: String,
        required: [true, 'Please add a reviewer name'],
        trim: true
    },
    stars: {
        type: Number,
        required: [true, 'Please add a rating between 1 and 5'],
        min: 1,
        max: 5,
        default: 5
    },
    description: {
        type: String,
        required: [true, 'Please add review description']
    },
    countryName: {
        type: String,
        trim: true
    },
    countryImage: {
        type: String, // URL to country flag/image
        trim: true
    },
    reviewImage: {
        type: String, // URL to PNG review image
        trim: true
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
