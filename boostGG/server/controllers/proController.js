const User = require('../models/User');
const Order = require('../models/Order');
const Service = require('../models/Service');
const ProApplication = require('../models/ProApplication');
const { ROLES, PRO_TYPES } = require('../models/User');
const { isValidObjectId } = require('mongoose');

// @desc    Apply to become PRO
// @route   POST /api/pro/apply
// @access  Private (Customer)
exports.apply = async (req, res) => {
    try {
        const {
            proType,
            discord,
            telegram,
            email,
            hoursPerDay,
            experienceText,
            referralSource,
            games, // Expecting an array of strings
            personalStatement,
            experience,
            skills,
            availability
        } = req.body;

        // Check if user is already a PRO
        if (req.user && req.user.role === ROLES.PRO) {
            return res.status(400).json({
                success: false,
                message: 'You are already a PRO member'
            });
        }

        // Check for pending application
        if (req.user) {
            const hasPending = await ProApplication.hasPendingApplication(req.user._id);
            if (hasPending) {
                return res.status(400).json({
                    success: false,
                    message: 'You already have a pending application'
                });
            }
        } else {
            // Guest validation
            if (!email || !discord) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and Discord are required for application'
                });
            }

            // Check if guest already has a pending application by email
            const guestPending = await ProApplication.findOne({ email: email.toLowerCase(), status: 'pending' });
            if (guestPending) {
                return res.status(400).json({
                    success: false,
                    message: 'A pending application already exists for this email'
                });
            }
        }

        // Validate proType
        const validProTypes = Object.values(PRO_TYPES);
        if (!proType || !validProTypes.includes(proType)) {
            return res.status(400).json({
                success: false,
                message: 'Valid PRO type is required'
            });
        }

        // Create application
        const application = await ProApplication.create({
            userId: req.user?._id,
            proType,
            discord,
            telegram,
            email: email || req.user?.email,
            hoursPerDay,
            experienceText,
            referralSource,
            games: Array.isArray(games) ? games : [],
            personalStatement,
            experience,
            skills,
            availability,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error submitting application'
        });
    }
};

// @desc    Get PRO dashboard
// @route   GET /api/pro/dashboard
// @access  Private (PRO)
exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Get order stats
        const orderStats = await Order.aggregate([
            {
                $match: { pro: req.user._id }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    total: { $sum: '$price' }
                }
            }
        ]);

        // Get recent orders
        const recentOrders = await Order.find({ pro: req.user._id })
            .populate('serviceId', 'title icon')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get my services count
        const servicesCount = await Service.countDocuments({ providerId: req.user._id });

        res.json({
            success: true,
            data: {
                profile: user,
                orderStats,
                recentOrders,
                servicesCount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard'
        });
    }
};

// @desc    Get PRO orders
// @route   GET /api/pro/orders
// @access  Private (PRO)
exports.getOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = { pro: req.user._id };
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('serviceId', 'title icon price category')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({
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
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
};

// @desc    Accept/claim an order
// @route   POST /api/pro/orders/:orderId/accept
// @access  Private (PRO)
exports.acceptOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.pro) {
            return res.status(400).json({
                success: false,
                message: 'Order already accepted by another PRO'
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Order is not available'
            });
        }

        // Check if PRO can take this order (service matches their specialization)
        const service = await Service.findById(order.serviceId);
        if (service && service.providerId) {
            // Only the assigned PRO can take this order
            if (service.providerId.toString() !== req.user._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'This order is assigned to another PRO'
                });
            }
        }

        order.pro = req.user._id;
        order.status = 'processing';
        await order.save();

        res.json({
            success: true,
            message: 'Order accepted',
            data: order
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error accepting order'
        });
    }
};

// @desc    Update order status
// @route   PUT /api/pro/orders/:orderId/status
// @access  Private (PRO)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, proof } = req.body;

        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify ownership
        if (order.pro && order.pro.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this order'
            });
        }

        const validStatuses = ['processing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        order.status = status;
        if (proof) {
            order.proof = proof;
        }

        await order.save();

        // If completed, update PRO stats
        if (status === 'completed') {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: {
                    totalOrdersCompleted: 1,
                    earnings: order.price
                }
            });
        }

        res.json({
            success: true,
            message: 'Order status updated',
            data: order
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
        });
    }
};

// @desc    Add chat message to order
// @route   POST /api/pro/orders/:orderId/chat
// @access  Private (PRO)
exports.addChatMessage = async (req, res) => {
    try {
        const { message } = req.body;

        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is part of this order (either customer or PRO)
        const isCustomer = order.userId.toString() === req.user._id.toString();
        const isPro = order.pro && order.pro.toString() === req.user._id.toString();

        if (!isCustomer && !isPro) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        order.chat.push({
            sender: req.user._id,
            message
        });

        await order.save();

        res.json({
            success: true,
            message: 'Message sent',
            data: order.chat
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
};

// @desc    Get available boosting orders
// @route   GET /api/pro/boosting/orders
// @access  Private (PRO - Booster)
exports.getAvailableBoostingOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            pro: null,
            status: 'pending'
        })
            .populate('serviceId', 'title icon price category gameId')
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            data: orders
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
};

// @desc    Get earnings
// @route   GET /api/pro/earnings
// @access  Private (PRO)
exports.getEarnings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Get completed orders total
        const completedOrders = await Order.aggregate([
            {
                $match: {
                    pro: req.user._id,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$price' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                walletBalance: user.walletBalance,
                earnings: user.earnings,
                pendingEarnings: user.pendingEarnings,
                totalCompletedOrders: completedOrders[0]?.count || 0,
                totalEarnings: completedOrders[0]?.totalEarnings || 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching earnings'
        });
    }
};

// @desc    Get PRO services
// @route   GET /api/pro/services
// @access  Private (PRO)
exports.getMyServices = async (req, res) => {
    try {
        const services = await Service.find({ providerId: req.user._id })
            .populate('gameId', 'name slug icon')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: services
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching services'
        });
    }
};

// @desc    Create PRO service
// @route   POST /api/pro/services
// @access  Private (PRO)
exports.createService = async (req, res) => {
    try {
        const serviceData = {
            ...req.body,
            providerId: req.user._id
        };

        const service = await Service.create(serviceData);

        res.status(201).json({
            success: true,
            message: 'Service created',
            data: service
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error creating service'
        });
    }
};

// @desc    Update PRO service
// @route   PUT /api/pro/services/:serviceId
// @access  Private (PRO)
exports.updateService = async (req, res) => {
    try {
        let service = await Service.findById(req.params.serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check ownership
        if (service.providerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this service'
            });
        }

        service = await Service.findByIdAndUpdate(
            req.params.serviceId,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Service updated',
            data: service
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error updating service'
        });
    }
};

// @desc    Delete PRO service
// @route   DELETE /api/pro/services/:serviceId
// @access  Private (PRO)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check ownership
        if (service.providerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this service'
            });
        }

        await service.deleteOne();

        res.json({
            success: true,
            message: 'Service deleted'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error deleting service'
        });
    }
};

// @desc    Get PRO profile
// @route   GET /api/pro/profile
// @access  Private (PRO)
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('proSpecializations.game', 'name icon');

        res.json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
};

// @desc    Update PRO profile
// @route   PUT /api/pro/profile
// @access  Private (PRO)
exports.updateProfile = async (req, res) => {
    try {
        const { proSpecializations, proProfile, ...userData } = req.body;

        const updateData = { ...userData };
        if (proProfile) {
            updateData.proProfile = proProfile;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        // Update specializations if provided
        if (proSpecializations) {
            user.proSpecializations = proSpecializations;
            await user.save();
        }

        res.json({
            success: true,
            message: 'Profile updated',
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// Placeholder methods for gold/inventory and account management
exports.getGoldInventory = async (req, res) => {
    res.json({ success: true, message: 'Not implemented', data: [] });
};
exports.addGoldInventory = async (req, res) => {
    res.json({ success: true, message: 'Not implemented' });
};
exports.updateGoldInventory = async (req, res) => {
    res.json({ success: true, message: 'Not implemented' });
};
exports.deleteGoldInventory = async (req, res) => {
    res.json({ success: true, message: 'Not implemented' });
};
exports.getAccountListings = async (req, res) => {
    res.json({ success: true, message: 'Not implemented', data: [] });
};
exports.createAccountListing = async (req, res) => {
    res.json({ success: true, message: 'Not implemented' });
};
exports.updateAccountListing = async (req, res) => {
    res.json({ success: true, message: 'Not implemented' });
};
exports.deleteAccountListing = async (req, res) => {
    res.json({ success: true, message: 'Not implemented' });
};
exports.requestPayout = async (req, res) => {
    res.json({ success: true, message: 'Payout request submitted' });
};
