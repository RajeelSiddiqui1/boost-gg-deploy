const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// Common validation rules
const validators = {
    // Email validation
    email: body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),

    // Password validation
    password: body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),

    // MongoDB ObjectId validation
    mongoId: param('id')
        .isMongoId()
        .withMessage('Invalid ID format'),

    // Sanitize string inputs
    sanitizeString: (field) => body(field)
        .trim()
        .escape()
        .notEmpty()
        .withMessage(`${field} is required`),

    // Pagination validation
    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
    ]
};

module.exports = { validators, handleValidationErrors };
