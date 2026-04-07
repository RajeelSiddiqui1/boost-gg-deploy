const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (avatar) updates.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get wallet balance
// @route   GET /api/v1/users/wallet
// @access  Private
exports.getWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('walletBalance earnings pendingEarnings');
        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            data: {
                balance: user.walletBalance,
                earnings: user.earnings,
                pendingEarnings: user.pendingEarnings,
                transactions
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get transaction history
// @route   GET /api/v1/users/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id })
            .populate('orderId', 'offer amount')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({ success: true, data: transactions });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Apply for PRO status
// @route   POST /api/v1/users/apply-pro
// @access  Private
exports.applyForPro = async (req, res) => {
    try {
        const { discord, games, experience } = req.body;

        if (!discord || !games || !experience) {
            return res.status(400).json({ success: false, message: 'Please provide all application details' });
        }

        const user = await User.findById(req.user.id);

        if (user.proStatus === 'pending' || user.proStatus === 'approved') {
            return res.status(400).json({ success: false, message: 'Application already in progress or approved' });
        }

        user.proStatus = 'pending';
        user.proApplication = {
            discord,
            games,
            experience,
            appliedAt: Date.now()
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                proStatus: user.proStatus,
                proApplication: user.proApplication
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Toggle saved game
// @route   POST /api/v1/users/saved-games/:gameId
// @access  Private
exports.toggleSavedGame = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const gameId = req.params.gameId;

        const index = user.savedGames.indexOf(gameId);

        if (index > -1) {
            // Remove if already saved
            user.savedGames.splice(index, 1);
            await user.save();
            res.status(200).json({ success: true, message: 'Game removed from favorites', isSaved: false });
        } else {
            // Add if not saved
            user.savedGames.push(gameId);
            await user.save();
            res.status(200).json({ success: true, message: 'Game added to favorites', isSaved: true });
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
