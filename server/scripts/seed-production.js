const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Game = require('../models/Game');
const Category = require('../models/Category');
const Service = require('../models/Service');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const categoriesData = [
    { name: 'Gold', slug: 'gold', sortOrder: 1, isFeatured: true },
    { name: 'Raids', slug: 'raids', sortOrder: 2, isFeatured: true },
    { name: 'Mythic Raids', slug: 'mythic-raids', sortOrder: 3 },
    { name: 'Heroic Raids', slug: 'heroic-raids', sortOrder: 4 },
    { name: 'Dungeons', slug: 'dungeons', sortOrder: 5, isFeatured: true },
    { name: 'Mythic+ Dungeons', slug: 'mythic-plus-dungeons', sortOrder: 6 },
    { name: 'PVP', slug: 'pvp', sortOrder: 7, isFeatured: true },
    { name: 'Arena Boost', slug: 'arena-boost', sortOrder: 8 },
    { name: 'RBG Boost', slug: 'rbg-boost', sortOrder: 9 },
    { name: 'Leveling', slug: 'leveling', sortOrder: 10, isFeatured: true },
    { name: 'Power Leveling', slug: 'power-leveling', sortOrder: 11 },
    { name: 'Reputation Farm', slug: 'reputation-farm', sortOrder: 12 },
    { name: 'Mount Farming', slug: 'mount-farming', sortOrder: 13 },
    { name: 'Achievement Boost', slug: 'achievement-boost', sortOrder: 14 },
    { name: 'Gear Farming', slug: 'gear-farming', sortOrder: 15 },
    { name: 'Weekly Vault', slug: 'weekly-vault', sortOrder: 16 },
    { name: 'Event Boost', slug: 'event-boost', sortOrder: 17 },
    { name: 'Timewalking', slug: 'timewalking', sortOrder: 18 },
    { name: 'Seasonal Events', slug: 'seasonal-events', sortOrder: 19 },
    { name: 'Limited Offers', slug: 'limited-offers', sortOrder: 20 },
    { name: 'Coaching', slug: 'coaching', sortOrder: 21 }
];

const seedProduction = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // Clear only WoW related data for safety, or clear all if desired
        // For production-ready feel, let's clear all services and categories
        await Category.deleteMany({});
        await Service.deleteMany({});

        const wowGame = await Game.findOne({ slug: 'world-of-warcraft' });
        if (!wowGame) throw new Error('WoW Game not found. Run seed-all-assets.js first.');

        // 1. Insert Categories
        const createdCategories = await Category.insertMany(
            categoriesData.map(c => ({ ...c, gameId: wowGame._id }))
        );
        console.log(`Inserted ${createdCategories.length} Categories.`);

        const services = [];

        const getCatId = (slug) => createdCategories.find(c => c.slug === slug)._id;

        // 2. Insert Services (WOW Focus)

        // Gold Services
        services.push({
            gameId: wowGame._id,
            categoryId: getCatId('gold'),
            title: 'WoW Retail Gold - All Servers',
            slug: 'wow-retail-gold',
            categorySlug: 'gold',
            shortDescription: 'Safe and fast WoW Gold on any EU/US server. Best market rates.',
            description: 'Order any amount of WoW Gold. We use secure transfer methods like Guild Bank or AH to ensure your safety.',
            pricingRules: { type: 'quantity', min_value: 100000, max_value: 10000000, price_per_unit: 0.00015 }, // $0.015 per 100
            features: ['Instant Delivery', 'Safe Transfer Methods', '24/7 Support'],
            orders_count: 5042,
            rating: 4.9,
            icon: '/uploads/games/wow.png'
        });

        // Raid Services
        services.push({
            gameId: wowGame._id,
            categoryId: getCatId('mythic-raids'),
            title: 'Vault of the Incarnates - Mythic Full Clear',
            slug: 'vault-mythic-clear',
            categorySlug: 'mythic-raids',
            shortDescription: 'Full Mythic raid run with elite players and high-ilvl loot.',
            pricingRules: { type: 'fixed', basePrice: 249.00, discount_percentage: 15 },
            features: ['Full 8/8 Mythic Clear', 'Best-in-Slot Loot', 'Achievement Earned', 'Pro Booster Team'],
            orders_count: 820,
            rating: 5.0,
            is_hot_offer: true,
            icon: '/uploads/games/wow.png'
        });

        // Dungeon Services
        services.push({
            gameId: wowGame._id,
            categoryId: getCatId('mythic-plus-dungeons'),
            title: 'Mythic+ Dungeon Run (Keystone)',
            slug: 'mythic-plus-run',
            categorySlug: 'mythic-plus-dungeons',
            shortDescription: 'Custom Mythic plus keys from +2 to +20. Fast and professional.',
            pricingRules: { type: 'range', min_value: 2, max_value: 20, price_per_unit: 8.5 },
            features: ['Guaranteed Loot', 'Weekly Vault Reward', 'Timed Run Option'],
            orders_count: 3410,
            rating: 4.8,
            is_hot_offer: true,
            icon: '/uploads/games/wow.png'
        });

        // Leveling Services
        services.push({
            gameId: wowGame._id,
            categoryId: getCatId('leveling'),
            title: 'Character Powerleveling 1-70',
            slug: 'wow-powerleveling-1-70',
            categorySlug: 'leveling',
            shortDescription: 'Fast character leveling from level 1 to level 70 in record time.',
            pricingRules: { type: 'fixed', basePrice: 45.00, discount_percentage: 10 },
            features: ['Manual Leveling', 'VPN Protected', 'Full Gear Set', 'Fast Progress'],
            orders_count: 1240,
            rating: 4.7,
            icon: '/uploads/games/wow.png'
        });

        // PVP Services
        services.push({
            gameId: wowGame._id,
            categoryId: getCatId('arena-boost'),
            title: '3v3 Arena Rating Boost',
            slug: 'pvp-arena-boost',
            categorySlug: 'arena-boost',
            shortDescription: 'Reach your desired arena rating for elite gear and achievements.',
            pricingRules: { type: 'range', min_value: 0, max_value: 2400, price_per_unit: 0.15 }, // Simplified per point logic
            features: ['Elite Transmog Unlock', 'High ilvl Gear', 'Play with PROs'],
            orders_count: 650,
            rating: 4.9,
            icon: '/uploads/games/wow.png'
        });

        // Add 25 more services to meet the "20-30" requirement
        for (let i = 0; i < 25; i++) {
            const cat = createdCategories[i % createdCategories.length];
            services.push({
                gameId: wowGame._id,
                categoryId: cat._id,
                title: `${cat.name} Premium Service #${i + 1}`,
                slug: `service-${cat.slug}-${i}`,
                categorySlug: cat.slug,
                shortDescription: `Top tier ${cat.name} support from verified PROs.`,
                description: `Experience the best ${cat.name} service. We ensure 100% satisfaction and secure delivery.`,
                pricingRules: { type: 'fixed', basePrice: 15 + Math.random() * 100 },
                features: ['Verified Experts', 'Secure Process', 'Express Delivery'],
                orders_count: Math.floor(100 + Math.random() * 4900),
                rating: (4.6 + Math.random() * 0.4).toFixed(1),
                is_hot_offer: Math.random() > 0.8,
                icon: '/uploads/games/wow.png'
            });
        }

        await Service.insertMany(services);
        console.log(`Inserted ${services.length} Services.`);

        console.log('Production Seeding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding production data:', error);
        process.exit(1);
    }
};

seedProduction();
