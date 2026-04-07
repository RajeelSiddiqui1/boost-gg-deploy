require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');
const Game = require('../models/Game');
const Category = require('../models/Category');
const connectDB = require('../config/db');

// Sample services data with dynamicFields
const servicesData = [
    {
        title: 'Valorant Rank Boosting',
        description: 'Professional rank boosting service for Valorant. Our expert players will help you reach your desired rank quickly and safely.',
        gameId: null, // Will be populated from database
        categoryId: null, // Will be populated from database
        serviceType: 'boosting',
        icon: '/uploads/services/valorant-boost.png',
        pricing: {
            type: 'per_level',
            basePrice: 5,
            pricePerUnit: 5,
            minPrice: 10,
            maxPrice: 500,
            discountPercent: 0,
            tiers: []
        },
        deliveryTime: 24,
        features: [
            'Professional boosters',
            'Solo or duo queue',
            '24/7 support',
            'VPN protection',
            'Win tracking'
        ],
        requirements: [
            'Account must be email verified',
            '2FA must be enabled'
        ],
        platforms: ['PC'],
        regions: ['EU', 'US'],
        isActive: true,
        status: 'active',
        displayOrder: 1,
        isFeatured: true,
        tags: ['valorant', 'rank', 'boosting', 'radiant', 'immortal'],
        boostType: 'piloted',
        boostCategory: 'rank-boost',
        dynamicFields: [
            {
                fieldId: 'current_rank',
                label: 'Current Rank',
                fieldType: 'select',
                required: true,
                displayOrder: 1,
                options: [
                    { value: 'iron', label: 'Iron', priceModifier: 0, default: false },
                    { value: 'bronze', label: 'Bronze', priceModifier: 10, default: false },
                    { value: 'silver', label: 'Silver', priceModifier: 20, default: false },
                    { value: 'gold', label: 'Gold', priceModifier: 30, default: false },
                    { value: 'platinum', label: 'Platinum', priceModifier: 50, default: false },
                    { value: 'diamond', label: 'Diamond', priceModifier: 75, default: false },
                    { value: 'ascendant', label: 'Ascendant', priceModifier: 100, default: false },
                    { value: 'immortal', label: 'Immortal', priceModifier: 150, default: false }
                ]
            },
            {
                fieldId: 'desired_rank',
                label: 'Desired Rank',
                fieldType: 'select',
                required: true,
                displayOrder: 2,
                options: [
                    { value: 'silver', label: 'Silver', priceModifier: 0, default: false },
                    { value: 'gold', label: 'Gold', priceModifier: 10, default: false },
                    { value: 'platinum', label: 'Platinum', priceModifier: 25, default: false },
                    { value: 'diamond', label: 'Diamond', priceModifier: 50, default: false },
                    { value: 'ascendant', label: 'Ascendant', priceModifier: 75, default: false },
                    { value: 'immortal', label: 'Immortal', priceModifier: 100, default: false },
                    { value: 'radiant', label: 'Radiant', priceModifier: 200, default: false }
                ]
            },
            {
                fieldId: 'server',
                label: 'Server',
                fieldType: 'radio',
                required: true,
                displayOrder: 3,
                options: [
                    { value: 'eu', label: 'EU', priceModifier: 0, default: true },
                    { value: 'us', label: 'US', priceModifier: 0, default: false },
                    { value: 'asia', label: 'Asia', priceModifier: 5, default: false }
                ]
            },
            {
                fieldId: 'queue_type',
                label: 'Queue Type',
                fieldType: 'checkbox',
                required: false,
                displayOrder: 4,
                options: [
                    { value: 'solo', label: 'Solo Queue', priceModifier: 0, default: true },
                    { value: 'duo', label: 'Duo Queue', priceModifier: 20, default: false }
                ]
            }
        ]
    },
    {
        title: 'League of Legends Rank Boost',
        description: 'Reach your dream rank in LoL with our professional boosting service. Expert players available for all regions.',
        gameId: null,
        categoryId: null,
        serviceType: 'boosting',
        icon: '/uploads/services/lol-boost.png',
        pricing: {
            type: 'per_level',
            basePrice: 8,
            pricePerUnit: 8,
            minPrice: 15,
            maxPrice: 800,
            discountPercent: 5,
            tiers: []
        },
        deliveryTime: 48,
        features: [
            'Grandmaster players',
            'Secure & private',
            'Live progress tracking',
            'Flexible scheduling',
            'Money back guarantee'
        ],
        requirements: [
            'Unranked or ranked account',
            'Valid email'
        ],
        platforms: ['PC'],
        regions: ['EU', 'US', 'Oceanic'],
        isActive: true,
        status: 'active',
        displayOrder: 2,
        isFeatured: true,
        tags: ['lol', 'league', 'rank', 'boosting', 'diamond', 'master'],
        boostType: 'piloted',
        boostCategory: 'rank-boost',
        dynamicFields: [
            {
                fieldId: 'current_division',
                label: 'Current Division',
                fieldType: 'select',
                required: true,
                displayOrder: 1,
                options: [
                    { value: 'iron', label: 'Iron', priceModifier: 0, default: false },
                    { value: 'bronze', label: 'Bronze', priceModifier: 5, default: false },
                    { value: 'silver', label: 'Silver', priceModifier: 10, default: false },
                    { value: 'gold', label: 'Gold', priceModifier: 20, default: false },
                    { value: 'platinum', label: 'Platinum', priceModifier: 40, default: false },
                    { value: 'emerald', label: 'Emerald', priceModifier: 60, default: false },
                    { value: 'diamond', label: 'Diamond', priceModifier: 100, default: false },
                    { value: 'master', label: 'Master+', priceModifier: 200, default: false }
                ]
            },
            {
                fieldId: 'desired_division',
                label: 'Desired Division',
                fieldType: 'select',
                required: true,
                displayOrder: 2,
                options: [
                    { value: 'silver', label: 'Silver', priceModifier: 0, default: false },
                    { value: 'gold', label: 'Gold', priceModifier: 10, default: false },
                    { value: 'platinum', label: 'Platinum', priceModifier: 25, default: false },
                    { value: 'emerald', label: 'Emerald', priceModifier: 40, default: false },
                    { value: 'diamond', label: 'Diamond', priceModifier: 75, default: false },
                    { value: 'master', label: 'Master', priceModifier: 150, default: false },
                    { value: 'grandmaster', label: 'Grandmaster', priceModifier: 300, default: false }
                ]
            },
            {
                fieldId: 'region',
                label: 'Region',
                fieldType: 'radio',
                required: true,
                displayOrder: 3,
                options: [
                    { value: 'euw', label: 'EUW', priceModifier: 0, default: true },
                    { value: 'eune', label: 'EUNE', priceModifier: 0, default: false },
                    { value: 'na', label: 'NA', priceModifier: 0, default: false },
                    { value: 'oce', label: 'OCE', priceModifier: 10, default: false }
                ]
            },
            {
                fieldId: 'games_type',
                label: 'Games Type',
                fieldType: 'select',
                required: true,
                displayOrder: 4,
                options: [
                    { value: 'placement', label: 'Placement Matches', priceModifier: 0, default: false },
                    { value: 'division', label: 'Division Boost', priceModifier: 0, default: true },
                    { value: 'lp', label: 'LP Only', priceModifier: 50, default: false }
                ]
            }
        ]
    },
    {
        title: 'Counter-Strike 2 Rank Boost',
        description: 'Professional CS2 rank boosting service. Our skilled players will help you achieve Global Elite and beyond.',
        gameId: null,
        categoryId: null,
        serviceType: 'boosting',
        icon: '/uploads/services/cs2-boost.png',
        pricing: {
            type: 'per_level',
            basePrice: 10,
            pricePerUnit: 10,
            minPrice: 20,
            maxPrice: 600,
            discountPercent: 10,
            tiers: []
        },
        deliveryTime: 24,
        features: [
            'Global Elite boosters',
            'Premium account security',
            'Offline mode available',
            'Steam profile protection',
            'Fast completion'
        ],
        requirements: [
            'Steam account required',
            'Non-prime or Prime'
        ],
        platforms: ['PC'],
        regions: ['EU', 'US', 'Global'],
        isActive: true,
        status: 'active',
        displayOrder: 3,
        isFeatured: true,
        tags: ['cs2', 'csgo', 'rank', 'boosting', 'global', 'premier'],
        boostType: 'piloted',
        boostCategory: 'rank-boost',
        dynamicFields: [
            {
                fieldId: 'current_rank',
                label: 'Current Rank',
                fieldType: 'select',
                required: true,
                displayOrder: 1,
                options: [
                    { value: 's1', label: 'Silver I', priceModifier: 0, default: false },
                    { value: 's2', label: 'Silver II', priceModifier: 5, default: false },
                    { value: 's3', label: 'Silver III', priceModifier: 10, default: false },
                    { value: 's4', label: 'Silver IV', priceModifier: 15, default: false },
                    { value: 'gold', label: 'Gold Nova', priceModifier: 30, default: false },
                    { value: 'mg', label: 'Master Guardian', priceModifier: 50, default: false },
                    { value: 'dmg', label: 'DMG', priceModifier: 80, default: false },
                    { value: 'le', label: 'Legendary Eagle', priceModifier: 120, default: false },
                    { value: 'supreme', label: 'Supreme', priceModifier: 200, default: false }
                ]
            },
            {
                fieldId: 'desired_rank',
                label: 'Desired Rank',
                fieldType: 'select',
                required: true,
                displayOrder: 2,
                options: [
                    { value: 'gold', label: 'Gold Nova', priceModifier: 0, default: false },
                    { value: 'mg', label: 'Master Guardian', priceModifier: 10, default: false },
                    { value: 'dmg', label: 'DMG', priceModifier: 25, default: false },
                    { value: 'le', label: 'Legendary Eagle', priceModifier: 50, default: false },
                    { value: 'supreme', label: 'Supreme', priceModifier: 100, default: false },
                    { value: 'global', label: 'Global Elite', priceModifier: 200, default: false }
                ]
            },
            {
                fieldId: 'premier_rank',
                label: 'Current Premier Rating',
                fieldType: 'number',
                required: false,
                displayOrder: 3,
                rangeConfig: { min: 0, max: 35000, step: 100, unit: 'rating' }
            },
            {
                fieldId: 'boost_type',
                label: 'Boost Type',
                fieldType: 'radio',
                required: true,
                displayOrder: 4,
                options: [
                    { value: 'competitive', label: 'Competitive', priceModifier: 0, default: true },
                    { value: 'wingman', label: 'Wingman', priceModifier: 15, default: false },
                    { value: 'trust_factor', label: 'Trust Factor Boost', priceModifier: 30, default: false }
                ]
            }
        ]
    },
    {
        title: 'Fortnite Win Boosting',
        description: 'Get those Victory Royales you deserve! Our pro players will help you stack wins quickly.',
        gameId: null,
        categoryId: null,
        serviceType: 'boosting',
        icon: '/uploads/services/fortnite-boost.png',
        pricing: {
            type: 'per_win',
            basePrice: 15,
            pricePerUnit: 15,
            minPrice: 15,
            maxPrice: 300,
            discountPercent: 15,
            tiers: []
        },
        deliveryTime: 24,
        features: [
            'Experienced players',
            'Squad or Solo',
            'All platforms supported',
            'Season pass included option',
            'Real-time updates'
        ],
        requirements: [
            'Epic Games account',
            'Cross-platform if applicable'
        ],
        platforms: ['PC', 'PS4', 'PS5', 'Xbox', 'Mobile'],
        regions: ['EU', 'US', 'Global'],
        isActive: true,
        status: 'active',
        displayOrder: 4,
        isFeatured: false,
        tags: ['fortnite', 'wins', 'victory', 'royale', 'boosting'],
        boostType: 'piloted',
        boostCategory: 'rank-boost',
        dynamicFields: [
            {
                fieldId: 'wins_needed',
                label: 'Number of Wins',
                fieldType: 'select',
                required: true,
                displayOrder: 1,
                options: [
                    { value: '1', label: '1 Win', priceModifier: 0, default: false },
                    { value: '3', label: '3 Wins', priceModifier: -5, default: false },
                    { value: '5', label: '5 Wins', priceModifier: -10, default: true },
                    { value: '10', label: '10 Wins', priceModifier: -15, default: false },
                    { value: '25', label: '25 Wins', priceModifier: -25, default: false },
                    { value: '50', label: '50 Wins', priceModifier: -35, default: false }
                ]
            },
            {
                fieldId: 'game_mode',
                label: 'Game Mode',
                fieldType: 'radio',
                required: true,
                displayOrder: 2,
                options: [
                    { value: 'solo', label: 'Solo', priceModifier: 0, default: true },
                    { value: 'duo', label: 'Duo', priceModifier: -10, default: false },
                    { value: 'squad', label: 'Squad', priceModifier: -20, default: false },
                    { value: 'trio', label: 'Trio', priceModifier: -15, default: false }
                ]
            },
            {
                fieldId: 'platform',
                label: 'Platform',
                fieldType: 'select',
                required: true,
                displayOrder: 3,
                options: [
                    { value: 'pc', label: 'PC', priceModifier: 0, default: true },
                    { value: 'ps4', label: 'PS4', priceModifier: 5, default: false },
                    { value: 'ps5', label: 'PS5', priceModifier: 5, default: false },
                    { value: 'xbox', label: 'Xbox', priceModifier: 5, default: false },
                    { value: 'mobile', label: 'Mobile/Switch', priceModifier: 10, default: false }
                ]
            },
            {
                fieldId: 'account_level',
                label: 'Current Account Level',
                fieldType: 'number',
                required: false,
                displayOrder: 4,
                rangeConfig: { min: 1, max: 1000, step: 1, unit: 'level' }
            }
        ]
    },
    {
        title: 'Apex Legends Leveling Service',
        description: 'Level up your Apex Legends account quickly. Get access to all legends and battle pass rewards.',
        gameId: null,
        categoryId: null,
        serviceType: 'boosting',
        icon: '/uploads/services/apex-boost.png',
        pricing: {
            type: 'per_level',
            basePrice: 3,
            pricePerUnit: 3,
            minPrice: 20,
            maxPrice: 500,
            discountPercent: 0,
            tiers: []
        },
        deliveryTime: 48,
        features: [
            'All legends unlocked',
            'Battle pass progression',
            'XP boost included',
            'Secure account handling',
            '24/7 support'
        ],
        requirements: [
            'EA account',
            'Platform sharing enabled'
        ],
        platforms: ['PC', 'PS4', 'PS5', 'Xbox', 'Switch'],
        regions: ['EU', 'US', 'Asia'],
        isActive: true,
        status: 'active',
        displayOrder: 5,
        isFeatured: false,
        tags: ['apex', 'leveling', 'battle pass', 'legends', 'xp'],
        boostType: 'piloted',
        boostCategory: 'rank-boost',
        dynamicFields: [
            {
                fieldId: 'current_level',
                label: 'Current Level',
                fieldType: 'range',
                required: true,
                displayOrder: 1,
                rangeConfig: { min: 1, max: 500, step: 1, unit: 'level' }
            },
            {
                fieldId: 'desired_level',
                label: 'Desired Level',
                fieldType: 'range',
                required: true,
                displayOrder: 2,
                rangeConfig: { min: 10, max: 500, step: 1, unit: 'level' }
            },
            {
                fieldId: 'platform',
                label: 'Platform',
                fieldType: 'radio',
                required: true,
                displayOrder: 3,
                options: [
                    { value: 'pc', label: 'PC', priceModifier: 0, default: true },
                    { value: 'ps4', label: 'PS4', priceModifier: 10, default: false },
                    { value: 'ps5', label: 'PS5', priceModifier: 10, default: false },
                    { value: 'xbox', label: 'Xbox', priceModifier: 10, default: false },
                    { value: 'switch', label: 'Switch', priceModifier: 20, default: false }
                ]
            },
            {
                fieldId: 'battle_pass',
                label: 'Include Battle Pass',
                fieldType: 'checkbox',
                required: false,
                displayOrder: 4,
                options: [
                    { value: 'yes', label: 'Complete Battle Pass', priceModifier: 100, default: false }
                ]
            }
        ]
    },
    {
        title: 'League of Legends Coaching',
        description: 'Get better at LoL with 1-on-1 coaching from Challenger players. Learn game sense, mechanics, and macro.',
        gameId: null,
        categoryId: null,
        serviceType: 'coaching',
        icon: '/uploads/services/lol-coaching.png',
        pricing: {
            type: 'hourly',
            basePrice: 25,
            pricePerUnit: 25,
            minPrice: 25,
            maxPrice: 100,
            discountPercent: 10,
            tiers: []
        },
        deliveryTime: 24,
        features: [
            'Challenger coaches',
            'VOD review included',
            'Personalized improvement plan',
            'Live session analysis',
            'Discord/TeamSpeak support'
        ],
        requirements: [
            'Discord account',
            'Replay files (optional)'
        ],
        platforms: ['PC'],
        regions: ['EU', 'US', 'Global'],
        isActive: true,
        status: 'active',
        displayOrder: 6,
        isFeatured: true,
        tags: ['lol', 'coaching', 'lesson', 'challenger', 'vip'],
        boostType: 'both',
        boostCategory: 'coaching',
        dynamicFields: [
            {
                fieldId: 'coach_rank',
                label: 'Coach Rank',
                fieldType: 'select',
                required: true,
                displayOrder: 1,
                options: [
                    { value: 'diamond', label: 'Diamond Coach', priceModifier: 0, default: false },
                    { value: 'master', label: 'Master Coach', priceModifier: 10, default: false },
                    { value: 'grandmaster', label: 'Grandmaster Coach', priceModifier: 25, default: true },
                    { value: 'challenger', label: 'Challenger Coach', priceModifier: 50, default: false }
                ]
            },
            {
                fieldId: 'hours',
                label: 'Session Duration',
                fieldType: 'select',
                required: true,
                displayOrder: 2,
                options: [
                    { value: '1', label: '1 Hour', priceModifier: 0, default: true },
                    { value: '2', label: '2 Hours', priceModifier: -5, default: false },
                    { value: '3', label: '3 Hours', priceModifier: -10, default: false },
                    { value: '5', label: '5 Hours', priceModifier: -20, default: false }
                ]
            },
            {
                fieldId: 'role',
                label: 'Main Role',
                fieldType: 'radio',
                required: true,
                displayOrder: 3,
                options: [
                    { value: 'top', label: 'Top', priceModifier: 0, default: false },
                    { value: 'jungle', label: 'Jungle', priceModifier: 0, default: false },
                    { value: 'mid', label: 'Mid', priceModifier: 0, default: false },
                    { value: 'adc', label: 'ADC', priceModifier: 0, default: false },
                    { value: 'support', label: 'Support', priceModifier: 0, default: false }
                ]
            },
            {
                fieldId: 'session_type',
                label: 'Session Type',
                fieldType: 'checkbox',
                required: false,
                displayOrder: 4,
                options: [
                    { value: 'live', label: 'Live Coaching', priceModifier: 0, default: true },
                    { value: 'vod', label: 'VOD Review', priceModifier: -15, default: false }
                ]
            }
        ]
    },
    {
        title: 'Valorant Coaching Session',
        description: 'Improve your Valorant gameplay with professional coaching. Learn utility usage, aim training, and game sense.',
        gameId: null,
        categoryId: null,
        serviceType: 'coaching',
        icon: '/uploads/services/valorant-coaching.png',
        pricing: {
            type: 'hourly',
            basePrice: 20,
            pricePerUnit: 20,
            minPrice: 20,
            maxPrice: 80,
            discountPercent: 5,
            tiers: []
        },
        deliveryTime: 24,
        features: [
            'Radiant coaches',
            'Aim analysis',
            'Utility lineups',
            'Match review',
            'Custom drills'
        ],
        requirements: [
            'Discord account',
            'Replays or live session'
        ],
        platforms: ['PC'],
        regions: ['EU', 'US', 'Asia'],
        isActive: true,
        status: 'active',
        displayOrder: 7,
        isFeatured: false,
        tags: ['valorant', 'coaching', 'aim', 'radiant', 'lesson'],
        boostType: 'both',
        boostCategory: 'coaching',
        dynamicFields: [
            {
                fieldId: 'coach_rank',
                label: 'Coach Rank',
                fieldType: 'select',
                required: true,
                displayOrder: 1,
                options: [
                    { value: 'diamond', label: 'Diamond Coach', priceModifier: 0, default: false },
                    { value: 'ascendant', label: 'Ascendant Coach', priceModifier: 10, default: false },
                    { value: 'immortal', label: 'Immortal Coach', priceModifier: 25, default: true },
                    { value: 'radiant', label: 'Radiant Coach', priceModifier: 50, default: false }
                ]
            },
            {
                fieldId: 'hours',
                label: 'Session Length',
                fieldType: 'select',
                required: true,
                displayOrder: 2,
                options: [
                    { value: '1', label: '1 Hour', priceModifier: 0, default: true },
                    { value: '2', label: '2 Hours', priceModifier: -5, default: false }
                ]
            },
            {
                fieldId: 'focus',
                label: 'Focus Area',
                fieldType: 'checkbox',
                required: false,
                displayOrder: 3,
                options: [
                    { value: 'aim', label: 'Aim Training', priceModifier: 0, default: false },
                    { value: 'utility', label: 'Utility Usage', priceModifier: 0, default: false },
                    { value: 'gamesense', label: 'Game Sense', priceModifier: 0, default: false },
                    { value: 'movement', label: 'Movement', priceModifier: 0, default: false }
                ]
            }
        ]
    },
    {
        title: 'World of Warcraft Gold',
        description: 'Buy WoW Gold securely. Instant delivery, competitive prices, and 24/7 support.',
        gameId: null,
        categoryId: null,
        serviceType: 'gold',
        icon: '/uploads/services/wow-gold.png',
        pricing: {
            type: 'quantity',
            basePrice: 0.01,
            pricePerUnit: 0.01,
            minPrice: 5,
            maxPrice: 500,
            discountPercent: 20,
            tiers: []
        },
        deliveryTime: 15,
        features: [
            'Instant delivery',
            'All servers supported',
            'Trade in-game',
            'Cheapest prices',
            'Money back guarantee'
        ],
        requirements: [
            'Character name & realm',
            'Faction specified'
        ],
        platforms: ['PC'],
        regions: ['EU', 'US'],
        isActive: true,
        status: 'active',
        displayOrder: 8,
        isFeatured: true,
        tags: ['wow', 'gold', 'warcraft', 'currency', 'classic'],
        boostType: 'piloted',
        boostCategory: 'rank-boost',
        dynamicFields: [
            {
                fieldId: 'gold_amount',
                label: 'Gold Amount',
                fieldType: 'tier',
                required: true,
                displayOrder: 1,
                options: [
                    { value: '10k', label: '10,000 Gold', priceModifier: 0, default: false },
                    { value: '50k', label: '50,000 Gold', priceModifier: -5, default: true },
                    { value: '100k', label: '100,000 Gold', priceModifier: -10, default: false },
                    { value: '250k', label: '250,000 Gold', priceModifier: -15, default: false },
                    { value: '500k', label: '500,000 Gold', priceModifier: -20, default: false },
                    { value: '1m', label: '1,000,000 Gold', priceModifier: -30, default: false }
                ]
            },
            {
                fieldId: 'server_type',
                label: 'Server Type',
                fieldType: 'radio',
                required: true,
                displayOrder: 2,
                options: [
                    { value: 'retail', label: 'Retail (Dragonflight)', priceModifier: 0, default: true },
                    { value: 'classic', label: 'Classic (Era/WotLK)', priceModifier: -10, default: false },
                    { value: 'seasonal', label: 'SoD/Seasonal', priceModifier: 5, default: false }
                ]
            },
            {
                fieldId: 'faction',
                label: 'Faction',
                fieldType: 'select',
                required: true,
                displayOrder: 3,
                options: [
                    { value: 'horde', label: 'Horde', priceModifier: 0, default: true },
                    { value: 'alliance', label: 'Alliance', priceModifier: 0, default: false },
                    { value: 'both', label: 'Both Factions', priceModifier: 5, default: false }
                ]
            },
            {
                fieldId: 'delivery_method',
                label: 'Delivery Method',
                fieldType: 'checkbox',
                required: true,
                displayOrder: 4,
                options: [
                    { value: 'ingame', label: 'In-Game Mail/AH', priceModifier: 0, default: true },
                    { value: 'mule', label: 'Character Mule', priceModifier: 0, default: false },
                    { value: 'guild', label: 'Guild Bank', priceModifier: 0, default: false }
                ]
            }
        ]
    },
    {
        title: 'Apex Legends Accounts',
        description: 'Purchase pre-leveled Apex Legends accounts with unlocked legends and battle passes.',
        gameId: null,
        categoryId: null,
        serviceType: 'accounts',
        icon: '/uploads/services/apex-account.png',
        pricing: {
            type: 'fixed',
            basePrice: 50,
            pricePerUnit: 0,
            minPrice: 25,
            maxPrice: 500,
            discountPercent: 0,
            tiers: []
        },
        deliveryTime: 24,
        features: [
            'All legends unlocked',
            'Multiple battle passes',
            'Heirlooms included',
            'Original owner',
            'Warranty included'
        ],
        requirements: [
            'Email change required',
            'Platform specified'
        ],
        platforms: ['PC', 'PS4', 'PS5', 'Xbox', 'Switch'],
        regions: ['Global'],
        isActive: true,
        status: 'active',
        displayOrder: 9,
        isFeatured: false,
        tags: ['apex', 'account', 'legends', 'heirloom', 'battlepass'],
        boostType: 'piloted',
        boostCategory: 'rank-boost',
        dynamicFields: [
            {
                fieldId: 'account_level',
                label: 'Account Level',
                fieldType: 'select',
                required: true,
                displayOrder: 1,
                options: [
                    { value: '100', label: 'Level 100+', priceModifier: 0, default: false },
                    { value: '300', label: 'Level 300+', priceModifier: 20, default: true },
                    { value: '500', label: 'Level 500+', priceModifier: 50, default: false },
                    { value: '700', label: 'Level 700+', priceModifier: 100, default: false }
                ]
            },
            {
                fieldId: 'legends_count',
                label: 'Unlocked Legends',
                fieldType: 'select',
                required: true,
                displayOrder: 2,
                options: [
                    { value: 'all', label: 'All Legends', priceModifier: 0, default: true },
                    { value: 'most', label: 'Most Legends (15+)', priceModifier: -20, default: false }
                ]
            },
            {
                fieldId: 'heirlooms',
                label: 'Heirloom Shards',
                fieldType: 'radio',
                required: false,
                displayOrder: 3,
                options: [
                    { value: 'no', label: 'No Heirloom', priceModifier: 0, default: true },
                    { value: 'yes', label: 'With Heirloom Shards', priceModifier: 50, default: false }
                ]
            },
            {
                fieldId: 'battlepasses',
                label: 'Battle Passes',
                fieldType: 'checkbox',
                required: false,
                displayOrder: 4,
                options: [
                    { value: 'current', label: 'Current Season', priceModifier: 0, default: true },
                    { value: 'all', label: 'All Seasons', priceModifier: 100, default: false }
                ]
            }
        ]
    },
    {
        title: 'Overwatch 2 Rank Boost',
        description: 'Climb the competitive ladder in Overwatch 2. Our team will help you reach your desired rank.',
        gameId: null,
        categoryId: null,
        serviceType: 'boosting',
        icon: '/uploads/services/overwatch-boost.png',
        pricing: {
            type: 'per_level',
            basePrice: 12,
            pricePerUnit: 12,
            minPrice: 20,
            maxPrice: 700,
            discountPercent: 5,
            tiers: []
        },
        deliveryTime: 48,
        features: [
            'GM supports',
            'Tank/DPS/Support specialists',
            'Play with booster option',
            'Priority queue',
            'Account security'
        ],
        requirements: [
            'Battle.net account',
            'PC/Console crossplay'
        ],
        platforms: ['PC', 'PS4', 'PS5', 'Xbox'],
        regions: ['EU', 'US', 'Asia'],
        isActive: true,
        status: 'active',
        displayOrder: 10,
        isFeatured: false,
        tags: ['overwatch', 'ow2', 'rank', 'boosting', 'grandmaster', 'tank'],
        boostType: 'piloted',
        boostCategory: 'rank-boost',
        dynamicFields: [
            {
                fieldId: 'current_rank',
                label: 'Current Rank',
                fieldType: 'select',
                required: true,
                displayOrder: 1,
                options: [
                    { value: 'bronze', label: 'Bronze', priceModifier: 0, default: false },
                    { value: 'silver', label: 'Silver', priceModifier: 10, default: false },
                    { value: 'gold', label: 'Gold', priceModifier: 20, default: false },
                    { value: 'platinum', label: 'Platinum', priceModifier: 40, default: false },
                    { value: 'diamond', label: 'Diamond', priceModifier: 70, default: false },
                    { value: 'master', label: 'Master', priceModifier: 120, default: false },
                    { value: 'grandmaster', label: 'Grandmaster', priceModifier: 250, default: false }
                ]
            },
            {
                fieldId: 'desired_rank',
                label: 'Desired Rank',
                fieldType: 'select',
                required: true,
                displayOrder: 2,
                options: [
                    { value: 'silver', label: 'Silver', priceModifier: 0, default: false },
                    { value: 'gold', label: 'Gold', priceModifier: 10, default: false },
                    { value: 'platinum', label: 'Platinum', priceModifier: 25, default: false },
                    { value: 'diamond', label: 'Diamond', priceModifier: 50, default: false },
                    { value: 'master', label: 'Master', priceModifier: 100, default: false },
                    { value: 'grandmaster', label: 'Grandmaster', priceModifier: 200, default: false }
                ]
            },
            {
                fieldId: 'role',
                label: 'Role',
                fieldType: 'radio',
                required: true,
                displayOrder: 3,
                options: [
                    { value: 'tank', label: 'Tank', priceModifier: 0, default: true },
                    { value: 'dps', label: 'DPS', priceModifier: 0, default: false },
                    { value: 'support', label: 'Support', priceModifier: 0, default: false },
                    { value: 'any', label: 'Any Role', priceModifier: -10, default: false }
                ]
            },
            {
                fieldId: 'platform',
                label: 'Platform',
                fieldType: 'select',
                required: true,
                displayOrder: 4,
                options: [
                    { value: 'pc', label: 'PC', priceModifier: 0, default: true },
                    { value: 'console', label: 'Console (PS/Xbox)', priceModifier: 15, default: false }
                ]
            }
        ]
    }
];

const seedServices = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('Connected to MongoDB');

        // Get existing games
        const games = await Game.find({ status: 'active' });
        if (games.length === 0) {
            console.error('No games found in database. Please run seedGames.js first.');
            process.exit(1);
        }
        console.log(`Found ${games.length} games in database`);

        // Get a Valorant game (or first available)
        const valorantGame = games.find(g => g.name.toLowerCase().includes('valorant')) || games[0];
        
        // Get categories for the game
        let categories = await Category.find({ gameId: valorantGame._id });
        
        // If no categories exist, create default ones
        if (categories.length === 0) {
            console.log('Creating default categories...');
            const defaultCategories = [
                { name: 'Rank Boosting', slug: 'rank-boosting', gameId: valorantGame._id, description: 'Rank and level boosting services', displayOrder: 1 },
                { name: 'Coaching', slug: 'coaching', gameId: valorantGame._id, description: 'Professional coaching services', displayOrder: 2 },
                { name: 'Accounts', slug: 'accounts', gameId: valorantGame._id, description: 'Account sales', displayOrder: 3 },
                { name: 'Items', slug: 'items', gameId: valorantGame._id, description: 'In-game items', displayOrder: 4 }
            ];
            
            categories = await Category.insertMany(defaultCategories);
            console.log(`Created ${categories.length} categories`);
        }
        
        const rankBoostCategory = categories.find(c => c.name.toLowerCase().includes('rank')) || categories[0];

        // Find or create other games for different services
        const lolGame = games.find(g => g.name.toLowerCase().includes('league')) || valorantGame;
        const cs2Game = games.find(g => g.name.toLowerCase().includes('counter')) || valorantGame;
        const fortniteGame = games.find(g => g.name.toLowerCase().includes('fortnite')) || valorantGame;
        const apexGame = games.find(g => g.name.toLowerCase().includes('apex')) || valorantGame;
        const wowGame = games.find(g => g.name.toLowerCase().includes('warcraft')) || valorantGame;
        const overwatchGame = games.find(g => g.name.toLowerCase().includes('overwatch')) || valorantGame;

        // Clear existing services
        await Service.deleteMany({});
        console.log('Cleared existing services');

        // Prepare services data with correct game and category IDs
        const servicesToCreate = servicesData.map((service, index) => {
            let game, category, gameId, categoryId;

            switch (service.title) {
                case 'Valorant Rank Boosting':
                    game = valorantGame;
                    break;
                case 'League of Legends Rank Boost':
                case 'League of Legends Coaching':
                    game = lolGame;
                    break;
                case 'Counter-Strike 2 Rank Boost':
                    game = cs2Game;
                    break;
                case 'Fortnite Win Boosting':
                    game = fortniteGame;
                    break;
                case 'Apex Legends Leveling Service':
                case 'Apex Legends Accounts':
                    game = apexGame;
                    break;
                case 'World of Warcraft Gold':
                    game = wowGame;
                    break;
                case 'Overwatch 2 Rank Boost':
                    game = overwatchGame;
                    break;
                default:
                    game = valorantGame;
            }

            // Get category for this game
            return {
                ...service,
                gameId: game._id,
                categoryId: rankBoostCategory._id,
                slug: service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            };
        });

        // Create services
        const createdServices = await Service.insertMany(servicesToCreate);
        console.log(`Successfully created ${createdServices.length} services`);

        // Display created services
        console.log('\n=== Created Services ===');
        createdServices.forEach((service, index) => {
            console.log(`${index + 1}. ${service.title}`);
            console.log(`   - Type: ${service.serviceType}`);
            console.log(`   - Dynamic Fields: ${service.dynamicFields.length}`);
            console.log(`   - Price: $${service.pricing.basePrice}`);
            console.log('');
        });

        console.log('Services seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding services:', err.message);
        process.exit(1);
    }
};

seedServices();
