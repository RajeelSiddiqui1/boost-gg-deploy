const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const logger = require('../config/logger');
        
        logger.info(`DEBUG: Fetching notifications for user ${userId} (${req.user.name})`);

        const notifications = await Notification.find({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({ 
            userId: userId, 
            isRead: false 
        });

        logger.info(`DEBUG: Found ${notifications.length} notifications (${unreadCount} unread)`);

        res.status(200).json({
            success: true,
            unreadCount,
            data: notifications
        });
    } catch (err) {
        console.error('Fetch Notifications Error:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mark all as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
