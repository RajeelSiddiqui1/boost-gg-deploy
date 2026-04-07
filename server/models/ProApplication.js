const mongoose = require('mongoose');
const PRO_TYPES = require('./User').PRO_TYPES;

const proApplicationSchema = new mongoose.Schema({
    // User applying to become PRO (optional for guest applications)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    // Requested PRO type
    proType: {
        type: String,
        enum: Object.values(PRO_TYPES),
        required: true
    },
    // Required contact info
    discord: {
        type: String,
        required: true,
        trim: true
    },
    telegram: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    // Daily availability
    hoursPerDay: {
        type: String,
        enum: ['<4h', '4-8h', '>8h'],
        default: '4-8h'
    },
    // Experience (simplified as a text field for quick apply)
    experienceText: {
        type: String,
        trim: true
    },
    referralSource: {
        type: String,
        trim: true
    },
    // Application status
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected'],
        default: 'pending'
    },
    // Existing fields kept for compatibility ...
    personalStatement: {
        type: String,
        maxlength: 2000
    },
    // ... rest of the existing fields
    // Experience details
    experience: {
        yearsPlaying: Number,
        gamesPlayed: [String],
        previousBoosterExperience: Boolean,
        previousBoosterPlatforms: [String],
        streamingPlatform: String,
        streamingUrl: String,
        socialMediaHandles: {
            twitter: String,
            discord: String,
            youtube: String,
            twitch: String
        }
    },
    // Skills and certifications
    skills: [{
        game: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        },
        highestRank: String,
        mainRoles: [String],
        hoursPlayed: Number,
        certifications: [String]
    }],
    // Availability
    availability: {
        hoursPerWeek: Number,
        timezone: String,
        canWorkWeekends: Boolean
    },
    // Required documents/verification
    documents: [{
        type: {
            type: String,
            enum: ['id_verification', 'game_screenshot', 'rank_proof', 'other']
        },
        url: String,
        verified: {
            type: Boolean,
            default: false
        }
    }],
    // Admin review notes
    reviewNotes: {
        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String,
        reviewedAt: Date
    },
    // Rejection reason
    rejectionReason: String,
    // Approved at
    approvedAt: Date,
    // Expires at (if not approved within time)
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
}, {
    timestamps: true
});

// Indexes
proApplicationSchema.index({ status: 1 });
proApplicationSchema.index({ proType: 1 });
proApplicationSchema.index({ createdAt: -1 });

// Static method to check if user has pending application
proApplicationSchema.statics.hasPendingApplication = async function (userId) {
    const application = await this.findOne({
        userId,
        status: 'pending'
    });
    return !!application;
};

// Static method to get application by user
proApplicationSchema.statics.getByUser = async function (userId) {
    return this.findOne({ userId }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('ProApplication', proApplicationSchema);
module.exports.PRO_TYPES = PRO_TYPES;
