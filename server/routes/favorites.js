const express = require('express');
const { 
    toggleFavorite, 
    getFavorites, 
    checkFavorite 
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All favorite routes are protected

router.get('/', getFavorites);
router.post('/toggle', toggleFavorite);
router.get('/check/:itemId', checkFavorite);

module.exports = router;
