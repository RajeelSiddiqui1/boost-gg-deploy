const express = require('express');
const router = express.Router();
const {
    getCategoriesByGame,
    getCategoryBySlug,
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/game/:gameId', getCategoriesByGame);
router.get('/slug/:slug', getCategoryBySlug);

// Admin routes
router.get('/admin/all', [protect, authorize('admin')], getAdminCategories);
router.post('/admin', [protect, authorize('admin')], createCategory);
router.put('/admin/:id', [protect, authorize('admin')], updateCategory);
router.delete('/admin/:id', [protect, authorize('admin')], deleteCategory);

module.exports = router;
