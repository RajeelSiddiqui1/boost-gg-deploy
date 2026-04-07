const Category = require('../models/Category');
const logger = require('../config/logger');
const { categorySchemas } = require('../utils/validationSchemas');

// Helper function to validate request body
const validate = (schema, data) => {
    return schema.validate(data, { abortEarly: false });
};

// @desc    Get all categories for a game
// @route   GET /api/v1/categories/game/:gameId
exports.getCategoriesByGame = async (req, res) => {
    try {
        const categories = await Category.find({ gameId: req.params.gameId, isActive: true })
            .sort({ sortOrder: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (err) {
        logger.error(`Error fetching categories by game: ${err.message}`);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get category by slug
// @route   GET /api/v1/categories/slug/:slug
exports.getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        logger.error(`Error fetching category by slug: ${err.message}`);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all categories for admin (all games)
// @route   GET /api/v1/categories/admin/all
exports.getAdminCategories = async (req, res) => {
    try {
        const { error, value } = validate(categorySchemas.query, req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        const {
            gameId,
            isActive,
            isFeatured,
            search,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = value;

        // Build query
        const query = {};
        if (gameId) query.gameId = gameId;
        if (isActive !== undefined) query.isActive = isActive;
        if (isFeatured !== undefined) query.isFeatured = isFeatured;

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [categories, total] = await Promise.all([
            Category.find(query)
                .populate('gameId', 'name slug')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Category.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        logger.error(`Error fetching admin categories: ${err.message}`);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create a new category
// @route   POST /api/v1/categories/admin
exports.createCategory = async (req, res) => {
    try {
        const { error, value } = validate(categorySchemas.create, req.body);
        if (error) {
            console.log('Category Creation Validation Error:', JSON.stringify(error.details, null, 2));
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        const category = await Category.create(value);
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        logger.error(`Error creating category: ${err.message}`);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update a category
// @route   PUT /api/v1/categories/admin/:id
exports.updateCategory = async (req, res) => {
    try {
        const { error, value } = validate(categorySchemas.update, req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        const category = await Category.findByIdAndUpdate(req.params.id, value, {
            new: true,
            runValidators: true
        });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, data: category });
    } catch (err) {
        logger.error(`Error updating category: ${err.message}`);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/v1/categories/admin/:id
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        await category.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        logger.error(`Error deleting category: ${err.message}`);
        res.status(400).json({ success: false, message: err.message });
    }
};
