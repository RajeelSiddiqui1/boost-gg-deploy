const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createOrder,
    getMyOrders,
    getAvailableOrders,
    getBoosterOrders,
    claimOrder,
    completeOrder,
    submitReview,
    getOrder,
    sendChatMessage,
    uploadChatFile,
    deleteChatMessage,
    assignProToOrder,
    rejectOrder,
    getAllOrders
} = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/me', protect, getMyOrders);
router.get('/available', protect, authorize('pro', 'admin'), getAvailableOrders);
router.get('/booster', protect, authorize('pro', 'admin'), getBoosterOrders);
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/claim', protect, authorize('pro', 'admin'), claimOrder);
router.put('/:id/complete', protect, authorize('pro', 'admin'), completeOrder);
router.put('/:id/assign-pro', protect, authorize('admin'), assignProToOrder);
router.put('/:id/reject', protect, authorize('pro'), rejectOrder);
router.post('/:id/review', protect, submitReview);
const chatUpload = require('../middleware/chatUpload');

router.post('/:id/chat', protect, sendChatMessage);
router.post('/:id/chat/upload', protect, chatUpload.single('file'), uploadChatFile);
router.delete('/:id/chat', protect, deleteChatMessage);

module.exports = router;
