const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const OrderBid = require('../models/OrderBid');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedPros = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB...');

        const orderId = '69f8ccbf25f86567e6bc24a1';
        const password = '12345678';
        const proUsers = [];

        for (let i = 1; i <= 12; i++) {
            const email = `pro${i}@boostgg.com`;
            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    name: `Pro ${i}`,
                    surname: 'Player',
                    username: `pro${i}`,
                    email: email,
                    password: password,
                    role: 'pro',
                    isVerified: true,
                    isProApproved: true,
                    proGames: ['69a89eb969de6f8279e94840'], // The service ID from the user's request
                    rating: 4 + Math.random() // Random rating between 4.0 and 5.0
                });
                console.log(`Created Pro ${i}`);
            } else {
                console.log(`Pro ${i} already exists`);
            }
            proUsers.push(user);
        }

        // Place 10 bids
        for (let i = 0; i < 10; i++) {
            const pro = proUsers[i];
            const existingBid = await OrderBid.findOne({ orderId, proId: pro._id });

            if (!existingBid) {
                await OrderBid.create({
                    orderId: orderId,
                    proId: pro._id,
                    bidAmount: 40 + Math.floor(Math.random() * 20), // Random bid between 40 and 60
                    message: `I am highly experienced in this game. Choose me for fast delivery!`,
                    type: i % 3 === 0 ? 'claim' : 'bid', // Mix of claims and bids
                    status: 'pending'
                });
                console.log(`Bid placed by ${pro.name}`);
            } else {
                console.log(`Bid already exists for ${pro.name}`);
            }
        }

        console.log('Seeding completed successfully!');
        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding pros:', err.message);
        process.exit(1);
    }
};

seedPros();
