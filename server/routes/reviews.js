const express = require('express');
const router = express.Router();
const { getGameReviews, createReview, submitReview, getAllReviews, updateReviewStatus, getActiveReviews } = require('../controllers/reviewController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');

// Public routes
router.get('/active', getActiveReviews);
router.get('/game/:gameId', getGameReviews);
router.post('/submit', optionalProtect, submitReview);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAllReviews);
router.patch('/:id/status', protect, authorize('admin'), updateReviewStatus);
router.post('/', protect, authorize('admin'), createReview);

module.exports = router;
