const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB...');

        const adminEmail = 'admin@boostgg.com';
        const adminPassword = 'Admin@123456';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists. Updating password and ensuring verified status...');
            existingAdmin.password = adminPassword;
            existingAdmin.role = 'admin';
            existingAdmin.isVerified = true;
            await existingAdmin.save();
            console.log('Admin updated successfully!');
        } else {
            const admin = await User.create({
                name: 'Super',
                surname: 'Admin',
                username: 'superadmin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                isVerified: true
            });
            console.log('Admin created successfully!');
            console.log('Email:', admin.email);
            console.log('Password:', adminPassword);
        }

        mongoose.connection.close();
        console.log('Connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err.message);
        process.exit(1);
    }
};

seedAdmin();
