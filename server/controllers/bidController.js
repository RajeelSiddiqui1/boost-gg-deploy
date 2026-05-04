const OrderBid = require('../models/OrderBid');
const Order = require('../models/Order');
const { getIO } = require('../socket');

// @desc    Create a bid for an order
// @route   POST /api/v1/bids
// @access  Pro
exports.createBid = async (req, res, next) => {
    try {
        const { orderId, bidAmount, message, type } = req.body;

        // Check if order exists and is available
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.status !== 'pending' || order.pro) {
            return res.status(400).json({ success: false, message: 'Order is no longer available' });
        }

        // Check if Pro already bid
        const existingBid = await OrderBid.findOne({ orderId, proId: req.user._id });
        if (existingBid) {
            return res.status(400).json({ success: false, message: 'You have already bid on this order' });
        }

        const bid = await OrderBid.create({
            orderId,
            proId: req.user._id,
            bidAmount,
            message,
            type: type || 'bid'
        });

        res.status(201).json({ success: true, data: bid });

        // Emit real-time update
        const io = getIO();
        io.emit('marketUpdate'); // Global refresh for market
        io.to(orderId.toString()).emit('bidUpdate', { orderId });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all bids for a specific order (Admin only)
// @route   GET /api/v1/bids/order/:orderId
// @access  Admin
exports.getBidsForOrder = async (req, res, next) => {
    try {
        const bids = await OrderBid.find({ orderId: req.params.orderId })
            .populate({
                path: 'proId',
                populate: {
                    path: 'specializedGames',
                    model: 'Game'
                }
            })
            .sort('-createdAt');

        res.status(200).json({ success: true, count: bids.length, data: bids });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Accept a bid (Admin only)
// @route   PUT /api/v1/bids/:id/accept
// @access  Admin
exports.acceptBid = async (req, res, next) => {
    try {
        const bid = await OrderBid.findById(req.params.id);
        if (!bid) {
            return res.status(404).json({ success: false, message: 'Bid not found' });
        }

        const order = await Order.findById(bid.orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Assign Pro to order and update status
        order.pro = bid.proId;
        order.status = 'processing';
        await order.save();

        // Update bid status
        bid.status = 'approved';
        await bid.save();

        // Reject all other bids for this order
        await OrderBid.updateMany(
            { orderId: bid.orderId, _id: { $ne: bid._id } },
            { status: 'rejected' }
        );

        res.status(200).json({ success: true, message: 'Order assigned to Pro successfully', data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update a bid (Pro only)
// @route   PUT /api/v1/bids/:id
// @access  Pro
exports.updateBid = async (req, res, next) => {
    try {
        let bid = await OrderBid.findById(req.params.id);

        if (!bid) {
            return res.status(404).json({ success: false, message: 'Bid not found' });
        }

        // Make sure bid belongs to user
        if (bid.proId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this bid' });
        }

        if (bid.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Cannot update a bid that has already been reviewed' });
        }

        bid = await OrderBid.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: bid });

        // Emit real-time update
        const io = getIO();
        io.emit('marketUpdate');
        io.to(bid.orderId.toString()).emit('bidUpdate', { orderId: bid.orderId });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get my bids (Pro only)
// @route   GET /api/v1/bids/me
// @access  Pro
exports.getMyBids = async (req, res, next) => {
    try {
        const bids = await OrderBid.find({ proId: req.user._id })
            .populate({
                path: 'orderId',
                populate: { path: 'serviceId' }
            })
            .sort('-createdAt');

        // Add highest bid info and competitor list for each order
        const bidsWithCompetition = await Promise.all(bids.map(async (bid) => {
            const allBidsForOrder = await OrderBid.find({ orderId: bid.orderId._id })
                .populate('proId', 'name avatar')
                .sort('bidAmount');
            
            const highestBid = allBidsForOrder[0]; // Assuming lower is better/competitive
            
            return {
                ...bid.toObject(),
                highestBid: highestBid ? highestBid.bidAmount : bid.bidAmount,
                isLowest: highestBid ? (highestBid._id.toString() === bid._id.toString()) : true,
                competitors: allBidsForOrder
                    .filter(b => b.proId._id.toString() !== req.user._id.toString())
                    .map(b => ({
                        name: b.proId.name,
                        amount: b.bidAmount
                    }))
            };
        }));

        res.status(200).json({ success: true, count: bids.length, data: bidsWithCompetition });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
