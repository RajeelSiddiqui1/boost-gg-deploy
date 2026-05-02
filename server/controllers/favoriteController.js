const Favorite = require('../models/Favorite');

// @desc    Toggle favorite
// @route   POST /api/v1/favorites/toggle
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
    try {
        const { itemId, itemType } = req.body;

        if (!itemId) {
            return res.status(400).json({ success: false, message: 'Please provide itemId' });
        }


        const existingFavorite = await Favorite.findOne({
            userId: req.user._id,
            itemId: itemId
        });

        if (existingFavorite) {
            // Remove from favorites
            await Favorite.deleteOne({ _id: existingFavorite._id });

            return res.status(200).json({
                success: true,
                message: 'Removed from favorites',
                isFavorite: false
            });
        } else {
            // Add to favorites
            if (!itemType) {
                return res.status(400).json({ success: false, message: 'Please provide itemType for new favorites' });
            }
            const favorite = await Favorite.create({

                userId: req.user._id,
                itemId,
                itemType
            });

            return res.status(201).json({
                success: true,
                message: 'Added to favorites',
                isFavorite: true,
                data: favorite
            });
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get user favorites
// @route   GET /api/v1/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
    try {
        const favorites = await Favorite.find({ userId: req.user._id })
            .populate({
                path: 'itemId',
                populate: {
                    path: 'gameId',
                    select: 'name title slug icon bgImage banner image'
                }
            });



        res.status(200).json({
            success: true,
            count: favorites.length,
            data: favorites
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Check if item is favorited
// @route   GET /api/v1/favorites/check/:itemId
// @access  Private
exports.checkFavorite = async (req, res, next) => {
    try {
        const favorite = await Favorite.findOne({ 
            userId: req.user._id, 
            itemId: req.params.itemId 
        });

        res.status(200).json({
            success: true,
            isFavorite: !!favorite
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
