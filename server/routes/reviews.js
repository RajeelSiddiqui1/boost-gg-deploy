const express = require('express');
const router = express.Router();
const { 
    getActiveReviews, 
    getGameReviews, 
    getAllReviews, 
    createReview, 
    updateReview, 
    deleteReview, 
    togglePublish 
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/active', getActiveReviews);
router.get('/game/:gameId', getGameReviews);

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/admin', getAllReviews);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.patch('/:id/publish', togglePublish);

module.exports = router;
