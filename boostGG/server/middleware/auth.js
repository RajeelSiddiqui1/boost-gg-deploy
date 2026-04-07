const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    }
    // Allow Auth header for testing or native apps
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key-boostgg');
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

// Optional Protect - populates req.user if token is present, but doesn't error if not
exports.optionalProtect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key-boostgg');
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        // If token is invalid, we still proceed but without a user object
        next();
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Check if user has specific permission
exports.checkPermission = (permission) => {
    return (req, res, next) => {
        if (req.user.role === 'admin') {
            return next();
        }
        if (!req.user.permissions || !req.user.permissions.includes(permission)) {
            return res.status(403).json({
                success: false,
                message: `User does not have permission: ${permission}`
            });
        }
        next();
    };
};
