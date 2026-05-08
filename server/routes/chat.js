const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const chatUpload = require('../middleware/chatUpload');
const {
    getChat,
    getChatByOrder,
    sendMessage,
    markAsSeen,
    uploadChatFile
} = require('../controllers/chatController');

router.use(protect);

router.get('/order/:orderId', getChatByOrder);
router.post('/upload', chatUpload.single('file'), uploadChatFile);

router.route('/:bidId')
    .get(getChat)
    .post(sendMessage);

router.put('/:bidId/seen', markAsSeen);

module.exports = router;
