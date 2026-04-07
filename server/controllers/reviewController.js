const Review = require('../models/Review');
const Game = require('../models/Game');

// @desc    Get reviews for a game
// @route   GET /api/v1/reviews/game/:gameId
// @access  Public
exports.getGameReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({
            gameId: req.params.gameId,
            isActive: true
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

// @desc    Create a new review
// @route   POST /api/v1/reviews
// @access  Private/Admin
exports.createReview = async (req, res, next) => {
    try {
        const { gameId, reviewerName, rating, text, isVerified } = req.body;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ success: false, message: 'Game not found' });
        }

        const review = await Review.create({
            gameId,
            reviewerName,
            rating,
            text,
            isVerified: isVerified !== undefined ? isVerified : true
        });

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
