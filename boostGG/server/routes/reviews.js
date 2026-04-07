const express = require('express');
const router = express.Router();
const { getGameReviews, createReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/game/:gameId', getGameReviews);
router.post('/', protect, authorize('admin'), createReview);

module.exports = router;
