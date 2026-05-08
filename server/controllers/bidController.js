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
            .populate('assignedUser', 'name email avatar')
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
        
        let query = { status: 'active' };

        // If user is pro, filter by their games. If admin, show all active bids for testing.
        if (user.role === 'pro') {
            if (!user.proSpecializations || user.proSpecializations.length === 0) {
                return res.status(200).json({ success: true, data: [] });
            }
            const specializedGameIds = user.proSpecializations.map(s => s.game);
            query.gameId = { $in: specializedGameIds };
        }

        const bids = await Bid.find(query).populate({
            path: 'orderId',
            populate: { path: 'serviceId', select: 'title icon image' }
        }).populate('bidders.user', 'name');

        res.status(200).json({ success: true, data: bids });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    PRO: Place a bid on an admin-deployed bid
// @route   POST /api/v1/bids/:id/booster-bid
// @access  Private (PRO)
exports.boosterBid = async (req, res) => {
    try {
        const { amount } = req.body;
        const bid = await Bid.findById(req.params.id);

        if (!bid) {
            return res.status(404).json({ success: false, message: 'Bid not found' });
        }

        if (bid.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Bid is no longer active' });
        }

        if (amount < bid.bidPrice) {
            return res.status(400).json({ success: false, message: `Your bid must be at least $${bid.bidPrice}` });
        }

        // Check if user already bid
        const existingBidderIndex = bid.bidders.findIndex(b => b.user.toString() === req.user.id);

        if (existingBidderIndex > -1) {
            bid.bidders[existingBidderIndex].amount = amount;
            bid.bidders[existingBidderIndex].createdAt = Date.now();
        } else {
            bid.bidders.push({
                user: req.user.id,
                amount: amount
            });
        }

        // REMOVE FROM CLAIMS IF PRESENT (User decided to bid lower/differently)
        bid.claims = bid.claims.filter(c => c.user.toString() !== req.user.id);

        await bid.save();

        // NOTIFY ADMINS
        const admins = await User.find({ role: 'admin' });
        const io = getIO();
        const boosterName = req.user.name;

        // Populate service title for notification
        const order = await Order.findById(bid.orderId).populate('serviceId', 'title');
        const serviceTitle = order?.serviceId?.title || 'Service Order';

        const notificationTitle = `New Bid Placed!`;
        const notificationMessage = `Booster ${boosterName} has bid $${amount} for ${serviceTitle}.`;

        for (const admin of admins) {
            await Notification.create({
                userId: admin._id,
                title: notificationTitle,
                message: notificationMessage,
                type: 'booster_bid',
                link: `/admin/orders` // Assuming admin goes here to manage
            });

            io.to(admin._id.toString()).emit('notification', {
                title: notificationTitle,
                message: notificationMessage,
                type: 'booster_bid'
            });

            sendEmail({
                email: admin.email,
                subject: notificationTitle,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff; border-radius: 10px;">
                        <h2 style="color: #A2E63E;">New Booster Bid!</h2>
                        <p>A booster has placed a new bid on an active order.</p>
                        <div style="background: #111; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Booster:</strong> ${boosterName}</p>
                            <p><strong>Service:</strong> ${serviceTitle}</p>
                            <p><strong>Bid Amount:</strong> $${amount}</p>
                            <p><strong>Platform Price:</strong> $${bid.bidPrice}</p>
                        </div>
                        <a href="${process.env.CLIENT_URL}/admin/orders" style="background: #A2E63E; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Manage Bids</a>
                    </div>
                `
            }).catch(e => console.error('Admin Email Error:', e.message));
        }

        // 4. Emit live update to the specific bid room
        io.to(bid._id.toString()).emit('bidUpdate', {
            bidId: bid._id,
            boosterName: boosterName,
            amount: amount
        });

        res.status(200).json({ success: true, data: bid });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get bids I have participated in
// @route   GET /api/v1/bids/me
// @access  Private (PRO)
exports.getMyBids = async (req, res) => {
    try {
        const bids = await Bid.find({
            $or: [
                { 'bidders.user': req.user.id },
                { 'claims.user': req.user.id },
                { assignedUser: req.user.id }
            ]
        }).populate({
            path: 'orderId',
            populate: { path: 'serviceId', select: 'title icon image' }
        }).populate('assignedUser', 'name email avatar').sort('-createdAt');

        res.status(200).json({ success: true, data: bids });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get specific bid with all bidders
// @route   GET /api/v1/bids/:id/bidders
// @access  Private
exports.getBidBidders = async (req, res) => {
    try {
        const bid = await Bid.findById(req.params.id)
            .populate('bidders.user', 'name avatar email')
            .populate('claims.user', 'name avatar email')
            .populate('assignedUser', 'name avatar email')
            .populate({
                path: 'orderId',
                populate: { path: 'serviceId', select: 'title icon image backgroundImage' }
            });

        if (!bid) {
            return res.status(404).json({ success: false, message: 'Bid not found' });
        }

        res.status(200).json({ success: true, data: bid });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    ADMIN: Approve a specific bid/claim and assign the order
// @route   PUT /api/v1/bids/:id/approve
// @access  Private (ADMIN)
exports.approveBid = async (req, res) => {
    try {
        const { proId, amount } = req.body;
        const bid = await Bid.findById(req.params.id);

        if (!bid) {
            return res.status(404).json({ success: false, message: 'Bid registry not found' });
        }

        const order = await Order.findById(bid.orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (bid.assignedUser) {
            return res.status(400).json({ success: false, message: 'This auction already has an assigned booster' });
        }

        // 1. Update Order status
        order.status = 'processing';
        order.boosterEarnings = amount;
        await order.save();

        // 2. Mark Bid as Inactive and set assignedUser
        bid.status = 'inactive';
        bid.assignedUser = proId;
        await bid.save();

        // 3. Notify Booster
        await Notification.create({
            userId: proId,
            title: 'Bid Approved!',
            message: `Your proposal for ${order._id} was approved. You can now start the mission.`,
            type: 'order_update',
            link: `/pro/order/${order._id}`
        });

        // 4. Emit socket to admin room for live refresh
        const io = getIO();
        io.to(bid._id.toString()).emit('bidUpdate', { bidId: bid._id, status: 'approved' });

        res.status(200).json({ success: true, message: 'Bid approved and order assigned successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    PRO: Claim an order via admin-deployed bid
// @route   POST /api/v1/bids/:id/claim
// @access  Private (PRO)
exports.boosterClaim = async (req, res) => {
    try {
        const bid = await Bid.findById(req.params.id);

        if (!bid) {
            return res.status(404).json({ success: false, message: 'Bid not found' });
        }

        if (bid.status !== 'active' || bid.assignedUser) {
            return res.status(400).json({ success: false, message: 'This mission is no longer available for claiming.' });
        }

        const order = await Order.findById(bid.orderId).populate('serviceId', 'title');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Associated order not found.' });
        }

        // 1. Update Order Status to Processing
        order.status = 'processing';
        order.boosterEarnings = bid.bidPrice; // Booster gets the platform-defined bid price
        await order.save();

        // 2. Assign User and finalize Bid status
        bid.assignedUser = req.user.id;
        bid.status = 'inactive'; // Auction ends
        bid.claims = []; // Clear claim requests as it's now assigned
        bid.bidders = []; // Clear other bidders
        await bid.save();

        // 3. Notify Administrators of the Instant Claim
        const admins = await User.find({ role: 'admin' });
        const io = getIO();
        const boosterName = req.user.name;
        const serviceTitle = order?.serviceId?.title || 'Service Order';

        const notificationTitle = `Mission Claimed Instantly!`;
        const notificationMessage = `Booster ${boosterName} has claimed ${serviceTitle} for $${bid.bidPrice}.`;

        for (const admin of admins) {
            await Notification.create({
                userId: admin._id,
                title: notificationTitle,
                message: notificationMessage,
                type: 'order_update',
                link: `/admin/bids`
            });

            io.to(admin._id.toString()).emit('notification', {
                title: notificationTitle,
                message: notificationMessage,
                type: 'order_update'
            });

            sendEmail({
                email: admin.email,
                subject: notificationTitle,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff; border-radius: 10px;">
                        <h2 style="color: #A2E63E;">Mission Claimed!</h2>
                        <p>A booster has claimed an active mission at the instant-access price.</p>
                        <div style="background: #111; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Booster:</strong> ${boosterName}</p>
                            <p><strong>Service:</strong> ${serviceTitle}</p>
                            <p><strong>Final Payout:</strong> $${bid.bidPrice}</p>
                        </div>
                        <a href="${process.env.CLIENT_URL}/admin/bids" style="background: #A2E63E; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Assigned Missions</a>
                    </div>
                `
            }).catch(e => console.error('Admin Email Error:', e.message));
        }

        // 4. Emit live update to the specific bid room to refresh booster dashboards
        io.to(bid._id.toString()).emit('bidUpdate', {
            bidId: bid._id,
            status: 'assigned',
            boosterName: boosterName
        });

        res.status(200).json({ success: true, message: 'Mission claimed and assigned successfully!', data: bid });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
