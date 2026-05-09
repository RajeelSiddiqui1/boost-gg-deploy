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
    approveBid,
    submitCompletionProof,
    submitCustomerProof,
    reviewCompletion
} = require('../controllers/bidController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { proofUpload, customerProofUpload } = require('../middleware/orderProofUpload');

router.use(protect);

// Pro routes
router.get('/pro/available', authorize('pro', 'admin'), getProAvailableBids);
router.get('/me', authorize('pro', 'admin'), getMyBids);
router.post('/:id/booster-bid', authorize('pro', 'admin'), boosterBid);
router.post('/:id/claim', authorize('pro', 'admin'), boosterClaim);
router.get('/:id/bidders', getBidBidders);

// Completion workflow
router.post('/:id/complete', authorize('pro', 'admin'), proofUpload.single('proofImage'), submitCompletionProof);
router.post('/:id/customer-proof', customerProofUpload.single('proofImage'), submitCustomerProof);

// Admin routes
router.use(authorize('admin'));
router.get('/', getAllBids);
router.post('/', createBid);
router.put('/:id', updateBidPrice);
router.post('/:id/approve', approveBid);
router.put('/:id/review-completion', reviewCompletion);

module.exports = router;
