const Bid = require('../models/Bid');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { getIO } = require('../socket');

// Helper: Send notifications to specialized pros (uses bid.gameId directly)
const notifySpecializedPros = async (bid, actionLabel = 'New') => {
    try {
        const io = getIO();

        // Populate serviceId title for the message
        const order = await Order.findById(bid.orderId).populate('serviceId', 'title');
        const serviceTitle = order?.serviceId?.title || 'Service Order';

        const pros = await User.find({
            role: 'pro',
            'proSpecializations.game': bid.gameId
        });

        const notificationTitle = `${actionLabel} Order Bid Available!`;
        const notificationMessage = `A bid of $${bid.bidPrice} is available for ${serviceTitle}. Check it out now!`;
        const link = `/pro/notifications`;

        for (const pro of pros) {
            // 1. DB Notification
            await Notification.create({
                userId: pro._id,
                title: notificationTitle,
                message: notificationMessage,
                type: 'bid_created',
                link
            });

            // 2. Real-time Socket
            io.to(pro._id.toString()).emit('notification', {
                title: notificationTitle,
                message: notificationMessage,
                type: 'bid_created',
                link
            });

            // 3. Email (async, non-blocking)
            sendEmail({
                email: pro.email,
                subject: notificationTitle,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff; border-radius: 10px;">
                        <h2 style="color: #A2E63E;">${actionLabel} Bid Deployed!</h2>
                        <p>A bid has been ${actionLabel === 'Updated' ? 'updated' : 'placed'} for an order in your specialized game.</p>
                        <div style="background: #111; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Service:</strong> ${serviceTitle}</p>
                            <p><strong>Original Price:</strong> $${bid.originalPrice}</p>
                            <p><strong>Your Payout (Bid):</strong> $${bid.bidPrice}</p>
                        </div>
                        <a href="${process.env.CLIENT_URL}${link}" style="background: #A2E63E; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Order</a>
                    </div>
                `
            }).catch(e => console.error('Email Error:', e.message));
        }

        console.log(`Notified ${pros.length} pros for bid ${bid._id}`);
    } catch (error) {
        console.error('Notification Error:', error.message);
    }
};

// @desc    Get all bids (Admin only)
exports.getAllBids = async (req, res) => {
    try {
        const bids = await Bid.find()
            .populate({
                path: 'orderId',
                populate: { path: 'serviceId', select: 'title icon image' }
            })
            .populate('gameId', 'name')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: bids.length, data: bids });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update bid (price/status) — Admin only
exports.updateBidPrice = async (req, res) => {
    try {
        const { bidPrice, status } = req.body;

        let bid = await Bid.findById(req.params.id);
        if (!bid) {
            return res.status(404).json({ success: false, message: 'Bid not found' });
        }

        const oldPrice = bid.bidPrice;
        const oldStatus = bid.status;

        if (bidPrice !== undefined) bid.bidPrice = bidPrice;
        if (status !== undefined) bid.status = status;

        await bid.save();

        // Notify ONLY when bid becomes active (status changed to active, or price changed while active)
        const becameActive = oldStatus !== 'active' && bid.status === 'active';
        const priceChangedWhileActive = bidPrice !== undefined && bidPrice !== oldPrice && bid.status === 'active';

        if (becameActive) {
            await notifySpecializedPros(bid, 'New');
        } else if (priceChangedWhileActive) {
            await notifySpecializedPros(bid, 'Updated');
        }

        res.status(200).json({ success: true, data: bid });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create a bid for an order — Admin only
exports.createBid = async (req, res) => {
    try {
        const { orderId, bidPrice, status } = req.body;

        const order = await Order.findById(orderId).populate('serviceId', 'gameId title');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const existingBid = await Bid.findOne({ orderId });
        if (existingBid) {
            return res.status(400).json({ success: false, message: 'Bid already exists for this order' });
        }

        // Extract gameId from service (shortcut stored directly in bid)
        const gameId = order.serviceId?.gameId || null;

        const bidStatus = status || 'active';
        const bid = await Bid.create({
            orderId,
            gameId,
            originalPrice: order.price,
            bidPrice: bidPrice || Math.round((order.price * 0.1) * 100) / 100,
            status: bidStatus
        });

        // Only notify if created as active
        if (bidStatus === 'active') {
            await notifySpecializedPros(bid, 'New');
        }

        res.status(201).json({ success: true, data: bid });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get active bids for a Pro user (matched by their specializedGames)
exports.getProAvailableBids = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.proSpecializations || user.proSpecializations.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const specializedGameIds = user.proSpecializations.map(s => s.game);

        // Direct query using bid.gameId — no deep population needed
        const bids = await Bid.find({
            gameId: { $in: specializedGameIds },
            status: 'active'
        }).populate({
            path: 'orderId',
            populate: { path: 'serviceId', select: 'title icon image' }
        });

        res.status(200).json({ success: true, data: bids });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
