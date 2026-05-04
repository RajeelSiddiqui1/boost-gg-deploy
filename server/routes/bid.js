const express = require('express');
const {
    createBid,
    getBidsForOrder,
    acceptBid,
    getMyBids,
    updateBid
} = require('../controllers/bidController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../models/User');

router.use(protect);

router.post('/', authorize(ROLES.PRO), createBid);
router.get('/me', authorize(ROLES.PRO), getMyBids);
router.put('/:id', authorize(ROLES.PRO), updateBid);

router.get('/order/:orderId', authorize(ROLES.ADMIN), getBidsForOrder);
router.put('/:id/accept', authorize(ROLES.ADMIN), acceptBid);

module.exports = router;
