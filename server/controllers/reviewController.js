const Review = require('../models/Review');
const path = require('path');
const fs = require('fs');

// @desc    Get published reviews for homepage
// @route   GET /api/v1/reviews/active
// @access  Public
exports.getActiveReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({
            isPublished: true
        }).sort({ createdAt: -1 }).limit(12);

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get reviews for a game
// @route   GET /api/v1/reviews/game/:gameId
// @access  Public
exports.getGameReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({
            gameId: req.params.gameId,
            isPublished: true
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all reviews for admin
// @route   GET /api/v1/reviews/admin
// @access  Private/Admin
exports.getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new review (admin only)
// @route   POST /api/v1/reviews
// @access  Private/Admin
exports.createReview = async (req, res, next) => {
    try {
        const { 
            title, 
            reviewerName, 
            stars, 
            description, 
            countryName, 
            countryImage, 
            reviewImage, 
            isPublished,
            gameId,
            serviceId
        } = req.body;

        const review = await Review.create({
            title,
            reviewerName,
            stars,
            description,
            countryName,
            countryImage,
            reviewImage,
            isPublished: isPublished !== undefined ? isPublished : true,
            gameId,
            serviceId
        });

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, message });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Admin
exports.updateReview = async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Optional: Delete associated images from storage
        if (review.reviewImage) {
            const imagePath = path.join(__dirname, '..', review.reviewImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await review.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Toggle review publish status
// @route   PATCH /api/v1/reviews/:id/publish
// @access  Private/Admin
exports.togglePublish = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        review.isPublished = !review.isPublished;
        await review.save();

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
