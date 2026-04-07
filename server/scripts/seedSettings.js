const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { seedSettings } = require('../controllers/adminController');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seed = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB...');

        await seedSettings();

        console.log('Settings seeded successfully!');
        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding settings:', err.message);
        process.exit(1);
    }
};

seed();
