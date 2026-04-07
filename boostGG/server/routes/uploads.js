const express = require('express');
const router = express.Router();
const { uploadMultiple } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/multiple', protect, authorize('admin'), upload.array('files', 10), uploadMultiple);

module.exports = router;
