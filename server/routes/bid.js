const express = require('express');
const {
    getAllBids,
    updateBidPrice,
    createBid,
    getProAvailableBids
} = require('../controllers/bidController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../models/User');

router.use(protect);

// Pro routes
router.get('/pro/available', authorize(ROLES.PRO), getProAvailableBids);

// Admin routes
router.use(authorize(ROLES.ADMIN));
router.get('/', getAllBids);
router.post('/', createBid);
router.put('/:id', updateBidPrice);

module.exports = router;
