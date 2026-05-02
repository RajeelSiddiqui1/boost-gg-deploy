const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Order = require('../models/Order');

/**
 * Script to map all existing orders to a specific user.
 * Target User Email: rajeelsiddiqui3@gmail.com
 */
const mapUserToOrders = async () => {
    let connection;
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        console.log('Connecting to MongoDB...');
        connection = await mongoose.connect(mongoUri);
        console.log(`Connected to database: ${connection.connection.name}`);

        // 1. Identify the user with the specified email
        const targetEmail = 'rajeelsiddiqui3@gmail.com';
        console.log(`Looking up user with email: ${targetEmail}...`);
        
        const user = await User.findOne({ email: targetEmail });

        if (!user) {
            console.error(`Error: User with email "${targetEmail}" not found.`);
            console.log('Please ensure the user exists in the "users" collection before running this script.');
            process.exit(1);
        }

        const userId = user._id;
        console.log(`User found: ${user.name} (ID: ${userId})`);

        // 2. Check if we need to create sample orders or just update existing ones
        const orderCount = await Order.countDocuments();
        
        if (orderCount === 0) {
            console.log('Orders collection is empty. Seeding with sample orders...');
            
            // Get some services to link
            const Service = require('../models/Service');
            const services = await Service.find().limit(5);
            
            if (services.length === 0) {
                console.warn('No services found in database. Cannot create sample orders. Please seed services first.');
            } else {
                const sampleOrders = services.map((service, index) => ({
                    userId: userId,
                    serviceId: service._id,
                    price: service.price || 49.99,
                    status: index % 2 === 0 ? 'completed' : 'pending',
                    contactInfo: {
                        discord: 'Rajeel#0001',
                        email: targetEmail,
                        inGameName: 'RajeelGG'
                    },
                    platform: 'PC',
                    region: 'EU',
                    transactionId: `SEED-${Date.now()}-${index}`
                }));

                await Order.insertMany(sampleOrders);
                console.log(`Successfully created ${sampleOrders.length} sample orders mapped to user: ${userId}`);
            }
        } else {
            // 3. Update existing orders
            console.log(`Found ${orderCount} existing orders. Updating their userId to maintain data integrity...`);
            
            // Perform bulk update as requested
            const result = await Order.updateMany(
                {}, // Filter: all orders
                { $set: { userId: userId } }
            );

            console.log('--- Update Summary ---');
            console.log(`Total orders matched: ${result.matchedCount}`);
            console.log(`Total orders updated: ${result.modifiedCount}`);
            console.log('-----------------------');
        }

    } catch (error) {
        console.error('An error occurred during the update process:');
        console.error(error.message);
    } finally {
        if (connection) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB.');
        }
        process.exit(0);
    }
};

// Execute the script
mapUserToOrders();
