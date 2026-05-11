const Bid = require('../models/Bid');
const Order = require('../models/Order');
const User = require('../models/User');
const { getIO } = require('../socket');

// @desc    Get chat for a specific bid
// @route   GET /api/v1/chats/:bidId
// @access  Private
exports.getChat = async (req, res) => {
    try {
        const bid = await Bid.findById(req.params.bidId)
            .populate('chat.sender', 'name avatar role')
            .populate('chat.receiver', 'name avatar role')
            .populate('assignedUser', 'name avatar')
            .populate({
                path: 'orderId',
                select: 'userId pro status',
                populate: { path: 'userId', select: 'name avatar' }
            });

        if (!bid) {
            return res.status(404).json({ success: false, message: 'Bid Registry not found' });
        }

        // Check if user is part of this chat (Sender, Receiver, or Admin)
        const isParticipant = 
            bid.assignedUser?.toString() === req.user.id || 
            bid.orderId?.userId?._id.toString() === req.user.id || 
            req.user.role === 'admin';

        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this transmission' });
        }

        res.status(200).json({ success: true, data: bid.chat, bid });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get chat by Order ID
// @route   GET /api/v1/chats/order/:orderId
// @access  Private
exports.getChatByOrder = async (req, res) => {
    try {
        const bid = await Bid.findOne({ orderId: req.params.orderId })
            .populate('chat.sender', 'name avatar role')
            .populate('chat.receiver', 'name avatar role')
            .populate('assignedUser', 'name avatar')
            .populate({
                path: 'orderId',
                select: 'userId pro status',
                populate: { path: 'userId', select: 'name avatar' }
            });

        if (!bid) {
            return res.status(404).json({ success: false, message: 'No active bid registry found for this order' });
        }

        res.status(200).json({ success: true, data: bid.chat, bid });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Send a chat message
// @route   POST /api/v1/chats/:bidId
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { message, type = 'text', attachment } = req.body;
        const bid = await Bid.findById(req.params.bidId).populate('orderId');

        if (!bid) {
            return res.status(404).json({ success: false, message: 'Bid registry not found' });
        }

        // Determine receiver
        // If sender is Pro, receiver is Customer (bid.orderId.userId)
        // If sender is Customer, receiver is Pro (bid.assignedUser)
        let receiverId;
        if (req.user.role === 'pro') {
            receiverId = bid.orderId.userId;
        } else if (req.user.id.toString() === bid.orderId.userId.toString()) {
            receiverId = bid.assignedUser;
        } else if (req.user.role === 'admin') {
            // Admin sending message - determine who to send to (usually whoever is not the last sender)
            receiverId = bid.assignedUser; // Default to Pro for now
        }

        if (!receiverId) {
            return res.status(400).json({ success: false, message: 'No assigned partner found for this transmission' });
        }

        const newMessage = {
            sender: req.user.id,
            receiver: receiverId,
            message,
            role: req.user.role,
            type,
            attachment,
            timestamp: new Date(),
            seen: false
        };

        bid.chat.push(newMessage);
        await bid.save();

        // Populate sender info for real-time broadcast
        const populatedBid = await Bid.findById(bid._id)
            .populate('chat.sender', 'name avatar role')
            .populate('chat.receiver', 'name avatar role');
        
        const broadcastMsg = populatedBid.chat[populatedBid.chat.length - 1];
        const messageId = broadcastMsg._id;

        // Broadcast via Socket (Instant)
        try {
            const io = getIO();
            io.to(bid.orderId._id.toString()).emit('newMessage', broadcastMsg);
            io.to(bid._id.toString()).emit('newMessage', broadcastMsg);
        } catch (e) {
            console.error('Socket Error:', e.message);
        }

        // --- DELAYED NOTIFICATION ---
        // If message is not seen within 5 seconds, send a persistent notification
        setTimeout(async () => {
            try {
                const Notification = require('../models/Notification');
                const checkBid = await Bid.findById(bid._id);
                if (!checkBid) return;

                const msg = checkBid.chat.id(messageId);
                if (msg && !msg.seen) {
                    const io = getIO();
                    const notificationTitle = `New Message from ${req.user.name}`;
                    const notificationMessage = message.length > 50 ? `${message.substring(0, 50)}...` : message;
                    const link = `/pro/chat/${bid.orderId._id}`;

                    const newNotif = await Notification.create({
                        userId: receiverId,
                        title: notificationTitle,
                        message: notificationMessage,
                        type: 'chat_message',
                        link
                    });

                    io.to(receiverId.toString()).emit('notification', {
                        _id: newNotif._id,
                        title: notificationTitle,
                        message: notificationMessage,
                        type: 'chat_message',
                        link,
                        createdAt: newNotif.createdAt,
                        isRead: false
                    });
                }
            } catch (err) {
                console.error('Delayed Notif Error:', err.message);
            }
        }, 5000);

        res.status(200).json({ success: true, data: broadcastMsg });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mark messages as seen
// @route   PUT /api/v1/chats/:bidId/seen
// @access  Private
exports.markAsSeen = async (req, res) => {
    try {
        const bid = await Bid.findById(req.params.bidId);
        if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

        // Mark all messages where user is receiver and seen is false
        let updated = false;
        bid.chat.forEach(msg => {
            if (msg.receiver?.toString() === req.user.id && !msg.seen) {
                msg.seen = true;
                updated = true;
            }
        });

        if (updated) {
            await bid.save();
            const io = getIO();
            io.to(bid.orderId.toString()).emit('messagesSeen', { userId: req.user.id });
        }

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Upload chat file
// @route   POST /api/v1/chats/upload
// @access  Private
exports.uploadChatFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const fileType = req.file.mimetype.startsWith('image/') ? 'image'
            : req.file.mimetype.startsWith('video/') ? 'video'
                : req.file.mimetype === 'application/pdf' ? 'pdf'
                    : 'text';

        const subfolder = fileType === 'image' ? 'images'
            : fileType === 'video' ? 'videos'
                : fileType === 'pdf' ? 'pdf'
                    : 'others';

        const fileUrl = `/uploads/chats/${subfolder}/${req.file.filename}`;

        res.status(200).json({
            success: true,
            data: {
                url: fileUrl,
                name: req.file.originalname,
                size: req.file.size,
                type: fileType,
                mimeType: req.file.mimetype
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
