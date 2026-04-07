const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    game: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: 'Services' },
    image: { type: String, required: true },
    price: { type: Number, required: true }, // Changed to number for math
    oldPrice: { type: Number },
    discount: { type: String },
    description: { type: String },
    requirements: [{ type: String }],
    rating: { type: Number, min: 0, max: 5, default: 5 },
    reviews: { type: String },
    platform: { type: String },
    gameIcon: { type: String },
    features: [{ type: String, trim: true }],

    // Calculator Data
    calculatorType: {
        type: String,
        enum: ['none', 'slider', 'range', 'dropdown'],
        default: 'none'
    },
    calculatorSettings: {
        min: { type: Number },
        max: { type: Number },
        unitName: { type: String },
        basePrice: { type: Number },
        step: { type: Number, default: 1 }
    },
    options: [{
        name: { type: String },
        type: { type: String, enum: ['checkbox', 'radio', 'dropdown'] },
        choices: [{
            label: { type: String },
            priceModifier: { type: Number }, // Extra PKR cost
            isDefault: { type: Boolean, default: false }
        }]
    }],

    isHot: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

offerSchema.index({ game: 1, isActive: 1 });
offerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Offer', offerSchema);
