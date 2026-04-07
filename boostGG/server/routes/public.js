const express = require('express');
const { getPublicSettings } = require('../controllers/adminController');

const router = express.Router();

router.get('/settings', getPublicSettings);

module.exports = router;
