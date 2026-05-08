const express = require('express');
const {
    getAllBids,
    updateBidPrice,
    createBid,
    getProAvailableBids,
    boosterBid,
    boosterClaim,
    getBidBidders,
    getMyBids,
    approveBid
} = require('../controllers/bidController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Pro routes (Admins can also access for management/testing)
router.get('/pro/available', authorize('pro', 'admin'), getProAvailableBids);
router.get('/me', authorize('pro', 'admin'), getMyBids);
router.post('/:id/booster-bid', authorize('pro', 'admin'), boosterBid);
router.post('/:id/claim', authorize('pro', 'admin'), boosterClaim);
router.get('/:id/bidders', getBidBidders);

// Admin routes
router.use(authorize('admin'));
router.get('/', getAllBids);
router.post('/', createBid);
router.put('/:id', updateBidPrice);
router.post('/:id/approve', approveBid);

module.exports = router;
