const mongoose = require('mongoose');
const slugify = require('slugify');

const SettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: [true, 'Please add a setting key'],
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Please add a setting value']
    },
    label: {
        type: String, // Human readable label
        required: true
    },
    description: {
        type: String
    },
    group: {
        type: String,
        enum: ['general', 'security', 'payment', 'email', 'content'],
        default: 'general'
    },
    type: {
        type: String,
        enum: ['string', 'number', 'boolean', 'json'],
        default: 'string'
    },
    isPublic: {
        type: Boolean,
        default: false // Whether this setting is exposed to public API
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Setting', SettingSchema);
