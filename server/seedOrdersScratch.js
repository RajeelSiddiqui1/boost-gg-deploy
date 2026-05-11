const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Order = require('./models/Order');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedOrders = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB...');

        const userId = '69a9e0ddcc98b538e0893e06';
        const serviceId = '69a89eb869de6f8279e94636';

        // Create 10 orders
        const orders = [];
        for (let i = 1; i <= 10; i++) {
            const order = {
                userId: userId,
                serviceId: serviceId,
                price: 50 + (i * 5), // Varying prices: 55, 60, 65, ..., 100
                status: 'pending',
                contactInfo: {
                    discord: `user${i}#1234`,
                    email: `user${i}@example.com`,
                    inGameName: `Player${i}`
                },
                selectedOptions: {},
                calcValue: 100,
                platform: 'PC',
                region: 'NA',
                orderMode: 'boosting',
                selectedBoostType: 'piloted'
            };
            orders.push(order);
        }

        // Insert orders
        const createdOrders = await Order.insertMany(orders);
        console.log(`Successfully created ${createdOrders.length} orders!`);

        // Log the order IDs
        createdOrders.forEach((order, index) => {
            console.log(`Order ${index + 1}: ${order._id}`);
        });

        mongoose.connection.close();
        console.log('Connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding orders:', err.message);
        process.exit(1);
    }
};

seedOrders();