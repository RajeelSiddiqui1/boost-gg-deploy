const mongoose = require('mongoose');

// Field types enum
const FIELD_TYPES = [
    'text',
    'textarea',
    'number',
    'email',
    'phone',
    'select',
    'radio',
    'checkbox',
    'checkbox_group',
    'date',
    'time',
    'file',
    'url',
    'color'
];

// Custom section schema for building dynamic sections/pages
const customSectionSchema = new mongoose.Schema({
    // Section identifier
    sectionId: {
        type: String,
        required: [true, 'Section ID is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    // Section title
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    // Section subheading
    subheading: {
        type: String,
        trim: true,
        maxlength: [500, 'Subheading cannot exceed 500 characters']
    },
    // Section description/details
    description: {
        type: String,
        trim: true
    },
    // Section type
    sectionType: {
        type: String,
        enum: ['form', 'info', 'pricing', 'comparison', 'faq', 'testimonial', 'gallery', 'custom'],
        default: 'custom'
    },
    // Fields for the section
    fields: [{
        // Field identifier
        fieldId: {
            type: String,
            required: true
        },
        // Field label
        label: {
            type: String,
            required: true,
            trim: true
        },
        // Field sublabel (optional helper text)
        sublabel: {
            type: String,
            trim: true
        },
        // Field type
        fieldType: {
            type: String,
            enum: FIELD_TYPES,
            default: 'text'
        },
        // Placeholder text
        placeholder: {
            type: String,
            trim: true
        },
        // Helper text
        helperText: {
            type: String,
            trim: true
        },
        // Is field required
        required: {
            type: Boolean,
            default: false
        },
        // Is field readonly
        readonly: {
            type: Boolean,
            default: false
        },
        // Is field disabled
        disabled: {
            type: Boolean,
            default: false
        },
        // Default value
        defaultValue: {
            type: mongoose.Schema.Types.Mixed
        },
        // Minimum value (for number fields)
        min: {
            type: Number
        },
        // Maximum value (for number fields)
        max: {
            type: Number
        },
        // Step value (for number fields)
        step: {
            type: Number,
            default: 1
        },
        // Regex pattern for validation
        pattern: {
            type: String
        },
        // Error message for pattern validation
        patternMessage: {
            type: String
        },
        // Options for select/radio/checkbox_group
        options: [{
            // Option value
            value: {
                type: String,
                required: true
            },
            // Option display label
            label: {
                type: String,
                required: true
            },
            // Price modifier (percentage or fixed) - for pricing fields
            priceModifier: {
                type: Number,
                default: 0
            },
            // Is this option selected by default
            default: {
                type: Boolean,
                default: false
            },
            // Is option disabled
            disabled: {
                type: Boolean,
                default: false
            }
        }],
        // CSS class for custom styling
        cssClass: {
            type: String,
            trim: true
        },
        // Display order
        displayOrder: {
            type: Number,
            default: 0
        },
        // Conditional logic - show this field based on another field's value
        conditionalLogic: {
            // Field to watch
            watchField: {
                type: String
            },
            // Value to match
            matchValue: {
                type: mongoose.Schema.Types.Mixed
            },
            // Operator: equals, not_equals, contains, greater_than, less_than
            operator: {
                type: String,
                enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'],
                default: 'equals'
            }
        },
        // Validation rules
        validation: {
            // Minimum length (for text)
            minLength: Number,
            // Maximum length (for text)
            maxLength: Number,
            // Custom error message
            errorMessage: String
        }
    }],
    // Section settings
    settings: {
        // Container styling
        containerClass: {
            type: String,
            default: 'container mx-auto px-4 py-8'
        },
        // Background color
        backgroundColor: {
            type: String,
            default: '#000000'
        },
        // Text color
        textColor: {
            type: String,
            default: '#ffffff'
        },
        // Border radius
        borderRadius: {
            type: Number,
            default: 12
        },
        // Padding
        padding: {
            top: { type: Number, default: 8 },
            right: { type: Number, default: 4 },
            bottom: { type: Number, default: 8 },
            left: { type: Number, default: 4 }
        },
        // Margin
        margin: {
            top: { type: Number, default: 0 },
            right: { type: Number, default: 0 },
            bottom: { type: Number, default: 4 },
            left: { type: Number, default: 0 }
        },
        // Columns layout (1, 2, 3, 4)
        columns: {
            type: Number,
            default: 1,
            min: 1,
            max: 4
        },
        // Show section title
        showTitle: {
            type: Boolean,
            default: true
        },
        // Show section subheading
        showSubheading: {
            type: Boolean,
            default: true
        },
        // Section visibility
        isVisible: {
            type: Boolean,
            default: true
        },
        // Animation effect
        animation: {
            type: String,
            enum: ['none', 'fadeIn', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown'],
            default: 'none'
        }
    },
    // Associated game (optional - for game-specific sections)
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    },
    // Associated service (optional - for service-specific sections)
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    // Associated category (optional)
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active'
    },
    // Display order
    displayOrder: {
        type: Number,
        default: 0
    },
    // SEO metadata
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
    },
    // Created by
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Last updated by
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for field count
customSectionSchema.virtual('fieldCount').get(function() {
    return this.fields ? this.fields.length : 0;
});

// Index for efficient queries
customSectionSchema.index({ status: 1, displayOrder: 1 });
customSectionSchema.index({ gameId: 1, status: 1 });
customSectionSchema.index({ serviceId: 1, status: 1 });

// Pre-save middleware to generate fieldId if not provided
customSectionSchema.pre('save', function(next) {
    // Generate sectionId if not provided
    if (!this.sectionId) {
        this.sectionId = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }
    
    // Generate fieldId for each field if not provided
    this.fields.forEach((field, index) => {
        if (!field.fieldId) {
            field.fieldId = 'field_' + index + '_' + Date.now();
        }
        // Set display order if not set
        if (field.displayOrder === undefined || field.displayOrder === null) {
            field.displayOrder = index;
        }
    });
    
    next();
});

const CustomSection = mongoose.model('CustomSection', customSectionSchema);

module.exports = CustomSection;
module.exports.FIELD_TYPES = FIELD_TYPES;
