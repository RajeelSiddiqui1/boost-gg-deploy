const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for the logged in user
// @route   GET /api/v1/support/conversations
// @access  Private
exports.getConversations = async (req, res) => {
    try {
        let conversations;

        // If admin, fetch all conversations
        if (req.user.role === 'admin') {
            conversations = await Conversation.find()
                .populate('participants', 'name email role')
                .sort('-updatedAt');
        } else {
            // Otherwise, fetch user's specific conversations
            conversations = await Conversation.find({ participants: req.user.id })
                .populate('participants', 'name email role')
                .sort('-updatedAt');
        }

        res.status(200).json({
            success: true,
            count: conversations.length,
            data: conversations
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get messages for a specific conversation
// @route   GET /api/v1/support/conversations/:id/messages
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        // Check auth
        const isAdmin = req.user?.role === 'admin';
        const isParticipant = req.user && conversation.participants?.map(p => p.toString()).includes(req.user.id.toString());

        if (!isAdmin && !isParticipant && !conversation.isGuest) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const messages = await Message.find({ conversationId: req.params.id })
            .populate('sender', 'name role')
            .sort('createdAt');

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new conversation or get existing one with admins
// @route   POST /api/v1/support/conversations
// @access  Public
exports.createConversation = async (req, res) => {
    try {
        // Find all admins
        const admins = await User.find({ role: 'admin' }).select('_id');
        const adminIds = admins.map(a => a._id);

        if (adminIds.length === 0) {
            return res.status(400).json({ success: false, message: 'No admins available to start a conversation' });
        }

        // If Guest (no req.user)
        if (!req.user) {
            const guestId = req.body.guestId;

            if (!guestId) {
                return res.status(400).json({ success: false, message: 'Guest ID is required' });
            }

            // Check if a guest conversation already exists
            let conversation = await Conversation.findOne({ guestId, isGuest: true });

            if (!conversation) {
                conversation = await Conversation.create({
                    participants: adminIds,
                    guestId,
                    isGuest: true,
                    status: 'open'
                });
            }

            return res.status(201).json({
                success: true,
                data: conversation
            });
        }

        // Check if a conversation between this user and all admins already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user.id, ...adminIds] }
        });

        // If not, create a new one
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user.id, ...adminIds],
                lastMessage: '',
                status: 'open'
            });
        }

        res.status(200).json({
            success: true,
            data: conversation
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Send a message in a conversation
// @route   POST /api/v1/support/conversations/:id/messages
// @access  Public
exports.sendMessage = async (req, res) => {
    try {
        const { text, guestId } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: 'Message text is required' });
        }

        const io = require('../socket').getIO();

        // Retrieve conversation
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        let messageData = {
            conversationId: conversation._id,
            text
        };

        // If Guest sender
        if (!req.user) {
            messageData.senderGuestId = guestId || conversation.guestId;
        } else {
            // Check auth for registered users
            if (!conversation.participants.includes(req.user.id) && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Not authorized' });
            }
            messageData.sender = req.user.id;
        }

        const message = await Message.create(messageData);

        // Update last message
        conversation.lastMessage = text;
        await conversation.save();

        const populatedMessage = await Message.findById(message._id).populate('sender', 'name role');

        // Emit real-time message
        io.to(conversation._id.toString()).emit('newSupportMessage', populatedMessage);
        io.to('admins_support').emit('newSupportMessage', populatedMessage);

        return res.status(201).json({
            success: true,
            data: populatedMessage
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
