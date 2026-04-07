const express = require('express');
const router = express.Router();
const {
    getAllBlogs,
    getBlogBySlug,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog
} = require('../controllers/blogController');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const blogUpload = require('../middleware/blogUpload');

// Public Routes
router.get('/', getAllBlogs);
router.get('/:slug', getBlogBySlug);

// Protected Routes (Admin or users with post_blog permission)
router.get('/admin/:id', protect, checkPermission('post_blog'), getBlogById);
router.post('/admin', protect, checkPermission('post_blog'), blogUpload.single('image'), createBlog);
router.put('/admin/:id', protect, checkPermission('post_blog'), blogUpload.single('image'), updateBlog);
router.delete('/admin/:id', protect, authorize('admin'), deleteBlog);

module.exports = router;
