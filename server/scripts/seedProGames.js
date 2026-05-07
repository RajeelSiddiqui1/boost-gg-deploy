const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Game = require('../models/Game');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedProGames = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB...');

        // 1. Get first 2 games
        const games = await Game.find({ isActive: true }).limit(2).sort({ createdAt: 1 });
        
        if (games.length < 2) {
            console.log('Not enough games found to seed. Please ensure you have at least 2 games.');
            process.exit(0);
        }

        const gameIds = games.map(g => g._id);
        console.log(`Found games: ${games.map(g => g.name).join(', ')}`);

        // 2. Find all pro users
        const proUsers = await User.find({ role: 'pro' });
        console.log(`Found ${proUsers.length} pro users.`);

        // 3. Update each pro user
        const updatePromises = proUsers.map(user => {
            // Transform game IDs into proSpecializations format
            const proSpecializations = gameIds.map(id => ({ game: id }));
            
            return User.findByIdAndUpdate(user._id, {
                $set: { proSpecializations: proSpecializations }
            });
        });

        await Promise.all(updatePromises);

        console.log('Successfully updated proSpecializations for all pro users!');
        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding pro games:', err.message);
        process.exit(1);
    }
};

seedProGames();
