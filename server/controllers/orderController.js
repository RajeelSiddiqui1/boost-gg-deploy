const Order = require('../models/Order');
const User = require('../models/User');
const PromoCode = require('../models/PromoCode');

exports.createOrder = async (req, res) => {
    try {
        const { items, contactInfo, paymentMethod, promoCode } = req.body;
        const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items in cart' });
        }

        // Calculate total and validate promo code
        let discount = 0;
        let promoData = null;

        if (promoCode) {
            const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
            const promoResult = await PromoCode.validateCode(promoCode, req.user.id, totalAmount);

            if (!promoResult.valid) {
                return res.status(400).json({ success: false, message: promoResult.message });
            }

            discount = promoResult.discount;
            promoData = {
                code: promoResult.promo.code,
                discount: discount
            };
        }

        const orders = [];
        for (const item of items) {
            const orderCount = await Order.countDocuments();
            const orderId = `BGG-${1000 + orderCount}`; // BoostGG order ID format

            const itemPrice = item.price || 0;
            const itemCashback = parseFloat((itemPrice * 0.05).toFixed(2)); // 5% cashback

            const order = await Order.create({
                userId: req.user.id,
                serviceId: item.id,
                price: itemPrice,
                contactInfo: contactInfo,
                selectedOptions: item.selectedOptions,
                platform: item.platform || 'Any',
                region: item.region || 'Any',
                cashbackEarned: itemCashback,
                calcValue: item.calcValue,
                transactionId: transactionId,
                status: 'pending',
                promoCode: promoData?.code,
                discount: discount / items.length // Distribute discount equally
            });
            orders.push(order);
        }

        // Update promo code usage
        if (promoCode) {
            await PromoCode.findOneAndUpdate(
                { code: promoCode.toUpperCase() },
                { $inc: { currentUses: 1 } }
            );
        }

        res.status(201).json({
            success: true,
            message: 'Orders placed successfully',
            transactionId,
            orders,
            discountApplied: discount
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('serviceId', 'title image icon backgroundImage characterImage game')
            .populate('pro', 'name')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getAvailableOrders = async (req, res) => {
    try {
        // Available orders for PROs (pending and no pro assigned)
        const orders = await Order.find({ status: 'pending', pro: { $exists: false } })
            .populate('serviceId', 'title image icon backgroundImage characterImage game pricing categorySlug pricingRules')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getBoosterOrders = async (req, res) => {
    try {
        const orders = await Order.find({ pro: req.user.id })
            .populate('serviceId', 'title image icon backgroundImage characterImage game pricing categorySlug pricingRules')
            .populate('userId', 'name email')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.completeOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Only assigned pro or admin can complete
        if (order.pro.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const { proof, proofs } = req.body;
        order.status = 'completed';

        // Handle proofs
        if (proofs && Array.isArray(proofs)) {
            order.proofs = proofs.map(url => ({
                url,
                type: url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image'
            }));
            if (proofs.length > 0) order.proof = proofs[0]; // legacy fallback
        } else if (proof) {
            order.proof = proof;
            order.proofs = [{ url: proof, type: proof.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image' }];
        }

        order.completedAt = Date.now();
        await order.save();

        // Update pro's earnings and stats
        const pro = await User.findById(order.pro);
        if (pro) {
            const earningsToAdd = order.boosterEarnings || (order.price * (pro.boosterCommissionRate / 100));
            pro.earnings += earningsToAdd;
            pro.completedOrders += 1;
            await pro.save({ validateBeforeSave: false });
        }

        // Add 5% cashback to customer's wallet balance
        if (order.cashbackEarned > 0) {
            const customer = await User.findById(order.userId);
            if (customer) {
                customer.walletBalance += order.cashbackEarned;
                await customer.save({ validateBeforeSave: false });
            }
        }

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.submitReview = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Only the customer who placed the order can review
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (order.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Order must be completed before reviewing' });
        }

        const { rating, review } = req.body;
        order.rating = rating;
        order.review = review;
        await order.save();

        // Update pro's overall rating (simplified)
        const pro = await User.findById(order.pro);
        if (pro) {
            const allReviews = await Order.find({ pro: order.pro, rating: { $exists: true } });
            const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
            pro.rating = avgRating;
            await pro.save({ validateBeforeSave: false });
        }

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.claimOrder = async (req, res, next) => {
    try {
        let order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.pro) return res.status(400).json({ success: false, message: 'Order already claimed' });

        // Assign booster and affiliate tracking
        order.pro = req.user.id;
        order.affiliateId = req.user.id; // As requested: pro's userId goes to affiliateId
        order.status = 'processing';

        // Calculate booster earnings at time of claiming
        const pro = await User.findById(req.user.id);
        if (!pro) return res.status(404).json({ success: false, message: 'Booster profile not found' });
        
        const commissionRate = pro.boosterCommissionRate || 80;
        order.boosterEarnings = Math.round((order.price * (commissionRate / 100)) * 100) / 100;

        await order.save();

        res.status(200).json({ success: true, message: 'Order claimed successfully and moved to processing', data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('serviceId')
            .populate('userId', 'name')
            .populate('pro', 'name');

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.sendChatMessage = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const { message, type = 'text', attachment } = req.body;

        const newMessage = {
            sender: req.user.id,
            message: message,
            type: type,
            attachment: attachment,
            timestamp: new Date()
        };

        order.chat.push(newMessage);
        await order.save();
        const broadcastMsg = order.chat[order.chat.length - 1];

        // Broadcast to order room
        try {
            const io = require('../socket').getIO();
            io.to(order._id.toString()).emit('newMessage', broadcastMsg);
        } catch (e) {
            console.error('Socket broadcast error:', e.message);
        }

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

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

exports.deleteChatMessage = async (req, res) => {
    try {
        console.log('Delete Request - Order ID:', req.params.id);
        console.log('Delete Request - Message ID:', req.body.messageId);

        const order = await Order.findById(req.params.id);
        if (!order) {
            console.log('Order not found');
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const { messageId } = req.body;
        if (!messageId) {
            return res.status(400).json({ success: false, message: 'Message ID is required' });
        }

        const messageIndex = order.chat.findIndex(m => m._id && m._id.toString() === messageId);
        
        if (messageIndex === -1) {
            console.log('Message not found in order. Chat length:', order.chat.length);
            // Log first few message IDs for debugging
            order.chat.slice(0, 3).forEach(m => console.log('Message ID in DB:', m._id));
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Only sender or admin can delete
        if (order.chat[messageIndex].sender.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
        }

        order.chat.splice(messageIndex, 1);
        await order.save();

        // Broadcast deletion
        try {
            const io = require('../socket').getIO();
            io.to(order._id.toString()).emit('messageDeleted', messageId);
        } catch (e) {
            console.error('Socket broadcast error:', e.message);
        }

        res.status(200).json({ success: true, message: 'Message deleted' });
    } catch (err) {
        console.error('Delete Chat Error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Admin: Assign PRO to order
// @route   PUT /api/v1/orders/:id/assign-pro
// @access  Private (Admin)
exports.assignProToOrder = async (req, res) => {
    try {
        const { proId } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Verify PRO exists
        const pro = await User.findById(proId);
        if (!pro || pro.role !== 'pro') {
            return res.status(400).json({ success: false, message: 'Invalid PRO' });
        }

        order.pro = proId;
        order.status = 'processing';
        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    PRO: Reject/leave an order
// @route   PUT /api/v1/orders/:id/reject
// @access  Private (PRO)
exports.rejectOrder = async (req, res) => {
    try {
        const { reason } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Only assigned pro can reject
        if (!order.pro || order.pro.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to reject this order' });
        }

        order.pro = null;
        order.status = 'pending';
        order.rejectReason = reason || 'No reason provided';
        await order.save();

        res.status(200).json({ success: true, message: 'Order rejected successfully', data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Admin: Get all orders with filters
// @route   GET /api/v1/orders/admin/all
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const { status, proId, userId, page = 1, limit = 20, search } = req.query;

        const orders = await Order.find(query)
            .populate('serviceId', 'title image icon backgroundImage characterImage game')
            .populate('userId', 'name email')
            .populate('pro', 'name email rating')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
