const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedReviews = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB...');

        const proUserId = '69f3ba25fd66d831ee5e06be';

        // Find all customers
        const customers = await User.find({ role: 'customer' });
        console.log(`Found ${customers.length} customer users.`);

        // Check if pro user exists
        const proUser = await User.findById(proUserId);
        if (!proUser) {
            console.error('Pro user not found!');
            process.exit(1);
        }
        console.log(`Adding reviews to pro user: ${proUser.name} (${proUser._id}) from all customers`);

        // Sample review comments
        const reviewComments = [
            'Great service, highly recommended!',
            'Excellent work, very professional.',
            'Good experience overall.',
            'Satisfactory service.',
            'Could be better, but okay.',
            'Amazing quality work!',
            'Fast and reliable service.',
            'Very satisfied with the results.',
            'Good communication throughout.',
            'Will definitely use again.'
        ];

        // Prepare reviews array to add to pro user
        const reviewsToAdd = [];
        for (const customer of customers) {
            const randomRating = Math.floor(Math.random() * 5) + 1; // 1-5
            const randomComment = reviewComments[Math.floor(Math.random() * reviewComments.length)];

            const review = {
                user: customer._id,
                rating: randomRating,
                comment: randomComment,
                createdAt: new Date()
            };

            reviewsToAdd.push(review);
            console.log(`Prepared review from ${customer.name} (${customer._id}): Rating ${randomRating}`);
        }

        // Update pro user with all reviews at once
        await User.findByIdAndUpdate(proUserId, {
            $push: { reviews: { $each: reviewsToAdd } },
            $inc: { totalReviews: customers.length },
            $set: {
                rating: await calculateAverageRating(proUserId)
            }
        });

        console.log(`Added ${reviewsToAdd.length} reviews to pro user successfully!`);

        mongoose.connection.close();
        console.log('Connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding reviews:', err.message);
        process.exit(1);
    }
};

// Helper function to calculate average rating
async function calculateAverageRating(userId) {
    const user = await User.findById(userId).select('reviews');
    if (!user.reviews || user.reviews.length === 0) return 0;

    const totalRating = user.reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / user.reviews.length;
}

seedReviews();