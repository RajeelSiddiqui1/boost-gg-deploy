const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Game = require('../models/Game');
const Category = require('../models/Category');
const Service = require('../models/Service');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const gamesData = [
    {
        name: 'World of Warcraft',
        title: 'World of Warcraft',
        subtitle: 'The ultimate MMORPG experience',
        description: 'Explore Azeroth with help from the best players.',
        category: 'MMORPG',
        isPopular: true,
        isHot: true,
        displayOrder: 1,
        categories: [
            { name: 'Raids', isFeatured: true },
            { name: 'Mythic+', isFeatured: true },
            { name: 'Leveling', isFeatured: false },
            { name: 'PVP', isFeatured: false },
            { name: 'Gold', isFeatured: true }
        ]
    },
    {
        name: 'Apex Legends',
        title: 'Apex Legends',
        subtitle: 'Battle Royale evolved',
        description: 'Master the Outlands with pro legends.',
        category: 'Battle Royale',
        isPopular: true,
        isHot: false,
        displayOrder: 2,
        categories: [
            { name: 'Ranked Boost', isFeatured: true },
            { name: 'Badges', isFeatured: true },
            { name: 'Wins', isFeatured: false },
            { name: 'Coaching', isFeatured: false }
        ]
    },
    {
        name: 'Valorant',
        title: 'Valorant',
        subtitle: 'Tactical hero shooter',
        description: 'Climb the ranks with elite aimers.',
        category: 'FPS',
        isPopular: true,
        isHot: true,
        displayOrder: 3,
        categories: [
            { name: 'Rank Boosting', isFeatured: true },
            { name: 'Placement Matches', isFeatured: true },
            { name: 'Unrated Games', isFeatured: false },
            { name: 'Coaching', isFeatured: false }
        ]
    },
    {
        name: 'Genshin Impact',
        title: 'Genshin Impact',
        subtitle: 'Epic fantasy adventure',
        description: 'Get help with quests, abyss, and farming.',
        category: 'RPG',
        isPopular: true,
        isHot: true,
        displayOrder: 4,
        categories: [
            { name: 'Spiral Abyss', isFeatured: true },
            { name: 'Daily Commissions', isFeatured: false },
            { name: 'Boss Kills', isFeatured: true },
            { name: 'Adventure Rank', isFeatured: false },
            { name: 'Exploration', isFeatured: true }
        ]
    },
    {
        name: 'League of Legends',
        title: 'League of Legends',
        subtitle: 'The #1 MOBA',
        description: 'Elite coaching and rank boosting.',
        category: 'MOBA',
        isPopular: true,
        isHot: true,
        displayOrder: 5,
        categories: [
            { name: 'Ranked Solo/Duo', isFeatured: true },
            { name: 'Placement Games', isFeatured: true },
            { name: 'Win Boosting', isFeatured: false },
            { name: 'Coaching', isFeatured: true }
        ]
    },
    {
        name: 'FC 24',
        title: 'FC 24',
        subtitle: 'The worlds game',
        description: 'Coins, wins, and professional gameplay.',
        category: 'Sports',
        isPopular: true,
        isHot: true,
        displayOrder: 6,
        categories: [
            { name: 'Ultimate Team Coins', isFeatured: true },
            { name: 'Champions Wins', isFeatured: true },
            { name: 'Division Rivals', isFeatured: false }
        ]
    },
    {
        name: 'Counter-Strike 2',
        title: 'Counter-Strike 2',
        subtitle: 'Tactical FPS legend',
        description: 'Premier rank boost and wins.',
        category: 'FPS',
        isPopular: true,
        isHot: false,
        displayOrder: 7,
        categories: [
            { name: 'Premier Rating', isFeatured: true },
            { name: 'Competitive Wins', isFeatured: true },
            { name: 'Case Farming', isFeatured: false }
        ]
    }
];

const seedProduction = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:2717/boostgg';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for production seeding...');

        // Clear existing data (optional, but good for a fresh start in development)
        // await Game.deleteMany({});
        // await Category.deleteMany({});
        // await Service.deleteMany({});

        for (const g of gamesData) {
            // 1. Create or Update Game
            let game = await Game.findOne({ name: g.name });
            if (!game) {
                game = await Game.create({
                    name: g.name,
                    title: g.title,
                    subtitle: g.subtitle,
                    description: g.description,
                    category: g.category,
                    isPopular: g.isPopular,
                    isHot: g.isHot,
                    displayOrder: g.displayOrder
                });
                console.log(`Created game: ${game.name}`);
            } else {
                console.log(`Game ${game.name} already exists, using existing.`);
            }

            // 2. Create Categories (Ensuring unique slugs by prefixing game name)
            const createdCategories = [];
            for (const cat of g.categories) {
                const categoryName = `${g.name} ${cat.name}`;
                let category = await Category.findOne({ name: categoryName, gameId: game._id });
                if (!category) {
                    category = await Category.create({
                        name: categoryName,
                        gameId: game._id,
                        isFeatured: cat.isFeatured,
                        isActive: true
                    });
                    console.log(`  Created category: ${category.name}`);
                }
                createdCategories.push(category);
            }

            // 3. Create Services for each category
            for (const category of createdCategories) {
                // Add 2 services per category
                const title1 = `${category.name} Professional Boost`;
                const service1 = await Service.findOne({ title: title1, categoryId: category._id });
                if (!service1) {
                    await Service.create({
                        title: title1,
                        description: `Get professional help with ${category.name} in ${game.name}. Fast delivery and guaranteed results. Our team of expert players will handle everything for you.`,
                        shortDescription: `Top-tier assistance for ${game.name} players.`,
                        gameId: game._id,
                        categoryId: category._id,
                        categorySlug: category.slug,
                        serviceType: 'boosting',
                        pricing: {
                            type: 'fixed',
                            basePrice: Math.floor(Math.random() * 100) + 20
                        },
                        deliveryTime: 24,
                        deliveryTimeText: '1-2 Days',
                        features: ['100% Secure', 'VPN Protection', 'Live Stream Available'],
                        isActive: true,
                        status: 'active',
                        is_hot_offer: true // Make it show up on home page if possible
                    });
                    console.log(`    Created service: ${title1}`);
                }

                const title2 = `Elite ${category.name} Bundle Package`;
                const service2 = await Service.findOne({ title: title2, categoryId: category._id });
                if (!service2) {
                    await Service.create({
                        title: title2,
                        description: `The best value ${category.name} package for ${game.name}. Includes multiple perks and bonuses. Complete with premium tracking and support.`,
                        shortDescription: `Best-selling package for ${game.name}.`,
                        gameId: game._id,
                        categoryId: category._id,
                        categorySlug: category.slug,
                        serviceType: 'boosting',
                        pricing: {
                            type: 'fixed',
                            basePrice: Math.floor(Math.random() * 200) + 50
                        },
                        deliveryTime: 48,
                        deliveryTimeText: '2-3 Days',
                        features: ['Priority Support', 'Top 500 Boosters', 'Guaranteed Completion'],
                        isActive: true,
                        status: 'active',
                        isFeatured: true,
                        is_hot_offer: Math.random() > 0.5
                    });
                    console.log(`    Created service: ${title2}`);
                }
            }
        }

        console.log('Seeding completed successfully!');
        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding production data:', err);
        process.exit(1);
    }
};

seedProduction();
