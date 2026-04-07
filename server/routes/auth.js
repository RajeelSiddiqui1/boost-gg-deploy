const express = require('express');
const { signup, login, logout, getMe, verifyEmail, resendVerification, forgotPassword, resetPassword, updatePassword, checkStatus } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { ROLES, PRO_TYPES, AFFILIATE_TYPES } = require('../models/User');

const router = express.Router();

// Role constants for documentation
router.get('/roles', (req, res) => {
    res.json({
        success: true,
        data: {
            roles: ROLES,
            proTypes: PRO_TYPES,
            affiliateTypes: AFFILIATE_TYPES
        }
    });
});

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/forget-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/status', checkStatus);
router.put('/updatepassword', protect, updatePassword); // Add protect middleware

module.exports = router;
