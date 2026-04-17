const Joi = require('joi');
const { SERVICE_TYPES, SERVICE_STATUS, PRICING_TYPES } = require('../models/Service');
const { GAME_CATEGORIES } = require('../models/Game');

// Common validation rules
const commonRules = {
    objectId: Joi.string().hex().length(24).messages({
        'string.hex': 'Invalid ID format',
        'string.length': 'Invalid ID format'
    }),

    positiveNumber: Joi.number().min(0).messages({
        'number.min': 'Value must be a positive number'
    }),

    percentage: Joi.number().min(0).max(100).messages({
        'number.min': 'Percentage must be at least 0',
        'number.max': 'Percentage cannot exceed 100'
    }),

    stringMax: (max) => Joi.string().max(max).messages({
        'string.max': `Cannot exceed ${max} characters`
    }),

    requiredString: (fieldName) => Joi.string().required().messages({
        'string.empty': `${fieldName} is required`
    })
};

// Game validation schemas
const gameSchemas = {
    // Validation for creating a game
    create: Joi.object({
        title: Joi.string()
            .trim()
            .min(1)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Game title is required',
                'string.min': 'Game title is required',
                'string.max': 'Game title cannot exceed 100 characters'
            }),

        subtitle: Joi.string()
            .trim()
            .max(200)
            .allow(''),

        description: Joi.string()
            .trim()
            .max(2000)
            .allow(''),

        category: Joi.string()
            .valid(...GAME_CATEGORIES)
            .default('Other'),

        icon: Joi.string()
            .trim()
            .allow(''),

        banner: Joi.string()
            .trim()
            .allow(''),

        offersCount: Joi.number()
            .integer()
            .min(0)
            .default(0),

        servicesCount: Joi.number()
            .integer()
            .min(0)
            .default(0),

        displayOrder: Joi.number()
            .integer()
            .min(0)
            .default(0),

        status: Joi.string()
            .valid('active', 'inactive')
            .default('active'),

        isPopular: Joi.boolean()
            .default(false),

        isHot: Joi.boolean()
            .default(false),

        serviceCategories: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                slug: Joi.string().required(),
                description: Joi.string().allow(''),
                icon: Joi.string().allow(''),
                displayOrder: Joi.number().integer().min(0).default(0)
            })
        ).default([])
    }),

    // Validation for updating a game
    update: Joi.object({
        title: Joi.string()
            .trim()
            .min(1)
            .max(100)
            .messages({
                'string.min': 'Game title is required',
                'string.max': 'Game title cannot exceed 100 characters'
            }),

        subtitle: Joi.string()
            .trim()
            .max(200)
            .allow(''),

        description: Joi.string()
            .trim()
            .max(2000)
            .allow(''),

        category: Joi.string()
            .valid(...GAME_CATEGORIES),

        icon: Joi.string()
            .trim()
            .allow(''),

        banner: Joi.string()
            .trim()
            .allow(''),

        offersCount: Joi.number()
            .integer()
            .min(0),

        servicesCount: Joi.number()
            .integer()
            .min(0),

        displayOrder: Joi.number()
            .integer()
            .min(0),

        status: Joi.string()
            .valid('active', 'inactive'),

        isPopular: Joi.boolean(),

        isHot: Joi.boolean(),

        serviceCategories: Joi.array().items(
            Joi.object({
                name: Joi.string(),
                slug: Joi.string(),
                description: Joi.string().allow(''),
                icon: Joi.string().allow(''),
                displayOrder: Joi.number().integer().min(0)
            })
        )
    }),

    // Validation for game query params
    query: Joi.object({
        search: Joi.string().trim().allow(''),
        category: Joi.string().valid(...GAME_CATEGORIES),
        status: Joi.string().valid('active', 'inactive'),
        isHot: Joi.boolean(),
        isPopular: Joi.boolean(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        sortBy: Joi.string().valid('title', 'displayOrder', 'createdAt').default('displayOrder'),
        sortOrder: Joi.string().valid('asc', 'desc').default('asc')
    })
};

// Category validation schemas
const categorySchemas = {
    create: Joi.object({
        name: Joi.string().trim().min(1).max(100).required(),
        gameId: Joi.string().hex().length(24).required(),
        parentId: Joi.string().hex().length(24).allow(null, ''),
        icon: Joi.string().trim().allow(''),
        sortOrder: Joi.number().integer().min(0).default(0),
        isFeatured: Joi.boolean().default(false),
        isActive: Joi.boolean().default(true)
    }),
    update: Joi.object({
        name: Joi.string().trim().min(1).max(100),
        gameId: Joi.string().hex().length(24),
        parentId: Joi.string().hex().length(24).allow(null, ''),
        icon: Joi.string().trim().allow(''),
        sortOrder: Joi.number().integer().min(0),
        isFeatured: Joi.boolean(),
        isActive: Joi.boolean()
    }),
    query: Joi.object({
        gameId: Joi.string().hex().length(24),
        isFeatured: Joi.boolean(),
        isActive: Joi.boolean(),
        search: Joi.string().trim().allow(''),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        sortBy: Joi.string().valid('name', 'sortOrder', 'createdAt').default('createdAt'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
};

// Service validation schemas
const serviceSchemas = {
    // Validation for creating a service
    create: Joi.object({
        title: Joi.string()
            .trim()
            .min(1)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Service title is required',
                'string.min': 'Service title is required',
                'string.max': 'Service title cannot exceed 100 characters'
            }),

        // Also accept 'name' field for backward compatibility
        name: Joi.string()
            .trim()
            .min(1)
            .max(100),

        // Dynamic fields (SkyCoach style)
        dynamicFields: Joi.array().items(
            Joi.object({
                fieldId: Joi.string().required(),
                label: Joi.string().required(),
                fieldType: Joi.string().valid('select', 'radio', 'checkbox', 'number', 'range', 'tier').default('select'),
                required: Joi.boolean().default(false),
                options: Joi.array().items(
                    Joi.object({
                        value: Joi.string(),
                        label: Joi.string(),
                        priceModifier: Joi.number().default(0),
                        default: Joi.boolean().default(false)
                    })
                ).default([]),
                rangeConfig: Joi.object({
                    min: Joi.number(),
                    max: Joi.number(),
                    step: Joi.number().default(1),
                    unit: Joi.string()
                }),
                displayOrder: Joi.number().integer().min(0).default(0)
            })
        ).default([]).optional(),

        // Boost type (SkyCoach Mode)
        boostType: Joi.string()
            .valid('piloted', 'self-play', 'both')
            .default('both'),

        // Boost category (SkyCoach Mode)
        boostCategory: Joi.string()
            .valid('rank-boost', 'raid-boost', 'dungeon-boost', 'pvp-boost', 'coaching', 'other')
            .default('rank-boost'),

        // FAQs
        faqs: Joi.array().items(
            Joi.object({
                question: Joi.string(),
                answer: Joi.string()
            })
        ).default([]).optional(),

        description: Joi.string()
            .trim()
            .max(2000)
            .allow(''),

        shortDescription: Joi.string()
            .trim()
            .max(200)
            .allow(''),

        gameId: Joi.string()
            .hex()
            .length(24)
            .required()
            .messages({
                'string.empty': 'Please select a game',
                'string.hex': 'Invalid game ID',
                'string.length': 'Invalid game ID'
            }),

        categoryId: Joi.string()
            .hex()
            .length(24)
            .required()
            .messages({
                'string.empty': 'Please select a category',
                'string.hex': 'Invalid category ID',
                'string.length': 'Invalid category ID'
            }),

        serviceType: Joi.string()
            .valid(...SERVICE_TYPES)
            .default('boosting'),

        icon: Joi.string()
            .trim()
            .allow(''),

        image: Joi.string()
            .trim()
            .allow(''),

        pricing: Joi.object({
            type: Joi.string()
                .valid(...PRICING_TYPES)
                .default('fixed'),

            basePrice: Joi.number()
                .min(0)
                .default(0),

            pricePerUnit: Joi.number()
                .min(0)
                .default(0),

            minPrice: Joi.number()
                .min(0)
                .default(0),

            maxPrice: Joi.number()
                .min(0)
                .default(0),

            discountPercent: Joi.number()
                .min(0)
                .max(100)
                .default(0),

            tiers: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    description: Joi.string().allow(''),
                    price: Joi.number().min(0).required(),
                    multiplier: Joi.number().default(1)
                })
            ).default([]),

            dynamicConfig: Joi.object({
                enabled: Joi.boolean().default(false),
                formula: Joi.string().allow(''),
                variables: Joi.object().optional()
            }).default({ enabled: false })
        }).optional(),

        deliveryTime: Joi.number()
            .integer()
            .min(0)
            .default(24),

        deliveryTimeText: Joi.string()
            .trim()
            .max(50)
            .allow(''),

        features: Joi.array()
            .items(Joi.string().trim().max(200))
            .default([])
            .optional(),

        requirements: Joi.array()
            .items(Joi.string().trim().max(200))
            .default([])
            .optional(),

        platforms: Joi.array().items(Joi.string()).default([]).optional(),
        regions: Joi.array().items(Joi.string()).default([]).optional(),
        serviceOptions: Joi.array().items(Joi.object().unknown(true)).default([]).optional(),

        isActive: Joi.boolean()
            .default(true),

        status: Joi.string()
            .valid(...SERVICE_STATUS)
            .default('active'),

        displayOrder: Joi.number()
            .integer()
            .min(0)
            .default(0),

        isFeatured: Joi.boolean()
            .default(false),

        tags: Joi.array()
            .items(Joi.string().trim().lowercase().max(50))
            .default([])
            .optional(),

        meta: Joi.object({
            title: Joi.string().trim().max(60).allow(''),
            description: Joi.string().trim().max(160).allow(''),
            keywords: Joi.array().items(Joi.string().trim().max(30))
        }),

        // New Dynamic Creator Fields
        estimatedStartTime: Joi.string().allow('').optional(),
        estimatedCompletionTime: Joi.string().allow('').optional(),
        sidebarSections: Joi.array().items(Joi.object().unknown(true)).default([]).optional(),
        showVAT: Joi.boolean().default(true),
        cashbackPercent: Joi.number().min(0).max(100).default(5),
        speedOptions: Joi.object({
            express: Joi.object().unknown(true),
            superExpress: Joi.object().unknown(true)
        }).optional(),
        sampleReviews: Joi.array().items(
            Joi.object({
                reviewerName: Joi.string().required(),
                rating: Joi.number().min(1).max(5).default(5),
                text: Joi.string().required(),
                isVerified: Joi.boolean().default(true),
                date: Joi.string().allow('')
            })
        ).default([]).optional()
    }),

    // Validation for updating a service
    update: Joi.object({
        title: Joi.string()
            .trim()
            .min(1)
            .max(100)
            .messages({
                'string.min': 'Service title is required',
                'string.max': 'Service title cannot exceed 100 characters'
            }),

        name: Joi.string()
            .trim()
            .min(1)
            .max(100)
            .messages({
                'string.min': 'Service name is required',
                'string.max': 'Service name cannot exceed 100 characters'
            }),

        // Dynamic fields (SkyCoach style)
        dynamicFields: Joi.array().items(
            Joi.object({
                fieldId: Joi.string(),
                label: Joi.string(),
                fieldType: Joi.string().valid('select', 'radio', 'checkbox', 'number', 'range', 'tier'),
                required: Joi.boolean(),
                options: Joi.array().items(
                    Joi.object({
                        value: Joi.string(),
                        label: Joi.string(),
                        priceModifier: Joi.number(),
                        default: Joi.boolean()
                    })
                ),
                rangeConfig: Joi.object({
                    min: Joi.number(),
                    max: Joi.number(),
                    step: Joi.number(),
                    unit: Joi.string()
                }),
                displayOrder: Joi.number().integer().min(0)
            })
        ).optional(),

        // Boost type (SkyCoach Mode)
        boostType: Joi.string()
            .valid('piloted', 'self-play', 'both'),

        // Boost category (SkyCoach Mode)
        boostCategory: Joi.string()
            .valid('rank-boost', 'raid-boost', 'dungeon-boost', 'pvp-boost', 'coaching', 'other'),

        // FAQs
        faqs: Joi.array().items(
            Joi.object({
                question: Joi.string(),
                answer: Joi.string()
            })
        ).optional(),

        description: Joi.string()
            .trim()
            .max(2000)
            .allow(''),

        shortDescription: Joi.string()
            .trim()
            .max(200)
            .allow(''),

        gameId: Joi.string()
            .hex()
            .length(24)
            .messages({
                'string.hex': 'Invalid game ID',
                'string.length': 'Invalid game ID'
            }),

        categoryId: Joi.string()
            .hex()
            .length(24)
            .messages({
                'string.hex': 'Invalid category ID',
                'string.length': 'Invalid category ID'
            }),

        serviceType: Joi.string()
            .valid(...SERVICE_TYPES),

        icon: Joi.string()
            .trim()
            .allow(''),

        image: Joi.string()
            .trim()
            .allow(''),

        pricing: Joi.object({
            type: Joi.string().valid(...PRICING_TYPES),

            basePrice: Joi.number().min(0),

            pricePerUnit: Joi.number().min(0),

            minPrice: Joi.number().min(0),

            maxPrice: Joi.number().min(0),

            discountPercent: Joi.number().min(0).max(100),

            tiers: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    description: Joi.string().allow(''),
                    price: Joi.number().min(0).required(),
                    multiplier: Joi.number().default(1)
                })
            ),

            dynamicConfig: Joi.object({
                enabled: Joi.boolean().default(false),
                formula: Joi.string().allow(''),
                variables: Joi.object().optional()
            })
        }).optional(),

        deliveryTime: Joi.number()
            .integer()
            .min(0),

        deliveryTimeText: Joi.string()
            .trim()
            .max(50)
            .allow(''),

        features: Joi.array()
            .items(Joi.string().trim().max(200))
            .optional(),

        requirements: Joi.array()
            .items(Joi.string().trim().max(200))
            .optional(),

        platforms: Joi.array().items(Joi.string()).optional(),
        regions: Joi.array().items(Joi.string()).optional(),
        serviceOptions: Joi.array().items(Joi.object().unknown(true)).optional(),

        isActive: Joi.boolean(),

        status: Joi.string()
            .valid(...SERVICE_STATUS),

        displayOrder: Joi.number()
            .integer()
            .min(0),

        isFeatured: Joi.boolean(),

        tags: Joi.array()
            .items(Joi.string().trim().lowercase().max(50))
            .optional(),

        meta: Joi.object({
            title: Joi.string().trim().max(60).allow(''),
            description: Joi.string().trim().max(160).allow(''),
            keywords: Joi.array().items(Joi.string().trim().max(30))
        }),

        // New Dynamic Creator Fields
        estimatedStartTime: Joi.string().allow('').optional(),
        estimatedCompletionTime: Joi.string().allow('').optional(),
        sidebarSections: Joi.array().items(Joi.object().unknown(true)).optional(),
        showVAT: Joi.boolean(),
        cashbackPercent: Joi.number().min(0).max(100),
        speedOptions: Joi.object({
            express: Joi.object().unknown(true),
            superExpress: Joi.object().unknown(true)
        }).optional(),
        sampleReviews: Joi.array().items(
            Joi.object({
                reviewerName: Joi.string(),
                rating: Joi.number().min(1).max(5),
                text: Joi.string(),
                isVerified: Joi.boolean(),
                date: Joi.string().allow('')
            })
        ).optional()
    }),

    // Validation for service query params
    query: Joi.object({
        gameId: Joi.string()
            .hex()
            .length(24),

        categoryId: Joi.string().trim().allow(''),

        serviceType: Joi.string()
            .valid(...SERVICE_TYPES),

        status: Joi.string()
            .valid(...SERVICE_STATUS),

        isActive: Joi.boolean(),

        isFeatured: Joi.boolean(),

        is_hot_offer: Joi.boolean(),

        search: Joi.string().trim().allow(''),

        tags: Joi.string().trim().allow(''),

        categorySlug: Joi.string().trim().allow(''),

        page: Joi.number().integer().min(1).default(1),

        limit: Joi.number().integer().min(1).max(100).default(20),

        sortBy: Joi.string()
            .valid('title', 'displayOrder', 'createdAt', 'price', 'rating')
            .default('displayOrder'),

        sortOrder: Joi.string().valid('asc', 'desc').default('asc')
    }),

    // Validation for bulk operations
    bulk: Joi.object({
        ids: Joi.array()
            .items(Joi.string().hex().length(24))
            .min(1)
            .required()
            .messages({
                'array.min': 'Please provide at least one ID'
            }),

        action: Joi.string()
            .valid('activate', 'deactivate', 'delete')
            .required()
    }),

    // Validation for price calculation
    priceCalc: Joi.object({
        serviceId: Joi.string()
            .hex()
            .length(24)
            .required(),

        params: Joi.object({
            units: Joi.number().integer().min(1).default(1),
            levels: Joi.number().integer().min(1),
            wins: Joi.number().integer().min(1),
            hours: Joi.number().integer().min(1),
            tierIndex: Joi.number().integer().min(0),
            quantity: Joi.number().integer().min(1).default(1),
            platform: Joi.string().trim().lowercase(),
            region: Joi.string().trim().lowercase(),
            urgency: Joi.string().valid('normal', 'express', 'rush', 'overnight').default('normal'),
            boosterRank: Joi.string().trim().lowercase()
        }).default({})
    })
};

module.exports = {
    gameSchemas,
    categorySchemas,
    serviceSchemas,
    commonRules
};
