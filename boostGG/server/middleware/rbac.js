const User = require('../models/User');
const ROLES = require('../models/User').ROLES;
const PRO_TYPES = require('../models/User').PRO_TYPES;
const AFFILIATE_TYPES = require('../models/User').AFFILIATE_TYPES;

/**
 * RBAC (Role-Based Access Control) Middleware
 * 
 * Provides granular permission checking for different user roles
 * and subtypes in the marketplace.
 */

// Permission definitions
const PERMISSIONS = {
    // Customer permissions
    'customer:read': ['customer'],
    'customer:write': ['customer'],
    'customer:order': ['customer'],
    'customer:chat': ['customer'],
    'customer:review': ['customer'],
    'customer:wallet': ['customer'],
    
    // PRO/Booster permissions
    'pro:read': ['pro'],
    'pro:write': ['pro'],
    'pro:orders:read': ['pro'],
    'pro:orders:write': ['pro'],
    'pro:earnings:read': ['pro'],
    'pro:service:create': ['pro'],
    'pro:service:edit': ['pro'],
    'pro:chat': ['pro'],
    'pro:payout:request': ['pro'],
    
    // PRO subtype specific
    'booster:accept_orders': ['pro'],
    'booster:complete_orders': ['pro'],
    'gold_seller:manage_inventory': ['pro'],
    'account_seller:manage_accounts': ['pro'],
    'content_creator:create_content': ['pro'],
    'influencer_partner:promote': ['pro'],
    
    // Affiliate permissions
    'affiliate:read': ['affiliate'],
    'affiliate:write': ['affiliate'],
    'affiliate:referrals:read': ['affiliate'],
    'affiliate:earnings:read': ['affiliate'],
    'affiliate:promote': ['affiliate'],
    'affiliate:payout:request': ['affiliate'],
    
    // Admin permissions
    'admin:read': ['admin'],
    'admin:write': ['admin'],
    'admin:users:manage': ['admin'],
    'admin:orders:manage': ['admin'],
    'admin:services:manage': ['admin'],
    'admin:games:manage': ['admin'],
    'admin:analytics:read': ['admin'],
    'admin:settings:manage': ['admin'],
    'admin:pro:approve': ['admin'],
    'admin:affiliate:manage': ['admin'],
    'admin:finances:manage': ['admin'],
    
    // Universal permissions
    '*': ['admin'],
    'auth:*': ['customer', 'pro', 'admin', 'affiliate']
};

// Check if user has a specific role
exports.hasRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
            });
        }

        next();
    };
};

// Check if user is a PRO (service provider)
exports.isPro = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    if (req.user.role !== ROLES.PRO) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. PRO account required.'
        });
    }

    // Check if PRO is verified/approved
    if (req.user.proStatus !== 'approved') {
        return res.status(403).json({
            success: false,
            message: 'Your PRO account is not yet approved.'
        });
    }

    next();
};

// Check if user is a verified PRO (optional stricter check)
exports.isVerifiedPro = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    if (req.user.role !== ROLES.PRO) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. PRO account required.'
        });
    }

    if (!req.user.isProVerified || req.user.proStatus !== 'approved') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Verified PRO account required.'
        });
    }

    next();
};

// Check if user is an affiliate
exports.isAffiliate = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    if (req.user.role !== ROLES.AFFILIATE) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Affiliate account required.'
        });
    }

    next();
};

// Check PRO subtype
exports.hasProType = (...proTypes) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        if (req.user.role !== ROLES.PRO) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. PRO account required.'
            });
        }

        if (!proTypes.includes(req.user.proType)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required PRO type: ${proTypes.join(', ')}. Your type: ${req.user.proType}`
            });
        }

        next();
    };
};

// Check affiliate type
exports.hasAffiliateType = (...affiliateTypes) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        if (req.user.role !== ROLES.AFFILIATE) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Affiliate account required.'
            });
        }

        if (!affiliateTypes.includes(req.user.affiliateType)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required affiliate type: ${affiliateTypes.join(', ')}. Your type: ${req.user.affiliateType}`
            });
        }

        next();
    };
};

// Check permission
exports.hasPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        const allowedRoles = PERMISSIONS[permission] || PERMISSIONS['*'];
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Permission '${permission}' required.`
            });
        }

        next();
    };
};

// Combined check - has role OR is admin
exports.hasRoleOrAdmin = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        // Admin always has access
        if (req.user.role === ROLES.ADMIN) {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}.`
            });
        }

        next();
    };
};

// Check if user can manage orders (admin or PRO)
exports.canManageOrders = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    const allowedRoles = [ROLES.ADMIN, ROLES.PRO];
    
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin or PRO account required.'
        });
    }

    // For PRO, check approval status
    if (req.user.role === ROLES.PRO && req.user.proStatus !== 'approved') {
        return res.status(403).json({
            success: false,
            message: 'Your PRO account is not yet approved.'
        });
    }

    next();
};

// Legacy function - keep for backward compatibility
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        // Map old role names to new ones for backward compatibility
        const roleMapping = {
            'user': ROLES.CUSTOMER,
            'admin': ROLES.ADMIN
        };

        const mappedRoles = roles.map(r => roleMapping[r] || r);
        
        if (!mappedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        
        next();
    };
};

// Export permissions and roles for external use
exports.PERMISSIONS = PERMISSIONS;
exports.ROLES = ROLES;
exports.PRO_TYPES = PRO_TYPES;
exports.AFFILIATE_TYPES = AFFILIATE_TYPES;
