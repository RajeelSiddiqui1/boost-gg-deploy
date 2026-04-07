const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    content: {
        type: String,
        default: ''
    },
    shortDescription: {
        type: String,
        trim: true,
        maxlength: [500, 'Short description cannot be more than 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Please provide a category (Game name)'],
        index: true
    },
    author: {
        type: String,
        default: 'BoostGG Team'
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isProAuthor: {
        type: Boolean,
        default: false
    },
    image: {
        type: String, // URL to the blog cover image
        default: 'no-image.jpg'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    views: {
        type: Number,
        default: 0
    },
    layout: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for search optimization
blogSchema.index({ title: 'text', content: 'text', category: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
