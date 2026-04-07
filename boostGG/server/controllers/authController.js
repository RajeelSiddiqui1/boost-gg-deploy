const User = require('../models/User');
const { ROLES, PRO_TYPES, AFFILIATE_TYPES } = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { AffiliateReferral } = require('../models/Affiliate');

// Generate JWT Token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-super-secret-key-boostgg', {
        expiresIn: '30d'
    });
};

// Create and send cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
    };

    user.password = undefined;

    res.status(statusCode).cookie('token', token, cookieOptions).json({
        success: true,
        token,
        data: user
    });
};

// @desc    Register User
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
    try {
        const { name, surname, username, email, password, role, proType, affiliateType, referralCode } = req.body;

        // Check if registration is allowed
        const Setting = require('../models/Setting');
        const regSetting = await Setting.findOne({ key: 'allow_registration' });
        if (regSetting && regSetting.value === false) {
            return res.status(403).json({ success: false, message: 'Registration is currently disabled.' });
        }

        // Validate role
        const validRoles = Object.values(ROLES);
        const requestedRole = role || ROLES.CUSTOMER;
        
        if (!validRoles.includes(requestedRole)) {
            return res.status(400).json({ success: false, message: 'Invalid role specified.' });
        }

        // Validate PRO type if role is PRO
        if (requestedRole === ROLES.PRO) {
            const validProTypes = Object.values(PRO_TYPES);
            if (!proType || !validProTypes.includes(proType)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Valid PRO type is required. Options: booster, gold_seller, account_seller, content_creator, influencer_partner' 
                });
            }
        }

        // Validate affiliate type if role is affiliate
        if (requestedRole === ROLES.AFFILIATE) {
            const validAffiliateTypes = Object.values(AFFILIATE_TYPES);
            if (!affiliateType || !validAffiliateTypes.includes(affiliateType)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Valid affiliate type is required. Options: creator, promoter' 
                });
            }
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Check for referral code and find referrer
        let referredBy = null;
        if (referralCode) {
            const referrer = await User.findOne({ affiliateCode: referralCode });
            if (referrer) {
                referredBy = referrer._id;
                
                // Create referral record
                try {
                    const { AffiliateReferral } = require('../models/Affiliate');
                    await AffiliateReferral.create({
                        affiliateId: referrer._id,
                        referralCode,
                        referredUserId: null, // Will update after user is created
                        status: 'pending'
                    });
                } catch (err) {
                    console.error('Error creating referral:', err);
                }
            }
        }

        // Create user
        const userData = {
            name,
            surname,
            username,
            email,
            password,
            role: requestedRole,
            verificationToken
        };

        // Add PRO type if applicable
        if (requestedRole === ROLES.PRO) {
            userData.proType = proType;
            userData.proStatus = 'pending'; // Requires approval
        }

        // Add affiliate type if applicable
        if (requestedRole === ROLES.AFFILIATE) {
            userData.affiliateType = affiliateType;
        }

        // Add referral if applicable
        if (referredBy) {
            userData.referredBy = referredBy;
        }

        const user = await User.create(userData);

        // Update referral record with user ID
        if (referralCode) {
            try {
                const { AffiliateReferral } = require('../models/Affiliate');
                await AffiliateReferral.findOneAndUpdate(
                    { referralCode, referredUserId: null },
                    { referredUserId: user._id, status: 'active' }
                );
                
                // Increment referrer's referral count
                await User.findByIdAndUpdate(referredBy, {
                    $inc: { affiliateTotalReferrals: 1 }
                });
            } catch (err) {
                console.error('Error updating referral:', err);
            }
        }

        // Send verification email
        const verifyUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify/${verificationToken}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #7C3AED; text-align: center;">Welcome to BoostGG!</h2>
                <p>Hi ${name},</p>
                <p>Thank you for signing up. Please verify your email address to activate your account and access all our premium boosting services.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #444;">${verifyUrl}</p>
                <p>Welcome to the elite!</p>
                <p><strong>The BoostGG Team</strong></p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your BoostGG Account',
                html
            });

            res.status(201).json({
                success: true,
                message: 'Verification email sent! Please check your inbox.'
            });
        } catch (err) {
            user.verificationToken = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (err) {
        // Handle duplicate email error
        if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please login or use a different email.'
            });
        }

        // Handle validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        // Generic error
        res.status(400).json({ success: false, message: err.message || 'Registration failed. Please try again.' });
    }
};

// @desc    Verify Email
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now login.'
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Resend Verification Email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide email address' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified. You can login now.' });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        await user.save({ validateBeforeSave: false });

        // Send verification email
        const verifyUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify/${verificationToken}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #7C3AED; text-align: center;">Verify Your BoostGG Account</h2>
                <p>Hi ${user.name},</p>
                <p>You requested a new verification link. Please verify your email address to activate your account and access all our premium boosting services.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #444;">${verifyUrl}</p>
                <p>Welcome to the elite!</p>
                <p><strong>The BoostGG Team</strong></p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your BoostGG Account',
                html
            });

            res.status(200).json({
                success: true,
                message: 'Verification email sent! Please check your inbox.'
            });
        } catch (err) {
            user.verificationToken = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Please verify your email to login' });
        }

        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Logout User / Clear Cookie
// @route   GET /api/auth/logout
// @access  Public
exports.logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide email address' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email' });
        }

        // Generate reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #7C3AED; text-align: center;">Password Reset Request</h2>
                <p>Hi ${user.name},</p>
                <p>You requested a password reset. Please click the button below to reset your password. This link is valid for 10 minutes.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p>If you did not request this, please ignore this email.</p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #444;">${resetUrl}</p>
                <p>Regards,</p>
                <p><strong>The BoostGG Team</strong></p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request - BoostGG',
                html
            });

            res.status(200).json({
                success: true,
                message: 'Password reset email sent! Please check your inbox.'
            });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: resetPasswordToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        // Set new password
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now login.'
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get Current Logged In User
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
// @desc    Update Password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.comparePassword(req.body.currentPassword))) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Check System Status / Maintenance
// @route   GET /api/auth/status
// @access  Public
exports.checkStatus = async (req, res) => {
    // If we reached here, maintenance middleware passed.
    res.status(200).json({ success: true, maintenance: false });
};
