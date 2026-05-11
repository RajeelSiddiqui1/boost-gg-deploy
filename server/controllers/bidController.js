const Bid = require('../models/Bid');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const sendEmail = require('../utils/sendEmail');
const { getIO } = require('../socket');

// Helper: Send notifications to specialized pros in parallel
const notifySpecializedPros = async (bid, actionLabel = 'New') => {
    try {
        const io = getIO();

        // Populate serviceId title for the message
        const order = await Order.findById(bid.orderId).populate('serviceId', 'title');
        const serviceTitle = order?.serviceId?.title || 'Service Order';

        // Find all pros specialized in this game
        const pros = await User.find({
            role: 'pro',
            'proSpecializations.game': bid.gameId
        });

        if (pros.length === 0) return;

        const notificationTitle = `${actionLabel} Order Bid Available!`;
        const notificationMessage = `A bid of $${bid.bidPrice} is available for ${serviceTitle}. Check it out now!`;
        const link = `/dashboard?tab=work`;

        // Process notifications in parallel
        await Promise.all(pros.map(async (pro) => {
            try {
                // 1. DB Notification
                const newNotif = await Notification.create({
                    userId: pro._id,
                    title: notificationTitle,
                    message: notificationMessage,
                    type: actionLabel === 'New' ? 'bid_created' : 'bid_active',
                    link
                });

                // 2. Real-time Socket
                io.to(pro._id.toString()).emit('notification', {
                    _id: newNotif._id,
                    title: notificationTitle,
                    message: notificationMessage,
                    type: 'bid_created',
                    link,
                    createdAt: newNotif.createdAt,
                    isRead: false
                });

                // 3. Email (Still non-blocking within the map)
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
            } catch (err) {
                console.error(`Failed to notify pro ${pro._id}:`, err.message);
            }
        }));

        console.log(`Notified ${pros.length} pros for bid ${bid._id}`);
    } catch (error) {
        console.error('Notification Error:', error.message);
    }
};

// Helper: Send general notification in parallel
const sendParallelNotifications = async (notificationsToSend) => {
    try {
        if (notificationsToSend.length === 0) return;
        console.log(`Dispatching ${notificationsToSend.length} alerts...`);

        const io = getIO();
        await Promise.all(notificationsToSend.map(async (notif) => {
            try {
                if (!notif.userId) return;
                const uid = notif.userId.toString ? notif.userId.toString() : notif.userId;
                console.log(`Socket emitting to user room: ${uid}`);
                const newNotif = await Notification.create({
                    userId: uid,
                    title: notif.title,
                    message: notif.message,
                    type: notif.type || 'system',
                    link: notif.link || ''
                });

                io.to(uid).emit('notification', {
                    _id: newNotif._id,
                    title: notif.title,
                    message: notif.message,
                    type: notif.type || 'system',
                    link: notif.link || '',
                    createdAt: newNotif.createdAt,
                    isRead: false
                });
            } catch (err) {
                console.error(`Internal Notification Error for user ${notif.userId}:`, err.message);
            }
        }));
    } catch (error) {
        console.error('sendParallelNotifications Error:', error.message);
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

        // Real-time: refresh admin bids page + pro marketplace
        const io = getIO();
        io.emit('bidsUpdate', { action: 'updated', bidId: bid._id, status: bid.status, bidPrice: bid.bidPrice });
        io.emit('marketUpdate');

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

        // Real-time: push new bid to admin bids page + pro marketplace
        const io = getIO();
        io.emit('bidsUpdate', { action: 'created', bidId: bid._id, status: bid.status });
        io.emit('marketUpdate');

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

        const isUpdate = existingBidderIndex > -1;
        const boosterName = req.user.name;
        const order = await Order.findById(bid.orderId).populate('serviceId', 'title');
        const serviceTitle = order?.serviceId?.title || 'Service Order';

        // 1. Notify Admins (Parallel)
        const admins = await User.find({ role: 'admin' }, '_id email');
        const adminIds = admins.map(a => a._id);
        const adminData = {
            title: isUpdate ? `Pro Bid Updated! 🔄` : `New Pro Bid Received! 💰`,
            message: `Booster ${boosterName} has ${isUpdate ? 'updated their bid' : 'placed a bid'} to $${amount} on ${serviceTitle}.`,
            type: 'booster_bid',
            link: `/admin/bids/${bid._id}/details`
        };

        // 2. Notify other Bidders (Parallel)
        const otherBiddersIds = bid.bidders
            .filter(b => b.user.toString() !== req.user.id)
            .map(b => b.user);
        
        const otherBiddersData = {
            title: isUpdate ? `Bid Price Changed 📈` : `New Competitor Joined ⚔️`,
            message: isUpdate 
                ? `A booster has updated their bid for ${serviceTitle}. Check the new landscape!`
                : `A new pro has placed a bid on ${serviceTitle}. competition is heating up!`,
            type: 'bid_placed',
            link: `/dashboard?tab=work`
        };

        // Run both notification batches in parallel
        await Promise.all([
            sendParallelNotifications(adminIds.map(id => ({
                userId: id,
                ...adminData
            }))),
            sendParallelNotifications(otherBiddersIds.map(id => ({
                userId: id,
                ...otherBiddersData
            })))
        ]).catch(e => console.error('BoosterBid Notifications Error:', e.message));

        // 3. Real-time updates for the bid room & tables
        const io = getIO();
        io.to(bid._id.toString()).emit('bidUpdate', {
            bidId: bid._id,
            boosterName: boosterName,
            amount: amount
        });
        io.emit('bidsUpdate', { action: 'booster_bid', bidId: bid._id, boosterName, amount });

        // 4. Admin Emails (Non-blocking)
        admins.forEach(admin => {
            sendEmail({
                email: admin.email,
                subject: adminData.title,
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
                        <a href="${process.env.CLIENT_URL}${adminData.link}" style="background: #A2E63E; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Manage Bids</a>
                    </div>
                `
            }).catch(e => console.error('Admin Email Error:', e.message));
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

        const order = await Order.findById(bid.orderId).populate('serviceId', 'title');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const serviceTitle = order?.serviceId?.title || 'Mission';

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

        // Fetch winning pro details for name
        const winningPro = await User.findById(proId).select('name');
        const proName = winningPro?.name || 'a Pro Booster';

        // --- NOTIFICATIONS (Parallel) ---
        const winnerData = {
            title: 'Your Bid Accepted! 🏆',
            message: `Congratulations! Your bid for ${serviceTitle} was accepted. Check the mission board now!`,
            type: 'bid_won',
            link: `/dashboard?tab=work`
        };

        // 2. Notify other Bidders
        const loserIds = bid.bidders
            .filter(b => b.user.toString() !== proId.toString())
            .map(b => b.user);

        const losersData = {
            title: 'Bid Update: Mission Closed',
            message: `The mission for ${serviceTitle} has been assigned to another pro. Keep bidding!`,
            type: 'bid_approved',
            link: `/dashboard?tab=work`
        };

        const customerData = {
            title: 'Booster Assigned! 🚀',
            message: `Admin has assigned pro ${proName} to your order ${serviceTitle}.`,
            type: 'order_update',
            link: `/dashboard?tab=orders`
        };

        // Dispatch all in parallel
        await Promise.all([
            sendParallelNotifications([{
                userId: proId,
                ...winnerData
            }]),
            sendParallelNotifications(loserIds.map(id => ({
                userId: id,
                ...losersData
            }))),
            sendParallelNotifications([{
                userId: order.userId,
                ...customerData
            }])
        ]).catch(e => console.error('ApproveBid Notifications Error:', e.message));

        // Socket events for status refresh
        const io = getIO();
        io.to(bid._id.toString()).emit('bidUpdate', { bidId: bid._id, status: 'approved' });
        io.emit('bidsUpdate', { action: 'approved', bidId: bid._id, proId });
        io.emit('marketUpdate');

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

        // --- NOTIFICATIONS (Parallel) ---
        const boosterName = req.user.name;
        const serviceTitle = order?.serviceId?.title || 'Service Order';
        
        // 1. Notify Admins
        const admins = await User.find({ role: 'admin' }, '_id email');
        const adminIds = admins.map(a => a._id);
        const adminData = {
            title: `Mission Claimed Instantly! ⚡`,
            message: `Booster ${boosterName} has claimed ${serviceTitle} at the instant-access price.`,
            type: 'bid_claimed',
            link: `/admin/bids`
        };

        // 2. Notify the Booster (Self)
        const boosterData = {
            title: `Mission Claimed! ✅`,
            message: `You have successfully claimed "${serviceTitle}". Mission is now active!`,
            type: 'claim_assigned',
            link: `/dashboard?tab=orders`
        };

        // 3. Notify Other Bidders (Losers)
        const loserIds = bid.bidders
            .filter(b => b.user.toString() !== req.user.id)
            .map(b => b.user);
        const losersData = {
            title: 'Mission Update: Claimed',
            message: `The mission for ${serviceTitle} was claimed by another pro.`,
            type: 'bid_approved',
            link: `/dashboard?tab=work`
        };

        // 4. Notify Customer
        const customerData = {
            title: `Booster Assigned! 🚀`,
            message: `Booster ${boosterName} has claimed your order "${serviceTitle}" and started working.`,
            type: 'order_update',
            link: `/dashboard?tab=orders`
        };

        // Dispatch all in parallel
        await Promise.all([
            sendParallelNotifications(adminIds.map(id => ({
                userId: id,
                ...adminData
            }))),
            sendParallelNotifications([{
                userId: req.user.id,
                ...boosterData
            }]),
            sendParallelNotifications(loserIds.map(id => ({
                userId: id,
                ...losersData
            }))),
            sendParallelNotifications([{
                userId: order.userId,
                ...customerData
            }])
        ]).catch(e => console.error('BoosterClaim Notifications Error:', e.message));

        // Admin Emails (Non-blocking)
        admins.forEach(admin => {
            sendEmail({
                email: admin.email,
                subject: adminData.title,
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
        });

        // Socket events
        const io = getIO();
        io.to(bid._id.toString()).emit('bidUpdate', {
            bidId: bid._id,
            status: 'assigned',
            boosterName: boosterName
        });
        io.emit('bidsUpdate', { action: 'claimed', bidId: bid._id, boosterName });
        io.emit('marketUpdate');

        res.status(200).json({ success: true, message: 'Mission claimed and assigned successfully!', data: bid });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETION WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────

// @desc    PRO: Submit completion proof
// @route   POST /api/v1/bids/:id/complete
// @access  Private (PRO)
exports.submitCompletionProof = async (req, res) => {
    try {
        const bid = await Bid.findById(req.params.id)
            .populate({ path: 'orderId', populate: { path: 'serviceId userId', select: 'title name email' } })
            .populate('assignedUser', 'name email');

        if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });
        if (!bid.assignedUser || bid.assignedUser._id.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: 'Not authorized' });

        const { comment } = req.body;
        const imageUrl = req.file
            ? `/uploads/orders/complete-order-proof/${req.file.filename}`
            : null;

        if (!imageUrl) return res.status(400).json({ success: false, message: 'Proof image is required' });

        bid.completionProof = { imageUrl, comment, submittedAt: new Date() };
        bid.completionStatus = 'pro_submitted';
        await bid.save();

        const io = getIO();
        const order = bid.orderId;
        const customer = order?.userId;
        const serviceTitle = order?.serviceId?.title || 'your order';

        // Notify admins
        const admins = await User.find({ role: 'admin' }, '_id');
        const adminData = {
            title: 'Completion Proof Submitted',
            message: `Pro ${req.user.name} submitted proof for ${serviceTitle}.`,
            type: 'order_update',
            link: `/admin/bids/${bid._id}/details`
        };

        await sendParallelNotifications(admins.map(admin => ({
            userId: admin._id,
            ...adminData
        }))).catch(e => console.error('Admin Completion Notifications Error:', e.message));

        // Notify customer
        if (customer) {
            const customerData = {
                title: 'Mission Completed! Your Review Needed 🏁',
                message: `Your order "${serviceTitle}" has been completed by the pro. Please review and submit your confirmation.`,
                type: 'order_update',
                link: `/dashboard?tab=orders`
            };

            await sendParallelNotifications([{
                userId: customer._id,
                ...customerData
            }]).catch(e => console.error('Customer Completion Notifications Error:', e.message));
        }

        io.emit('bidsUpdate', { action: 'proof_submitted', bidId: bid._id });

        res.status(200).json({ success: true, message: 'Proof submitted successfully', data: bid });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    CUSTOMER: Submit their confirmation proof
// @route   POST /api/v1/bids/:id/customer-proof
// @access  Private (Customer)
exports.submitCustomerProof = async (req, res) => {
    try {
        const bid = await Bid.findById(req.params.id)
            .populate({ path: 'orderId', populate: { path: 'serviceId userId', select: 'title name email _id' } });

        if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

        const order = bid.orderId;
        if (!order || order.userId._id.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: 'Not authorized' });

        const { comment, status, keepExistingImage } = req.body;

        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/orders/customer-order-proof/${req.file.filename}`;
        } else if (keepExistingImage === 'true' && bid.customerProof?.imageUrl) {
            imageUrl = bid.customerProof.imageUrl;
        }

        bid.customerProof = { imageUrl, comment, status, approved: null, submittedAt: new Date() };
        bid.completionStatus = 'customer_submitted';
        await bid.save();

        const io = getIO();
        const serviceTitle = order?.serviceId?.title || 'order';
        const isRejection = status === 'rejected';

        // 1. Notify Admins
        const admins = await User.find({ role: 'admin' }, '_id');
        const adminData = {
            title: isRejection ? 'Mission Rejected by Customer ⚠️' : 'Mission Approved by Customer ✅',
            message: `Customer ${req.user.name} has ${isRejection ? 'rejected' : 'confirmed'} completion for ${serviceTitle}.`,
            type: 'order_update',
            link: `/admin/bids/${bid._id}/details`
        };

        // 2. Notify Pro
        const proId = bid.assignedUser;
        const proData = {
            title: isRejection ? 'Work Rejected! ❌' : 'Work Approved! ✨',
            message: isRejection 
                ? `Customer has rejected your submission for ${serviceTitle}. Please review feedback.`
                : `Customer has confirmed your work for ${serviceTitle}. Waiting for final admin payout!`,
            type: 'order_update',
            link: `/dashboard?tab=work`
        };

        await Promise.all([
            sendParallelNotifications(admins.map(admin => ({
                userId: admin._id,
                ...adminData
            }))),
            sendParallelNotifications([{
                userId: proId,
                ...proData
            }])
        ]).catch(e => console.error('CustomerReview Notifications Error:', e.message));

        io.emit('bidsUpdate', { action: 'customer_proof', bidId: bid._id });

        res.status(200).json({ success: true, message: 'Customer proof submitted', data: bid });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    ADMIN: Approve or reject completion
// @route   PUT /api/v1/bids/:id/review-completion
// @access  Private (ADMIN)
exports.reviewCompletion = async (req, res) => {
    try {
        const { decision, comment } = req.body; // decision: 'approved' | 'rejected'
        if (!['approved', 'rejected'].includes(decision))
            return res.status(400).json({ success: false, message: 'Decision must be approved or rejected' });

        const bid = await Bid.findById(req.params.id)
            .populate({ path: 'orderId', populate: { path: 'serviceId userId', select: 'title name email _id' } })
            .populate('assignedUser', 'name email _id');

        if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

        // 1. Restriction: Lock until customer review
        const lockedStatuses = ['none', 'pro_submitted'];
        if (lockedStatuses.includes(bid.completionStatus)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Administrative review is locked until customer provides confirmation or feedback.' 
            });
        }

        const isReApproval = bid.completionStatus === 'approved';
        bid.completionStatus = decision;
        if (bid.customerProof) bid.customerProof.approved = decision === 'approved';
        if (comment) bid.customerProof = { ...(bid.customerProof || {}), comment };

        const io = getIO();
        const order = bid.orderId;
        const serviceTitle = order?.serviceId?.title || 'order';
        const proId = bid.assignedUser?._id;
        const customerId = order?.userId?._id;

        if (decision === 'approved' && !isReApproval) {
            // Mark order as completed
            const updatedOrder = await Order.findByIdAndUpdate(bid.orderId._id || bid.orderId, { status: 'completed' }, { new: true });

            if (proId) {
                const pro = await User.findById(proId);
                if (pro) {
                    const amountToAdd = updatedOrder.boosterEarnings || bid.bidPrice || 0;
                    pro.earnings = (pro.earnings || 0) + amountToAdd;
                    pro.totalOrdersCompleted = (pro.totalOrdersCompleted || 0) + 1;
                    pro.missionDone = (pro.missionDone || 0) + 1;
                    await pro.save();

                    await Transaction.create({
                        user: proId,
                        type: 'credit',
                        amount: amountToAdd,
                        description: `Mission Completion: ${serviceTitle}`,
                        orderId: updatedOrder._id,
                        status: 'completed'
                    });
                }
            }
        }

        await bid.save();

        // --- NOTIFICATIONS ---
        const proNotifData = {
            title: decision === 'approved' ? '🎉 Mission Approved!' : '❌ Mission Rejected',
            message: decision === 'approved'
                ? `Admin has approved your completion of "${serviceTitle}". Payout processed.`
                : `Admin has rejected your completion of "${serviceTitle}". Please review the feedback.`,
            type: 'order_update',
            link: `/dashboard?tab=work`
        };

        const customerNotifData = {
            title: decision === 'approved' ? 'Mission Finalized ✅' : 'Mission Status: Disputed ⚠️',
            message: decision === 'approved'
                ? `Admin has finalized and approved the completion of "${serviceTitle}".`
                : `Admin has marked the completion of "${serviceTitle}" as rejected/disputed.`,
            type: 'order_update',
            link: `/dashboard?tab=orders`
        };

        await Promise.all([
            proId ? sendParallelNotifications([{
                userId: proId,
                ...proNotifData
            }]) : Promise.resolve(),
            customerId ? sendParallelNotifications([{
                userId: customerId,
                ...customerNotifData
            }]) : Promise.resolve()
        ]).catch(e => console.error('AdminReview Notifications Error:', e.message));

        io.emit('bidsUpdate', { action: 'admin_review', bidId: bid._id, status: decision });
        res.status(200).json({ success: true, message: `Completion ${decision}`, data: bid });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
