const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Game = require('../models/Game');
const Service = require('../models/Service');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const gameDefinitions = [
    { name: 'Apex Legends', slug: 'apex-legends', category: 'Battle Royale', asset: 'apex' },
    { name: 'Call of Duty', slug: 'call-of-duty', category: 'FPS', asset: 'callofduty' },
    { name: 'Counter-Strike 2', slug: 'counter-strike-2', category: 'FPS', asset: 'cs2' },
    { name: 'Dead by Daylight', slug: 'dead-by-daylight', category: 'Horror', asset: 'deadbydaylight' },
    { name: 'Destiny 2', slug: 'destiny-2', category: 'MMORPG', asset: 'destiny2' },
    { name: 'Dota 2', slug: 'dota-2', category: 'MOBA', asset: 'dota2' },
    { name: 'Fortnite', slug: 'fortnite', category: 'Battle Royale', asset: 'fortnite' },
    { name: 'Genshin Impact', slug: 'genshin-impact', category: 'RPG', asset: 'genshin' },
    { name: 'GTA V', slug: 'gta-v', category: 'Action', asset: 'gtav' },
    { name: 'Helldivers 2', slug: 'helldivers-2', category: 'Action', asset: 'helldivers2' },
    { name: 'Honkai: Star Rail', slug: 'honkai-star-rail', category: 'RPG', asset: 'honkai' },
    { name: 'Last Epoch', slug: 'last-epoch', category: 'RPG', asset: 'lastepoch' },
    { name: 'League of Legends', slug: 'league-of-legends', category: 'MOBA', asset: 'lol' },
    { name: 'Lost Ark', slug: 'lost-ark', category: 'MMORPG', asset: 'lostark' },
    { name: 'Minecraft', slug: 'minecraft', category: 'Sandbox', asset: 'minecraft' },
    { name: 'Once Human', slug: 'once-human', category: 'Survival', asset: 'oncehuman' },
    { name: 'Overwatch 2', slug: 'overwatch-2', category: 'FPS', asset: 'overwatch2' },
    { name: 'Palworld', slug: 'palworld', category: 'Adventure', asset: 'palworld' },
    { name: 'Path of Exile', slug: 'path-of-exile', category: 'RPG', asset: 'pathofexile' },
    { name: 'PUBG', slug: 'pubg', category: 'Battle Royale', asset: 'pubg' },
    { name: 'Rainbow Six Siege', slug: 'rainbow-six-siege', category: 'FPS', asset: 'rainbow6' },
    { name: 'Escape from Tarkov', slug: 'escape-from-tarkov', category: 'FPS', asset: 'tarkov' },
    { name: 'The Finals', slug: 'the-finals', category: 'FPS', asset: 'thefinals' },
    { name: 'Valorant', slug: 'valorant', category: 'FPS', asset: 'valorant' },
    { name: 'Warframe', slug: 'warframe', category: 'Action', asset: 'warframe' },
    { name: 'World of Warcraft', slug: 'world-of-warcraft', category: 'RPG', asset: 'wow' },
    { name: 'FC 24', slug: 'fc-24', category: 'Sports', asset: 'fifa' }
];

const seedAll = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const Category = require('../models/Category');
        await Game.deleteMany({});
        await Service.deleteMany({});
        await Category.deleteMany({});

        const gamesToInsert = gameDefinitions.map((g, index) => ({
            name: g.name,
            slug: g.slug,
            category: g.category,
            icon: `/uploads/games/${g.asset}.png`,
            banner: `/uploads/games/${g.asset}.png`,
            bgImage: `/uploads/bg/${g.asset}-bg.jpg`,
            characterImage: `/uploads/characters/${g.asset}-char.png`,
            description: `Professional boosting and powerleveling for ${g.name}. Safe, fast, and reliable delivery guaranteed by elite players.`,
            status: 'active',
            isActive: true,
            isPopular: index < 10,
            isHot: index < 5,
            displayOrder: index,
            serviceCategories: [
                { name: 'Rank Boosting', slug: 'rank-boosting', isNew: true },
                { name: 'Powerleveling', slug: 'powerleveling', isNew: false },
                { name: 'Currency', slug: 'currency', isNew: false },
                { name: 'Coaching', slug: 'coaching', isNew: false }
            ]
        }));

        const createdGames = await Game.insertMany(gamesToInsert);
        console.log(`Inserted ${createdGames.length} Games.`);

        const categories = [];
        for (const game of createdGames) {
            for (const cat of game.serviceCategories) {
                categories.push({
                    name: `${game.name} ${cat.name}`,
                    slug: `${game.slug}-${cat.slug}`,
                    gameId: game._id,
                    isFeatured: true,
                    isActive: true
                });
            }
        }
        const createdCategories = await Category.insertMany(categories);
        console.log(`Inserted ${createdCategories.length} Categories.`);

        const services = [];
        for (const game of createdGames) {
            const gameCats = createdCategories.filter(c => c.gameId.toString() === game._id.toString());
            const rankCat = gameCats.find(c => c.slug.includes('rank-boosting')) || gameCats[0];
            const powerCat = gameCats.find(c => c.slug.includes('powerleveling')) || gameCats[0];
            const currencyCat = gameCats.find(c => c.slug.includes('currency')) || gameCats[0];

            services.push({
                gameId: game._id,
                title: `${game.name} Professional Rank Boost`,
                slug: `${game.slug}-rank-boost`,
                categoryId: rankCat._id,
                categorySlug: rankCat.slug,
                pricing: { basePrice: 19.99 + Math.random() * 50, discountPercent: 10, type: 'fixed' },
                icon: game.icon,
                description: `Achieve your desired rank in ${game.name} today. Our pro players will handle your account with maximum safety and efficiency.`,
                features: ['Safe VPN Protection', 'Express Delivery', 'High Win Rate'],
                isFeatured: true,
                is_hot_offer: true,
                serviceType: 'boosting',
                status: 'active',
                isActive: true
            });

            services.push({
                gameId: game._id,
                title: `${game.name} Elite Powerleveling`,
                slug: `${game.slug}-powerleveling`,
                categoryId: powerCat._id,
                categorySlug: powerCat.slug,
                pricing: { basePrice: 9.99 + Math.random() * 30, discountPercent: 15, type: 'fixed' },
                icon: game.icon,
                description: `Skip the grind in ${game.name}. Our elite levelers will get you to the top tier in no time.`,
                features: ['24/7 Support', 'Manual Leveling', 'Daily Updates'],
                is_hot_offer: Math.random() > 0.5,
                serviceType: 'boosting',
                status: 'active',
                isActive: true
            });

            services.push({
                gameId: game._id,
                title: `${game.name} Instant Delivery Package`,
                slug: `${game.slug}-currency-pack`,
                categoryId: currencyCat._id,
                categorySlug: currencyCat.slug,
                pricing: { basePrice: 4.99 + Math.random() * 20, discountPercent: 5, type: 'fixed' },
                icon: game.icon,
                description: `Get the resources you need in ${game.name} instantly. Guaranteed cheapest market price.`,
                features: ['Cheapest Price', 'Instant Startup', 'Guaranteed Safety'],
                is_hot_offer: false,
                serviceType: 'boosting',
                status: 'active',
                isActive: true
            });
        }

        await Service.insertMany(services);
        console.log(`Inserted ${services.length} Services.`);

        console.log('Massive seeding complete successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedAll();
