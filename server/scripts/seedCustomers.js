const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedCustomers = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB...');

        // Create 10 customer users
        const customers = [];
        for (let i = 1; i <= 10; i++) {
            const customer = {
                name: `Customer${i}`,
                surname: `User${i}`,
                username: `customer${i}`,
                email: `customer${i}@example.com`,
                password: '12345678',
                role: 'customer',
                isVerified: true,
                isActive: true
            };
            customers.push(customer);
        }

        // Insert customers
        const createdCustomers = await User.insertMany(customers);
        console.log(`Successfully created ${createdCustomers.length} customer users!`);

        // Log the user IDs
        createdCustomers.forEach((user, index) => {
            console.log(`Customer ${index + 1}: ${user._id} - ${user.email}`);
        });

        mongoose.connection.close();
        console.log('Connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding customers:', err.message);
        process.exit(1);
    }
};

seedCustomers();