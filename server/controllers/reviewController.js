const Review = require('../models/Review');
const Game = require('../models/Game');
const sendEmail = require('../utils/sendEmail');

// @desc    Get active reviews for homepage
// @route   GET /api/v1/reviews/active
// @access  Public
exports.getActiveReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({
            status: 'approved',
            isActive: true
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
            status: 'approved',
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

// @desc    Get all reviews for admin
// @route   GET /api/v1/reviews/admin
// @access  Private/Admin
exports.getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 }).populate('userId', 'name email');

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

// @desc    Approve/Reject review
// @route   PATCH /api/v1/reviews/:id/status
// @access  Private/Admin
exports.updateReviewStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        review.status = status;
        review.isActive = status === 'approved';
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

// @desc    Submit new review (public)
// @route   POST /api/v1/reviews/submit
// @access  Public
exports.submitReview = async (req, res, next) => {
    try {
        const { title, reviewerName, rating, text } = req.body;

        const review = await Review.create({
            userId: req.user?._id || null,
            title,
            reviewerName,
            rating,
            text,
            status: 'pending',
            isActive: false,
            isVerified: !!req.user
        });

        // Send email notification to admin
        try {
            await sendEmail({
                to: process.env.ADMIN_EMAIL || 'admin@boostgg.com',
                subject: 'New Review Submitted - Pending Approval',
                html: `
                    <h3>New Review Submitted</h3>
                    <p><strong>Name:</strong> ${reviewerName}</p>
                    <p><strong>Rating:</strong> ${rating}/5</p>
                    <p><strong>Title:</strong> ${title || 'No title'}</p>
                    <p><strong>Review:</strong> ${text}</p>
                    <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reviews">Review and approve in admin panel</a></p>
                `
            });
        } catch (emailErr) {
            console.error('Failed to send admin notification email:', emailErr);
        }

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully and is pending approval',
            data: review
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
        const { gameId, reviewerName, rating, text, isVerified, status } = req.body;

        const review = await Review.create({
            gameId,
            reviewerName,
            rating,
            text,
            isVerified: isVerified !== undefined ? isVerified : true,
            status: status || 'approved',
            isActive: status === 'approved'
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
