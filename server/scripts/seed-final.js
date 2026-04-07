const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Game = require('../models/Game');
const Service = require('../models/Service');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const games = [
    {
        name: 'Valorant',
        slug: 'valorant',
        icon: '/uploads/games/valorant.png',
        banner: '/uploads/games/valorant.png',
        bgImage: '/uploads/bg/valorant-bg.jpg',
        characterImage: '/uploads/characters/valorant-char.png',
        category: 'FPS',
        description: 'Achieve the Radiant rank today. Secure and fast Valorant boosting for all regions and agents.',
        isPopular: true,
        isHot: true,
        displayOrder: 1,
        serviceCategories: [
            { name: 'Rank Rating', slug: 'rank-rating', isNew: true },
            { name: 'Placement Matches', slug: 'placement-matches', isNew: false },
            { name: 'Unrated Matches', slug: 'unrated-matches', isNew: false }
        ]
    },
    {
        name: 'League of Legends',
        slug: 'league-of-legends',
        icon: '/uploads/games/lol.png',
        banner: '/uploads/games/lol.png',
        bgImage: '/uploads/bg/lol-bg.jpg',
        characterImage: '/uploads/characters/lol-char.png',
        category: 'MOBA',
        description: 'Climb the ladder and reach Challenger. Our PRO boosters from all regions are ready to help you dominate the Rift.',
        isPopular: true,
        isHot: true,
        displayOrder: 2,
        serviceCategories: [
            { name: 'Ranked Boost', slug: 'ranked-boost', isNew: true },
            { name: 'Placements', slug: 'placements', isNew: false },
            { name: 'Win Boost', slug: 'win-boost', isNew: false },
            { name: 'Coaching', slug: 'coaching', isNew: false }
        ]
    },
    {
        name: 'World of Warcraft',
        slug: 'world-of-warcraft',
        icon: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070', // Fallback for WoW
        banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070',
        bgImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070',
        characterImage: 'https://skycoach.gg/storage/uploads/games/wow/banner_char.png',
        category: 'RPG',
        description: 'Dominate Azeroth with our elite WoW boosting services. From Mythic raids to Gladiator ranks, we have you covered.',
        isPopular: true,
        isHot: true,
        displayOrder: 3,
        serviceCategories: [
            { name: 'Gold', slug: 'gold', isNew: false },
            { name: 'Raids', slug: 'raids', isNew: true },
            { name: 'Dungeons', slug: 'dungeons', isNew: false },
            { name: 'Powerleveling', slug: 'powerleveling', isNew: false },
            { name: 'PvP', slug: 'pvp', isNew: false }
        ]
    },
    {
        name: 'Counter-Strike 2',
        slug: 'counter-strike-2',
        icon: '/uploads/games/cs2.png',
        banner: '/uploads/games/cs2.png',
        bgImage: '/uploads/bg/cs2-bg.jpg',
        characterImage: '/uploads/characters/cs2-char.png',
        category: 'FPS',
        description: 'Classic tactical shooter sequel. Enhance your rank and skills.',
        isPopular: true,
        isHot: true,
        displayOrder: 4,
        serviceCategories: [
            { name: 'Premier Boost', slug: 'premier-boost', isNew: true },
            { name: 'Competitive Rank', slug: 'competitive-rank', isNew: false },
            { name: 'Wingman', slug: 'wingman', isNew: false }
        ]
    },
    {
        name: 'Apex Legends',
        slug: 'apex-legends',
        icon: '/uploads/games/apex.png',
        banner: '/uploads/games/apex.png',
        bgImage: '/uploads/bg/apex-bg.jpg',
        characterImage: '/uploads/characters/apex-char.png',
        category: 'Battle Royale',
        description: 'Battle royale with unique legends. Reach Predator rank.',
        isPopular: true,
        isHot: false,
        displayOrder: 5,
        serviceCategories: [
            { name: 'Ranked Leagues', slug: 'ranked-leagues', isNew: true },
            { name: 'Leveling', slug: 'leveling', isNew: false },
            { name: 'Badges', slug: 'badges', isNew: false }
        ]
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        await Game.deleteMany({});
        await Service.deleteMany({});
        console.log('Cleared existing data.');

        const createdGames = await Game.insertMany(games);
        console.log(`Inserted ${createdGames.length} Games.`);

        const services = [];

        // WoW Services
        const wow = createdGames.find(g => g.slug === 'world-of-warcraft');
        services.push(
            {
                gameId: wow._id,
                title: 'Classic Era Gold - Seasonal',
                slug: 'classic-era-gold',
                categorySlug: 'gold',
                pricing: { basePrice: 4.58, discountPercent: 15 },
                imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000',
                description: 'Any amount of gold on any server.',
                features: ['Any Amount of Gold', 'Fast Delivery', 'Cheapest Gold'],
                isFeatured: true
            },
            {
                gameId: wow._id,
                title: 'Mythic +2-20 Dungeons Boost',
                slug: 'mythic-dungeons-boost',
                categorySlug: 'dungeons',
                pricing: { basePrice: 4.60, discountPercent: 10 },
                imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1000',
                description: 'Get high level gear and weekly chest rewards.',
                features: ['124-141 ilvl Gear', '134-147 Weekly Chest']
            }
        );

        // Valorant Services
        const val = createdGames.find(g => g.slug === 'valorant');
        services.push(
            {
                gameId: val._id,
                title: 'Rank Rating (RR) Boost',
                slug: 'rank-rating-boost',
                categorySlug: 'rank-rating',
                pricing: { basePrice: 8.50, discountPercent: 25 },
                imageUrl: '/uploads/games/valorant.png',
                description: 'Increase your RR points quickly.',
                features: ['Top 500 Radiant Boosters', 'VPN Protected'],
                isFeatured: true
            }
        );

        // LoL Services
        const lol = createdGames.find(g => g.slug === 'league-of-legends');
        services.push(
            {
                gameId: lol._id,
                title: 'Ranked Division Boost',
                slug: 'ranked-division-boost',
                categorySlug: 'ranked-boost',
                pricing: { basePrice: 12.00, discountPercent: 5 },
                imageUrl: '/uploads/games/lol.png',
                description: 'Custom division boosting to your desired rank.',
                features: ['High Win Rate', 'Offline Mode'],
                isFeatured: true
            }
        );

        await Service.insertMany(services);
        console.log(`Inserted ${services.length} Services.`);

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
