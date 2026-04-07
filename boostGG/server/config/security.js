const helmet = require('helmet');

// ─────────────────────────────────────────────────────────────────────────────
// Custom NoSQL injection sanitizer
// Replaces: express-mongo-sanitize
// Reason: express-mongo-sanitize crashes on Node.js 18+ because req.query
// is a read-only getter and can no longer be reassigned.
// ─────────────────────────────────────────────────────────────────────────────
const sanitizeNoSQL = (value) => {
    if (typeof value === 'string') {
        return value.replace(/\$/g, '_').replace(/\./g, '_');
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeNoSQL);
    }
    if (typeof value === 'object' && value !== null) {
        const sanitized = {};
        for (const key of Object.keys(value)) {
            const safeKey = key.replace(/\$/g, '_').replace(/\./g, '_');
            sanitized[safeKey] = sanitizeNoSQL(value[key]);
        }
        return sanitized;
    }
    return value;
};

const mongoSanitizeMiddleware = (req, res, next) => {
    try {
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeNoSQL(req.body);
        }
        if (req.params && typeof req.params === 'object') {
            req.params = sanitizeNoSQL(req.params);
        }
        // NOTE: req.query is read-only in newer Node.js — do NOT sanitize it here
    } catch (e) {
        // Never crash on sanitize errors
    }
    next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom XSS sanitizer
// Replaces: xss-clean
// Reason: xss-clean crashes on Node.js 18+ for the same req.query reason.
// This only escapes dangerous HTML characters from req.body string values.
// ─────────────────────────────────────────────────────────────────────────────
const escapeHtml = (str) => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

const sanitizeXSS = (value) => {
    if (typeof value === 'string') {
        return escapeHtml(value);
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeXSS);
    }
    if (typeof value === 'object' && value !== null) {
        const sanitized = {};
        for (const key of Object.keys(value)) {
            sanitized[key] = sanitizeXSS(value[key]);
        }
        return sanitized;
    }
    return value;
};

const xssMiddleware = (req, res, next) => {
    try {
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeXSS(req.body);
        }
    } catch (e) {
        // Never crash on sanitize errors
    }
    next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Security configuration
// ─────────────────────────────────────────────────────────────────────────────
const securityConfig = (app) => {
    // Set security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:", "http://localhost:5000"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // Disable X-Powered-By header
    app.disable('x-powered-by');

    // NoSQL injection protection (custom, compatible with Node.js 18+)
    app.use(mongoSanitizeMiddleware);

    // XSS protection (custom, compatible with Node.js 18+)
    app.use(xssMiddleware);
};

module.exports = securityConfig;
