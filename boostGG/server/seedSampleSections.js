const mongoose = require('mongoose');
require('dotenv').config();

const sectionSchema = new mongoose.Schema({
    sectionId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subheading: String,
    description: String,
    sectionType: { type: String, enum: ['form', 'info', 'pricing', 'comparison', 'faq', 'testimonial', 'gallery', 'custom'], default: 'custom' },
    fields: [{
        fieldId: String,
        label: String,
        sublabel: String,
        fieldType: String,
        placeholder: String,
        helperText: String,
        required: Boolean,
        options: [{ value: String, label: String, priceModifier: Number }]
    }],
    status: { type: String, default: 'active' }
}, { timestamps: true });

const CustomSection = mongoose.models.CustomSection || mongoose.model('CustomSection', sectionSchema);

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg');
        console.log('DB Connected');

        // Clear existing to avoid unique constraint on repeat
        await CustomSection.deleteMany({ sectionId: { $in: ['val-rank-form', 'boosting-faq', 'delivery-info'] } });

        await CustomSection.create([
            {
                title: 'Valorant Rank Selection',
                sectionId: 'val-rank-form',
                sectionType: 'form',
                subheading: 'Select your current and target rank',
                fields: [
                    { fieldId: 'current', label: 'Current Rank', fieldType: 'select', options: [{ label: 'Iron', value: 'iron' }, { label: 'Gold', value: 'gold' }] },
                    { fieldId: 'target', label: 'Target Rank', fieldType: 'select', options: [{ label: 'Silver', value: 'silver' }, { label: 'Platinum', value: 'platinum' }] }
                ]
            },
            {
                title: 'Safe Delivery',
                sectionId: 'delivery-info',
                sectionType: 'info',
                description: 'We use premium VPNs and professional players only.'
            }
        ]);

        console.log('Seeded 2 sections!');
        process.exit(0);
    } catch (err) {
        console.error('SEED ERROR:', err);
        process.exit(1);
    }
};

seed();
