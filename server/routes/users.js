const express = require('express');
const { getProfile, updateProfile, getWallet, getTransactions, applyForPro, toggleSavedGame } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All user routes are protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/wallet', getWallet);
router.get('/transactions', getTransactions);
router.post('/apply-pro', applyForPro);
router.post('/saved-games/:gameId', toggleSavedGame);

module.exports = router;
