const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('./models/Review');
const connectDB = require('./config/db');

dotenv.config();

const reviewImages = [
    '/uploads/reviews/black-ops-6-dark-matter-camo1729685397_picture_item_small-1777052205627-964370453.png',
    '/uploads/reviews/black-ops-6-prestige1727948808_picture_item_small-1776980664410-125327090.png',
    '/uploads/reviews/black-ops-7-ashes-of-the-damned-boost1767708081_picture_item_small-1777051038752-329308939.png',
    '/uploads/reviews/black-ops-7-astra-malorum-boost1767708431_picture_item_small-1777051004756-938537138.png',
    '/uploads/reviews/black-ops-7-cursed-relics1767708948_picture_item_small-1777051894326-459710028.png',
    '/uploads/reviews/black-ops-7-shattered-gold-camo1767706800_picture_item_small-1777051111115-79580287.png',
    '/uploads/reviews/black-ops-7-weapon-leveling-boost1762159242_picture_item_small-1776980258950-939964846.png',
    '/uploads/reviews/cod-accounts1746161516_picture_item_small-1777051027459-242979405.png'
];

const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
    'France', 'Italy', 'Spain', 'Brazil', 'Japan', 'South Korea',
    'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland'
];

const reviewerNames = [
    'Alex M.', 'Sarah K.', 'John D.', 'Emily R.', 'Michael T.', 
    'David L.', 'Chris W.', 'Jessica B.', 'Daniel H.', 'Matthew C.',
    'Andrew P.', 'James S.', 'Joshua F.', 'Robert N.', 'William G.',
    'Amanda Y.', 'Ashley V.', 'Melissa O.', 'Kevin Q.', 'Brian Z.',
    'Jason X.', 'Ryan J.', 'Justin U.', 'Eric I.', 'Nicholas A.'
];

const descriptions = [
    'Tremendous players, had an accommodating schedule, and was very timely. He got me some challenges like soul sweep and prodigy, had no problem with me pausing the order a few times to play normals with friends, and finished it very quickly',
    'Excellent service! The booster was very professional and communicated well throughout the process. Highly recommend to anyone looking to rank up fast.',
    'Super fast completion. I ordered the dark matter camo and it was done in record time. Will definitely be using this service again.',
    'Very friendly booster, gave me some great tips while playing together. The rank up was smooth and efficient. Worth every penny!',
    'I was skeptical at first, but these guys are legit. They handled my account with care and got me to my desired rank in no time. Thanks!',
    'Great experience overall. The customer support was helpful when I had questions, and the booster started within an hour of my order.',
    'Fast, safe, and reliable. What more could you ask for? The booster even streamed the games for me so I could watch. Amazing service.',
    'Got stuck in elo hell and needed a boost. They assigned a top-tier player who crushed it. Highly recommended!',
    'The weapon leveling was done super quickly. Saved me so much grinding time. Will definitely buy again for the next season.',
    'Perfect service as always. This is my third time ordering from them and they never disappoint. Top quality players.',
    'Very accommodating. I had a tight schedule, but the booster worked around it and still finished the order before the deadline.',
    'The communication was excellent. They kept me updated on the progress every step of the way. Very professional team.',
    'I tried other boosting sites before, but this one is by far the best. Fast start, quick finish, and great prices.',
    'The booster was a beast! Watched him play and he completely dominated every match. Highly skilled players here.',
    'Couldn\'t be happier with the results. They delivered exactly what was promised and more. Highly recommend this site.'
];

const titles = [
    'Amazing Service', 'Fast and Reliable', 'Great Communication', 'Highly Recommended', 
    'Best Boosting Site', 'Super Quick Completion', 'Excellent Quality', 'Professional Boosters',
    'Saved Me So Much Time', 'Will Order Again', 'Top Tier Players', 'Smooth Experience',
    'Exactly What I Needed', 'Worth Every Penny', 'Flawless Execution'
];

const generateReviews = () => {
    const reviews = [];
    
    for (let i = 0; i < 50; i++) {
        const randomImage = reviewImages[Math.floor(Math.random() * reviewImages.length)];
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        const randomName = reviewerNames[Math.floor(Math.random() * reviewerNames.length)];
        const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];
        const randomStars = Math.random() > 0.8 ? 4 : 5; // Mostly 5 stars, some 4 stars
        
        // Random date within the last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        reviews.push({
            title: randomTitle,
            reviewerName: randomName,
            stars: randomStars,
            description: randomDescription,
            countryName: randomCountry,
            reviewImage: randomImage,
            isPublished: true,
            createdAt: date,
            updatedAt: date
        });
    }
    
    return reviews;
};

const seedDB = async () => {
    try {
        await connectDB();
        
        console.log('Clearing existing reviews...');
        await Review.deleteMany({});
        
        console.log('Generating new reviews...');
        const reviews = generateReviews();
        
        console.log('Inserting reviews into database...');
        await Review.insertMany(reviews);
        
        console.log(`Successfully seeded ${reviews.length} reviews!`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
