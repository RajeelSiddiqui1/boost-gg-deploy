const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: [true, 'Please link this category to a game'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    icon: {
        type: String,
        default: ''
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

categorySchema.pre('save', async function () {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

module.exports = mongoose.model('Category', categorySchema);
