const Setting = require('../models/Setting');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.checkMaintenance = async (req, res, next) => {
    try {
        const setting = await Setting.findOne({ key: 'maintenance_mode' });

        if (setting && setting.value === true) {
            // Allow admin routes, auth routes (like login), and static files/assets if needed
            // But we want to block public access

            // Bypass for Admin API and Auth Login
            if (req.originalUrl.startsWith('/api/v1/admin') ||
                req.originalUrl.startsWith('/api/v1/auth/login') ||
                req.originalUrl.startsWith('/api/v1/auth/me')) { // Allow checking 'me' to confirm admin status

                // For admin routes, auth middleware will handle the rest.
                // But for pure maintenance, we might want to check token here if we want to be strict,
                // or just rely on the frontend to redirect/block.

                // Let's verify token to confirm if user is admin, otherwise block
                if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                    try {
                        const token = req.headers.authorization.split(' ')[1];
                        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key-boostgg');
                        const user = await User.findById(decoded.id);
                        if (user && user.role === 'admin') {
                            return next();
                        }
                    } catch (e) {
                        // Invalid token, proceed to block
                    }
                }

                // If it's the login route, let them try to log in (to potentially become admin)
                if (req.originalUrl.includes('/login')) {
                    return next();
                }
            }

            return res.status(503).json({
                success: false,
                message: 'Service Unavailable',
                maintenance: true
            });
        }

        next();
    } catch (err) {
        console.error('Maintenance check error:', err);
        next();
    }
};
