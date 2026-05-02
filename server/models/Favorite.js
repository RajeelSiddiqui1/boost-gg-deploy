const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Generic reference to the item
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'itemType',
        index: true
    },

    // Type of the item: 'Service', 'AccountListing', 'CurrencyListing'
    itemType: {
        type: String,
        required: true,
        enum: ['Service', 'AccountListing', 'CurrencyListing'],
        index: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate favorites
favoriteSchema.index({ userId: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
