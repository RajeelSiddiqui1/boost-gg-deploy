const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const logger = require('../config/logger');
const path = require('path');
const fs = require('fs');

// Helper to generate slug from title
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

// Helper function to delete file
const deleteFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (err) { logger.error(`Error deleting file: ${err.message}`); }
    }
};

// @desc    Get all blogs (Public)
// @route   GET /api/blogs
// @access  Public
exports.getAllBlogs = async (req, res) => {
    try {
        const { category, search, featured, status, limit = 10, page = 1 } = req.query;
        let query = {};

        // Status filtering
        if (status === 'all') {
            // View all blogs (for admin)
        } else if (status) {
            query.status = status;
        } else {
            query.status = 'published';
        }

        if (category) query.category = category;
        if (featured) query.isFeatured = featured === 'true';

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } }
            ];
        }

        const blogs = await Blog.find(query)
            .sort({ isFeatured: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');

        const total = await Blog.countDocuments(query);

        res.status(200).json({
            success: true,
            count: blogs.length,
            total,
            pages: Math.ceil(total / limit),
            data: blogs
        });
    } catch (error) {
        logger.error(`Error fetching blogs: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });

        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog post not found' });
        }

        // Increment views
        blog.views += 1;
        await blog.save();

        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        logger.error(`Error fetching blog: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get single blog by ID (Admin)
// @route   GET /api/blogs/admin/:id
// @access  Private/Admin
exports.getBlogById = async (req, res) => {
    try {
        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid blog ID' });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        logger.error(`Error fetching blog: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Create blog (Admin)
// @route   POST /api/admin/blogs
// @access  Private/Admin
exports.createBlog = async (req, res) => {
    try {
        const { title, content, category, shortDescription, isFeatured, status, author, layout } = req.body;

        const slug = slugify(title);

        // Check for duplicate slug
        const existingBlog = await Blog.findOne({ slug });
        const finalSlug = existingBlog ? `${slug}-${Date.now()}` : slug;

        const blogData = {
            title,
            slug: finalSlug,
            content: content || '',
            category,
            shortDescription: shortDescription || '',
            isFeatured: isFeatured === 'true',
            status: status || 'draft',
            author: author || 'BoostGG Team',
            image: req.file ? `/uploads/blogs/${req.file.filename}` : 'no-image.jpg',
            layout: layout ? JSON.parse(layout) : []
        };

        // If PRO user is posting, override author details
        if (req.user.role !== 'admin') {
            blogData.author = req.user.username;
            blogData.authorId = req.user._id;
            blogData.isProAuthor = true;
        }

        const blog = await Blog.create(blogData);
        logger.info(`Blog created: ${blog.title} by ${req.user.role === 'admin' ? 'admin' : req.user.username}`);

        res.status(201).json({ success: true, data: blog });
    } catch (error) {
        logger.error(`Error creating blog: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update blog (Admin)
// @route   PUT /api/admin/blogs/:id
// @access  Private/Admin
exports.updateBlog = async (req, res) => {
    try {
        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid blog ID' });
        }

        let blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        // Access check: PRO can only edit their own blogs
        if (req.user.role !== 'admin' && blog.authorId?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to edit this blog' });
        }

        const { title, content, category, shortDescription, isFeatured, status, author, layout } = req.body;

        const updateData = {
            title: title || blog.title,
            content: content || blog.content,
            category: category || blog.category,
            shortDescription: shortDescription || blog.shortDescription,
            isFeatured: isFeatured !== undefined ? isFeatured === 'true' : blog.isFeatured,
            status: status || blog.status,
            author: author || blog.author,
            updatedAt: Date.now()
        };

        // Handle layout if provided
        if (layout) {
            updateData.layout = JSON.parse(layout);
        }

        if (title && title !== blog.title) {
            updateData.slug = slugify(title);
        }

        if (req.file) {
            if (blog.image && blog.image !== 'no-image.jpg') {
                deleteFile(path.join(__dirname, '../uploads/blogs', path.basename(blog.image)));
            }
            updateData.image = `/uploads/blogs/${req.file.filename}`;
        }

        blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        logger.error(`Error updating blog: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete blog (Admin)
// @route   DELETE /api/admin/blogs/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res) => {
    try {
        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid blog ID' });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        // Delete image from disk
        if (blog.image && blog.image !== 'no-image.jpg') {
            deleteFile(path.join(__dirname, '../uploads/blogs', path.basename(blog.image)));
        }

        await blog.deleteOne();
        logger.info(`Blog deleted: ${blog.title}`);

        res.status(200).json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting blog: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
