/**
 * World of Warcraft Marketplace Seed Script
 * Seeds 20+ categories and 25+ services with realistic pricing
 * 
 * Run with: node server/scripts/seed-wow-marketplace.js
 */

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg';

const GAME_ID = '699df84cd06c93476cc5f05a'; // World of Warcraft

// Categories data - 20+ categories
const categories = [
    // Main categories
    { name: 'Gold', slug: 'gold', icon: 'gold', sortOrder: 1, isFeatured: true },
    { name: 'Raids', slug: 'raids', icon: 'raid', sortOrder: 2, isFeatured: true },
    { name: 'Mythic Raids', slug: 'mythic-raids', icon: 'mythic', sortOrder: 3, isFeatured: true },
    { name: 'Heroic Raids', slug: 'heroic-raids', icon: 'heroic', sortOrder: 4, isFeatured: false },
    { name: 'Dungeons', slug: 'dungeons', icon: 'dungeon', sortOrder: 5, isFeatured: false },
    { name: 'Mythic+ Dungeons', slug: 'mythic-plus', icon: 'mythic-plus', sortOrder: 6, isFeatured: true },
    { name: 'PVP', slug: 'pvp', icon: 'pvp', sortOrder: 7, isFeatured: false },
    { name: 'Arena Boost', slug: 'arena-boost', icon: 'arena', sortOrder: 8, isFeatured: true },
    { name: 'RBG Boost', slug: 'rbg-boost', icon: 'rbg', sortOrder: 9, isFeatured: false },
    { name: 'Leveling', slug: 'leveling', icon: 'leveling', sortOrder: 10, isFeatured: false },
    { name: 'Power Leveling', slug: 'power-leveling', icon: 'power', sortOrder: 11, isFeatured: true },
    { name: 'Reputation Farm', slug: 'reputation', icon: 'reputation', sortOrder: 12, isFeatured: false },
    { name: 'Mount Farming', slug: 'mounts', icon: 'mount', sortOrder: 13, isFeatured: false },
    { name: 'Achievement Boost', slug: 'achievements', icon: 'achievement', sortOrder: 14, isFeatured: false },
    { name: 'Gear Farming', slug: 'gear', icon: 'gear', sortOrder: 15, isFeatured: false },
    { name: 'Weekly Vault', slug: 'weekly-vault', icon: 'vault', sortOrder: 16, isFeatured: true },
    { name: 'Event Boost', slug: 'events', icon: 'event', sortOrder: 17, isFeatured: false },
    { name: 'Timewalking', slug: 'timewalking', icon: 'timewalking', sortOrder: 18, isFeatured: false },
    { name: 'Coaching', slug: 'coaching', icon: 'coach', sortOrder: 19, isFeatured: false },
    { name: 'Custom Orders', slug: 'custom', icon: 'custom', sortOrder: 20, isFeatured: false },
    { name: 'Tier Sets', slug: 'tier-sets', icon: 'tier', sortOrder: 21, isFeatured: false },
    { name: 'Professions', slug: 'professions', icon: 'profession', sortOrder: 22, isFeatured: false },
    { name: 'Legacy Raids', slug: 'legacy-raids', icon: 'legacy', sortOrder: 23, isFeatured: false },
];

// Services data with pricing rules and features
const services = [
    // GOLD SERVICES (Quantity-based pricing)
    {
        title: 'WoW Gold - US Servers',
        slug: 'wow-gold-us',
        shortDescription: 'Instant gold delivery on all US servers',
        description: 'Purchase WoW Gold on US servers with instant delivery. We support all major servers including Area 52, Stormrage, Illidan, and more. Our professional team ensures safe and fast delivery.',
        categorySlug: 'gold',
        features: ['Instant delivery', 'All US servers supported', '24/7 delivery', 'Best market rates'],
        pricing: { type: 'quantity', basePrice: 0, minPrice: 0 },
        pricingRules: { type: 'quantity', min_value: 10000, max_value: 10000000, price_per_unit: 0.00015 },
        price: 1.5, // Price per 10K
        orders_count: 4250,
        rating: 4.9,
        deliveryTime: 1,
        is_hot_offer: true,
        discount: 10
    },
    {
        title: 'WoW Gold - EU Servers',
        slug: 'wow-gold-eu',
        shortDescription: 'Fast gold delivery on all EU servers',
        description: 'Purchase WoW Gold on EU servers with instant or scheduled delivery. We support all European realms including Draenor, Kazzakas, and more.',
        categorySlug: 'gold',
        features: ['Instant delivery', 'All EU servers supported', 'Bulk discounts available', 'Secure transactions'],
        pricing: { type: 'quantity', basePrice: 0, minPrice: 0 },
        pricingRules: { type: 'quantity', min_value: 10000, max_value: 10000000, price_per_unit: 0.00012 },
        price: 1.2,
        orders_count: 3890,
        rating: 4.8,
        deliveryTime: 1,
        discount: 5
    },
    {
        title: 'Custom Gold Amount',
        slug: 'custom-gold-amount',
        shortDescription: 'Any custom gold amount you need',
        description: 'Need a specific amount of gold? We can deliver any amount from 1K to millions. Custom orders are processed within our standard delivery times.',
        categorySlug: 'gold',
        features: ['Any amount', 'Custom delivery time', 'Volume discounts', 'Dedicated support'],
        pricing: { type: 'quantity', basePrice: 0 },
        pricingRules: { type: 'quantity', min_value: 1000, max_value: 50000000, price_per_unit: 0.00014 },
        price: 1.4,
        orders_count: 1250,
        rating: 4.7,
        deliveryTime: 24
    },

    // RAID SERVICES (Fixed pricing)
    {
        title: 'Normal Raid Clear',
        slug: 'normal-raid-clear',
        shortDescription: 'Complete any normal raid on retail WoW',
        description: 'Our professional boosters will complete any normal raid of your choice. We cover all current tier raids including Vault of the Incarnates and legacy content.',
        categorySlug: 'raids',
        features: ['Full raid clear', 'All bosses killed', 'Loot trading available', 'Fast completion'],
        pricing: { type: 'fixed', basePrice: 35 },
        price: 35,
        orders_count: 2150,
        rating: 4.9,
        deliveryTime: 2,
        discount: 0
    },
    {
        title: 'Heroic Raid Clear',
        slug: 'heroic-raid-clear',
        shortDescription: 'Complete any heroic raid for gear and achievements',
        description: 'Get through heroic difficulty with our expert team. We guarantee boss kills and can help you get the gear you need from the current raid tier.',
        categorySlug: 'heroic-raids',
        features: ['All heroic bosses', 'Gear loot priority', 'Achievement included', 'Flexible timing'],
        pricing: { type: 'fixed', basePrice: 79 },
        price: 79,
        orders_count: 1850,
        rating: 4.8,
        deliveryTime: 3,
        is_hot_offer: true,
        discount: 15
    },
    {
        title: 'Mythic Raid Full Clear',
        slug: 'mythic-raid-full-clear',
        shortDescription: 'Complete all Mythic bosses with carry',
        description: 'Top-tier professional boost for Mythic raid content. Our world-class team will clear the entire Mythic raid including all bosses and optional encounters.',
        categorySlug: 'mythic-raids',
        features: ['Full Mythic clear', 'High-end gear', 'Achievement mounts', 'Premium service'],
        pricing: { type: 'fixed', basePrice: 399 },
        price: 399,
        orders_count: 420,
        rating: 5.0,
        deliveryTime: 5,
        is_hot_offer: false,
        discount: 0
    },
    {
        title: 'Mythic +特定Boss Carry',
        slug: 'mythic-boss-carry',
        shortDescription: 'Kill specific Mythic bosses',
        description: 'Need a specific Mythic boss kill? We can help you defeat any boss in Mythic difficulty including world first teams available for hard encounters.',
        categorySlug: 'mythic-raids',
        features: ['Specific boss kill', 'All loot goes to you', 'Video proof provided', 'Scheduled runs'],
        pricing: { type: 'fixed', basePrice: 149 },
        price: 149,
        orders_count: 680,
        rating: 4.9,
        deliveryTime: 2,
        discount: 0
    },

    // MYTHIC+ DUNGEONS (Range-based pricing)
    {
        title: 'Mythic+ 2-10 Boost',
        slug: 'mythic-plus-2-10',
        shortDescription: 'Complete Mythic+ from +2 to +10',
        description: 'Push your Keystone from +2 to +10. Our boosters will run the dungeon and time it, giving you gear and vault progress.',
        categorySlug: 'mythic-plus',
        features: ['Timed runs', 'Gear rewards', 'Vault progress', 'Weekly rewards'],
        pricing: { type: 'per_level', pricePerUnit: 8 },
        pricingRules: { type: 'range', min_value: 2, max_value: 10, price_per_unit: 8 },
        price: 16, // Starting at +2
        orders_count: 3250,
        rating: 4.9,
        deliveryTime: 2,
        is_hot_offer: true,
        discount: 20
    },
    {
        title: 'Mythic+ 10-20 Boost',
        slug: 'mythic-plus-10-20',
        shortDescription: 'High-level Mythic+ push from +10 to +20',
        description: 'Push your Keystone to high levels. Our expert team will time challenging +10 to +20 dungeons and help you get the best gear.',
        categorySlug: 'mythic-plus',
        features: ['High keys timed', 'Premium gear', 'Score push', 'Elite boosters'],
        pricing: { type: 'per_level', pricePerUnit: 15 },
        pricingRules: { type: 'range', min_value: 10, max_value: 20, price_per_unit: 15 },
        price: 150, // Starting at +10
        orders_count: 1680,
        rating: 4.8,
        deliveryTime: 3,
        discount: 10
    },
    {
        title: 'Keystone Master',
        slug: 'keystone-master',
        shortDescription: 'Get Keystone Master achievement and title',
        description: 'Complete all 8 dungeon portals on Mythic+ 20 within the weekly reset. This package includes all dungeons at +20 key level.',
        categorySlug: 'mythic-plus',
        features: ['All 8 dungeons', '+20 timed', 'Keystone Master title', 'Mount included'],
        pricing: { type: 'fixed', basePrice: 499 },
        price: 499,
        orders_count: 890,
        rating: 5.0,
        deliveryTime: 7,
        is_hot_offer: true,
        discount: 25
    },
    {
        title: 'Custom Mythic+ Push',
        slug: 'custom-mythic-push',
        shortDescription: 'Push to any key level you want',
        description: 'Tell us what key level you need. Our team will push to any Mythic+ level you desire with timed completion.',
        categorySlug: 'mythic-plus',
        features: ['Any key level', 'Custom schedule', 'Dedicated team', 'Flexible timing'],
        pricing: { type: 'per_level', pricePerUnit: 12 },
        pricingRules: { type: 'range', min_value: 2, max_value: 30, price_per_unit: 12 },
        price: 24,
        orders_count: 720,
        rating: 4.7,
        deliveryTime: 2,
        discount: 0
    },

    // PVP / ARENA SERVICES
    {
        title: 'Arena 1400 Rating Boost',
        slug: 'arena-1400',
        shortDescription: 'Reach 1400 rating in 3v3 Arena',
        description: 'Push your Arena rating to 1400 (Duelist). Our experienced players will help you achieve the rating you need for rewards and achievements.',
        categorySlug: 'arena-boost',
        features: ['Reach 1400 rating', 'Duelist achievement', 'Weekly rewards', 'Secure play'],
        pricing: { type: 'fixed', basePrice: 89 },
        price: 89,
        orders_count: 2450,
        rating: 4.8,
        deliveryTime: 3,
        discount: 10
    },
    {
        title: 'Arena 1800 Rating Boost',
        slug: 'arena-1800',
        shortDescription: 'Reach 1800 rating for Elite gear',
        description: 'Reach 1800 rating to unlock Elite transmog sets and achievements. Our top players will carry you to the rating you need.',
        categorySlug: 'arena-boost',
        features: ['Elite gear unlocked', '1800 achievement', 'High win rate', 'Premium service'],
        pricing: { type: 'fixed', basePrice: 199 },
        price: 199,
        orders_count: 1120,
        rating: 4.9,
        deliveryTime: 5,
        is_hot_offer: true,
        discount: 15
    },
    {
        title: 'Arena 2400 Gladiator Push',
        slug: 'arena-gladiator',
        shortDescription: 'Push to Gladiator rating (2400+)',
        description: 'Reach Gladiator rating (top 0.5%) with our world-class Arena team. This isP achievement in the ultimate Pv WoW.',
        categorySlug: 'arena-boost',
        features: ['Gladiator title', 'Mount reward', 'Top 0.5%', 'Extreme skill'],
        pricing: { type: 'fixed', basePrice: 899 },
        price: 899,
        orders_count: 180,
        rating: 5.0,
        deliveryTime: 7,
        discount: 0
    },
    {
        title: 'RBG Rating Boost',
        slug: 'rbg-rating-boost',
        shortDescription: 'Reach desired RBG rating',
        description: 'Boost your Rated Battleground rating to earn rewards, achievements, and elite gear. Our organized teams will help you win.',
        categorySlug: 'rbg-boost',
        features: ['Any rating goal', 'Win-focused', 'Achievements', 'Team play'],
        pricing: { type: 'fixed', basePrice: 129 },
        price: 129,
        orders_count: 890,
        rating: 4.7,
        deliveryTime: 3,
        discount: 5
    },

    // LEVELING SERVICES
    {
        title: 'Character Leveling 1-70',
        slug: 'leveling-1-70',
        shortDescription: 'Level your character from 1 to 70',
        description: 'Professional power leveling from 1 to 70. We use the fastest routes and methods to get your character to max level quickly.',
        categorySlug: 'leveling',
        features: ['Level 1 to 70', 'Fast completion', 'All quests done', 'Mounts learned'],
        pricing: { type: 'fixed', basePrice: 79 },
        price: 79,
        orders_count: 1850,
        rating: 4.8,
        deliveryTime: 24,
        discount: 10
    },
    {
        title: '60-70 Dragonflight Leveling',
        slug: 'leveling-60-70',
        shortDescription: 'Fast Dragonflight leveling 60-70',
        description: 'Quick leveling from 60 to 70 in the Dragonflight expansion. Perfect for alts or new characters wanting to join the Dragon Isles.',
        categorySlug: 'leveling',
        features: ['Dragonflight ready', 'Fastest route', 'Quality time', 'All content unlocked'],
        pricing: { type: 'fixed', basePrice: 45 },
        price: 45,
        orders_count: 2200,
        rating: 4.9,
        deliveryTime: 8,
        is_hot_offer: true,
        discount: 20
    },
    {
        title: 'Leveling Package Deluxe',
        slug: 'leveling-deluxe',
        shortDescription: 'Complete leveling with gear and gold',
        description: 'Premium leveling package includes leveling, basic gear, and gold. Everything you need to start endgame content.',
        categorySlug: 'power-leveling',
        features: ['Full level 70', 'Gear included', 'Gold bundle', 'Ready for raids'],
        pricing: { type: 'fixed', basePrice: 199 },
        price: 199,
        orders_count: 650,
        rating: 4.9,
        deliveryTime: 48,
        discount: 15
    },

    // REPUTATION SERVICES
    {
        title: 'Dragonflight Reputation Farm',
        slug: 'dragonflight-reputation',
        shortDescription: 'Max out all Dragonflight factions',
        description: 'Get all Dragonflight reputations to Exalted. We cover all major factions including Dragonscale Expedition, Iskaara Tuskarr, and more.',
        categorySlug: 'reputation',
        features: ['All factions', 'Exalted status', 'Rewards unlocked', 'Time saver'],
        pricing: { type: 'fixed', basePrice: 149 },
        price: 149,
        orders_count: 480,
        rating: 4.7,
        deliveryTime: 12,
        discount: 0
    },
    {
        title: 'Shadowlands Reputations',
        slug: 'shadowlands-reputation',
        shortDescription: 'Complete Shadowlands reputations',
        description: 'Max out Shadowlands covenant reputations. Get all the rewards, mounts, and cosmetics from completing reputation grinds.',
        categorySlug: 'reputation',
        features: ['All covenants', 'Exclusive rewards', 'Mounts included', 'Complete package'],
        pricing: { type: 'fixed', basePrice: 129 },
        price: 129,
        orders_count: 320,
        rating: 4.6,
        deliveryTime: 10,
        discount: 0
    },

    // MOUNT FARMING
    {
        title: 'Rare Mount Farming',
        slug: 'rare-mounts',
        shortDescription: 'Farm rare and legendary mounts',
        description: 'Our team will help you obtain rare and legendary mounts from various content. We offer mount runs for specific or multiple mounts.',
        categorySlug: 'mounts',
        features: ['Rare mounts', 'Guaranteed drops', 'Multiple attempts', 'Collection building'],
        pricing: { type: 'fixed', basePrice: 25 },
        price: 25,
        orders_count: 890,
        rating: 4.8,
        deliveryTime: 2,
        discount: 0
    },
    {
        title: 'Mount Pack - All Expansions',
        slug: 'mount-pack',
        shortDescription: 'Collection of mounts from all expansions',
        description: 'Get a massive collection of mounts from across all WoW expansions. Perfect for collectors wanting to expand their mount inventory.',
        categorySlug: 'mounts',
        features: ['100+ mounts', 'All expansions', 'Rare & common', 'Collector goal'],
        pricing: { type: 'fixed', basePrice: 399 },
        price: 399,
        orders_count: 150,
        rating: 4.9,
        deliveryTime: 72,
        is_hot_offer: true,
        discount: 25
    },

    // ACHIEVEMENT SERVICES
    {
        title: 'Achievement Boost - Gold',
        slug: 'achievement-gold',
        shortDescription: 'Complete major gold achievements',
        description: 'Let our team complete time-consuming gold achievements for you. We cover raiding, PvP, and general achievements.',
        categorySlug: 'achievements',
        features: ['Gold achievements', 'Time saver', 'All categories', 'Proof provided'],
        pricing: { type: 'fixed', basePrice: 99 },
        price: 99,
        orders_count: 420,
        rating: 4.7,
        deliveryTime: 5,
        discount: 0
    },
    {
        title: 'Realm First Achievements',
        slug: 'realm-first',
        shortDescription: 'Get Realm First achievements',
        description: 'Compete for Realm First achievements with our expert teams. Be the first on your server to achieve major milestones.',
        categorySlug: 'achievements',
        features: ['First on server', 'Competitive edge', 'Elite团队', 'Proven track record'],
        pricing: { type: 'fixed', basePrice: 499 },
        price: 499,
        orders_count: 45,
        rating: 5.0,
        deliveryTime: 10,
        discount: 0
    },

    // WEEKLY VAULT
    {
        title: 'Weekly Vault Complete',
        slug: 'weekly-vault',
        shortDescription: 'Complete all weekly vault activities',
        description: 'Let us complete your weekly vault activities including raids, dungeons, and PvP. Get maximum vault rewards every week.',
        categorySlug: 'weekly-vault',
        features: ['Full clear', 'Max rewards', 'All activities', 'Weekly service'],
        pricing: { type: 'fixed', basePrice: 89 },
        price: 89,
        orders_count: 1450,
        rating: 4.9,
        deliveryTime: 3,
        is_hot_offer: true,
        discount: 15
    },
    {
        title: 'Vault +20 Runs',
        slug: 'vault-mythic-runs',
        shortDescription: 'Get maximum vault tier from Mythic+',
        description: 'Run 4 Mythic+ dungeons at +20 or higher to get the best vault rewards. We guarantee +20 timed completion.',
        categorySlug: 'weekly-vault',
        features: ['4x +20 runs', 'Tier 3 rewards', 'Best gear', 'Efficient service'],
        pricing: { type: 'fixed', basePrice: 199 },
        price: 199,
        orders_count: 780,
        rating: 4.8,
        deliveryTime: 4,
        discount: 10
    },

    // COACHING SERVICES
    {
        title: 'PvP Coaching Session',
        slug: 'pvp-coaching',
        shortDescription: '1-on-1 PvP coaching with expert player',
        description: 'Improve your PvP skills with personalized coaching from top players. Learn strategies, mechanics, and improve your ratings.',
        categorySlug: 'coaching',
        features: ['1-on-1 session', 'Personalized tips', 'Replay analysis', 'Skill improvement'],
        pricing: { type: 'hourly', pricePerUnit: 30 },
        price: 30,
        orders_count: 560,
        rating: 4.9,
        deliveryTime: 1,
        discount: 0
    },
    {
        title: 'Raiding Coaching',
        slug: 'raid-coaching',
        shortDescription: 'Learn raid mechanics and strategies',
        description: 'Expert raid coaching to help you improve. Learn boss mechanics, positioning, and raid leadership skills.',
        categorySlug: 'coaching',
        features: ['Raid mechanics', 'Boss strategies', 'Class optimization', 'Team coordination'],
        pricing: { type: 'hourly', pricePerUnit: 40 },
        price: 40,
        orders_count: 280,
        rating: 4.8,
        deliveryTime: 2,
        discount: 0
    },

    // GEAR FARMING
    {
        title: 'Tier Set Farming',
        slug: 'tier-set-farming',
        shortDescription: 'Get complete tier sets from raids',
        description: 'Farm complete tier sets from current and previous raid tiers. Get the gear you need for optimal performance.',
        categorySlug: 'gear',
        features: ['Tier pieces', 'Guaranteed drops', 'Specific slots', 'Priority loot'],
        pricing: { type: 'fixed', basePrice: 249 },
        price: 249,
        orders_count: 340,
        rating: 4.7,
        deliveryTime: 5,
        discount: 0
    },

    // TIMEWALKING
    {
        title: 'Timewalking Campaigns',
        slug: 'timewalking',
        shortDescription: 'Complete Timewalking dungeons and raids',
        description: 'Run Timewalking events for rewards, mounts, and achievements. We cover all Timewalking dungeons and raids.',
        categorySlug: 'timewalking',
        features: ['All dungeons', 'Rewards farming', 'Mount chances', 'Achievements'],
        pricing: { type: 'fixed', basePrice: 35 },
        price: 35,
        orders_count: 420,
        rating: 4.6,
        deliveryTime: 2,
        discount: 0
    },

    // CUSTOM ORDERS
    {
        title: 'Custom Service Request',
        slug: 'custom-order',
        shortDescription: 'Any custom WoW service you need',
        description: 'Have a unique request? Tell us what you need and we will create a custom service for you.',
        categorySlug: 'custom',
        features: ['Any service', 'Custom quote', 'Flexible terms', 'Direct support'],
        pricing: { type: 'fixed', basePrice: 50 },
        price: 50,
        orders_count: 180,
        rating: 4.5,
        deliveryTime: 24,
        discount: 0
    },
];

async function seedDatabase() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const Category = require('../models/Category');
        const Service = require('../models/Service');
        const Game = require('../models/Game');

        // Get World of Warcraft game
        const wowGame = await Game.findOne({ _id: GAME_ID });
        if (!wowGame) {
            console.error('World of Warcraft game not found!');
            process.exit(1);
        }
        console.log(`Found game: ${wowGame.name} (${wowGame._id})`);

        // Clear existing categories and services for WoW
        await Category.deleteMany({ gameId: wowGame._id });
        await Service.deleteMany({ gameId: wowGame._id });
        console.log('Cleared existing categories and services');

        // Create categories
        const categoryMap = {};
        const createdCategories = [];

        for (const cat of categories) {
            const category = await Category.create({
                gameId: wowGame._id,
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon,
                sortOrder: cat.sortOrder,
                isFeatured: cat.isFeatured || false,
                isActive: true
            });
            categoryMap[cat.slug] = category._id;
            createdCategories.push(category);
            console.log(`Created category: ${cat.name}`);
        }

        console.log(`\nCreated ${createdCategories.length} categories`);

        // Create services
        const createdServices = [];

        for (const svc of services) {
            const categoryId = categoryMap[svc.categorySlug];
            if (!categoryId) {
                console.warn(`Category not found for service: ${svc.title}`);
                continue;
            }

            const service = await Service.create({
                gameId: wowGame._id,
                categoryId: categoryId,
                title: svc.title,
                slug: svc.slug,
                shortDescription: svc.shortDescription,
                description: svc.description,
                categorySlug: svc.categorySlug,
                serviceType: 'boosting',
                icon: '',
                features: svc.features,
                pricing: {
                    type: svc.pricing.type,
                    basePrice: svc.pricing.basePrice || 0,
                    pricePerUnit: svc.pricing.pricePerUnit || 0,
                    discountPercent: svc.discount || 0
                },
                pricingRules: svc.pricingRules || {
                    type: 'fixed',
                    basePrice: svc.price
                },
                price: svc.price,
                deliveryTime: svc.deliveryTime,
                deliveryTimeText: `${svc.deliveryTime} hour${svc.deliveryTime > 1 ? 's' : ''}`,
                isActive: true,
                status: 'active',
                is_hot_offer: svc.is_hot_offer || false,
                isFeatured: svc.is_hot_offer || false,
                popularityScore: svc.orders_count || 100,
                orders_count: svc.orders_count || 100,
                rating: svc.rating || 4.5,
                reviewsCount: Math.floor((svc.orders_count || 100) * 0.3),
                tags: [svc.categorySlug, 'wow', 'boosting'],
                displayOrder: createdServices.length
            });

            createdServices.push(service);
            console.log(`Created service: ${svc.title} - $${svc.price}`);
        }

        console.log(`\nCreated ${createdServices.length} services`);

        // Update game stats
        await Game.findByIdAndUpdate(wowGame._id, {
            $set: {
                serviceCategories: createdCategories.map(c => ({
                    name: c.name,
                    slug: c.slug,
                    icon: c.icon,
                    displayOrder: c.sortOrder
                }))
            }
        });

        console.log('\n✅ Seed completed successfully!');
        console.log(`   - Categories: ${createdCategories.length}`);
        console.log(`   - Services: ${createdServices.length}`);
        console.log(`   - Featured categories: ${createdCategories.filter(c => c.isFeatured).length}`);
        console.log(`   - Hot offer services: ${createdServices.filter(s => s.is_hot_offer).length}`);

    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedDatabase();
