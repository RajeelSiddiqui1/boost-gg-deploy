require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');

// Reliable working images for each blog post
const imageUpdates = {
    'how-to-rank-up-fast-valorant': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=800',
    'lol-season-2024-tier-list-meta-guide': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800',
    'cs2-premier-rating-complete-guide': 'https://images.unsplash.com/photo-1562751362-404243c2eea3?q=80&w=800',
    'genshin-impact-spiral-abyss-floor-12': 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=800',
    'apex-legends-movement-guide': 'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?q=80&w=800',
    'wow-mythic-plus-beginners-guide': 'https://images.unsplash.com/photo-1585620385456-4759f9b5c7d9?q=80&w=800'
};

async function fixBlogImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg');
        console.log('Connected to MongoDB...');

        for (const [slug, imageUrl] of Object.entries(imageUpdates)) {
            const result = await Blog.updateOne({ slug }, { $set: { image: imageUrl } });
            if (result.modifiedCount > 0) {
                console.log(`Updated image for: ${slug}`);
            } else {
                console.log(`Blog not found or already updated: ${slug}`);
            }
        }

        console.log('Done updating blog images!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

fixBlogImages();
