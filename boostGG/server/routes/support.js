const express = require('express');
const {
    getConversations,
    getMessages,
    createConversation,
    sendMessage
} = require('../controllers/supportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GetConversations is usually for admin or listing user's chats - strictly needs auth
router.get('/conversations', protect, getConversations);

// CreateConversation/SendMessage will handle guests in controller
router.post('/conversations', createConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);

module.exports = router;
