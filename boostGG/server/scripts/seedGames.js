require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('../models/Game');
const connectDB = require('../config/db');

const games = [
    {
        name: 'Valorant',
        title: 'Valorant',
        icon: '/uploads/games/valorant.png',
        banner: '/uploads/games/valorant.png',
        bgImage: '/uploads/bg/valorant-bg.jpg',
        characterImage: '/uploads/characters/valorant-char.png',
        category: 'FPS',
        description: 'Competitive first-person shooter with unique agent abilities',
        isPopular: true,
        isHot: true,
        displayOrder: 1
    },
    {
        name: 'League of Legends',
        title: 'League of Legends',
        icon: '/uploads/games/lol.png',
        banner: '/uploads/games/lol.png',
        bgImage: '/uploads/bg/lol-bg.jpg',
        characterImage: '/uploads/characters/lol-char.png',
        category: 'MOBA',
        description: 'Multiplayer online battle arena game',
        isPopular: true,
        isHot: true,
        displayOrder: 2
    },
    {
        name: 'Counter-Strike 2',
        title: 'Counter-Strike 2',
        icon: '/uploads/games/cs2.png',
        banner: '/uploads/games/cs2.png',
        bgImage: '/uploads/bg/cs2-bg.jpg',
        characterImage: '/uploads/characters/cs2-char.png',
        category: 'FPS',
        description: 'Classic tactical shooter sequel',
        isPopular: true,
        isHot: true,
        displayOrder: 3
    },
    {
        name: 'Fortnite',
        title: 'Fortnite',
        icon: '/uploads/games/fortnite.png',
        banner: '/uploads/games/fortnite.png',
        bgImage: '/uploads/bg/fortnite-bg.jpg',
        characterImage: '/uploads/characters/fortnite-char.png',
        category: 'Battle Royale',
        description: 'Battle royale building game',
        isPopular: true,
        isHot: false,
        displayOrder: 4
    },
    {
        name: 'Apex Legends',
        title: 'Apex Legends',
        icon: '/uploads/games/apex.png',
        banner: '/uploads/games/apex.png',
        bgImage: '/uploads/bg/apex-bg.jpg',
        characterImage: '/uploads/characters/apex-char.png',
        category: 'Battle Royale',
        description: 'Battle royale with unique legends',
        isPopular: true,
        isHot: false,
        displayOrder: 5
    },
    {
        name: 'Overwatch 2',
        icon: '/uploads/games/overwatch2.png',
        banner: '/uploads/games/overwatch2.png',
        bgImage: '/uploads/bg/overwatch2-bg.jpg',
        characterImage: '/uploads/characters/overwatch2-char.png',
        category: 'FPS',
        description: 'Team-based hero shooter',
        isPopular: false,
        isHot: false,
        displayOrder: 6
    },
    {
        name: 'Dead by Daylight',
        icon: '/uploads/games/deadbydaylight.png',
        banner: '/uploads/games/deadbydaylight.png',
        bgImage: '/uploads/bg/deadbydaylight-bg.jpg',
        characterImage: '/uploads/characters/deadbydaylight-char.png',
        category: 'Horror',
        description: 'Asymmetric horror game',
        isPopular: false,
        isHot: false,
        displayOrder: 7
    },
    {
        name: 'Call of Duty',
        icon: '/uploads/games/callofduty.png',
        banner: '/uploads/games/callofduty.png',
        bgImage: '/uploads/bg/callofduty-bg.jpg',
        characterImage: '/uploads/characters/callofduty-char.png',
        category: 'FPS',
        description: 'First-person shooter franchise',
        isPopular: true,
        isHot: false,
        displayOrder: 8
    },
    {
        name: 'Destiny 2',
        icon: '/uploads/games/destiny2.png',
        banner: '/uploads/games/destiny2.png',
        bgImage: '/uploads/bg/destiny2-bg.jpg',
        characterImage: '/uploads/characters/destiny2-char.png',
        category: 'MMORPG',
        description: 'Online-only FPS RPG',
        isPopular: false,
        isHot: false,
        displayOrder: 9
    },
    {
        name: 'Rainbow Six Siege',
        icon: '/uploads/games/rainbow6.png',
        banner: '/uploads/games/rainbow6.png',
        bgImage: '/uploads/bg/rainbow6-bg.jpg',
        characterImage: '/uploads/characters/rainbow6-char.png',
        category: 'FPS',
        description: 'Tactical shooter',
        isPopular: true,
        isHot: false,
        displayOrder: 10
    },
    {
        name: 'Genshin Impact',
        icon: '/uploads/games/genshin.png',
        banner: '/uploads/games/genshin.png',
        bgImage: '/uploads/bg/genshin-bg.jpg',
        characterImage: '/uploads/characters/genshin-char.png',
        category: 'RPG',
        description: 'Open-world action RPG',
        isPopular: true,
        isHot: false,
        displayOrder: 11
    },
    {
        name: 'Escape from Tarkov',
        icon: '/uploads/games/tarkov.png',
        banner: '/uploads/games/tarkov.png',
        bgImage: '/uploads/bg/tarkov-bg.jpg',
        characterImage: '/uploads/characters/tarkov-char.png',
        category: 'FPS',
        description: 'Hardcore survival shooter',
        isPopular: false,
        isHot: false,
        displayOrder: 12
    },
    {
        name: 'Dota 2',
        icon: '/uploads/games/dota2.png',
        banner: '/uploads/games/dota2.png',
        bgImage: '/uploads/bg/dota2-bg.jpg',
        characterImage: '/uploads/characters/dota2-char.png',
        category: 'MOBA',
        description: 'MOBA esports game',
        isPopular: true,
        isHot: false,
        displayOrder: 13
    },
    {
        name: 'Minecraft',
        icon: '/uploads/games/minecraft.png',
        banner: '/uploads/games/minecraft.png',
        bgImage: '/uploads/bg/minecraft-bg.jpg',
        characterImage: '/uploads/characters/minecraft-char.png',
        category: 'Sandbox',
        description: 'Block-building survival game',
        isPopular: true,
        isHot: false,
        displayOrder: 14
    },
    {
        name: 'PUBG',
        icon: '/uploads/games/pubg.png',
        banner: '/uploads/games/pubg.png',
        bgImage: '/uploads/bg/pubg-bg.jpg',
        characterImage: '/uploads/characters/pubg-char.png',
        category: 'Battle Royale',
        description: 'Battle royale shooter',
        isPopular: false,
        isHot: false,
        displayOrder: 15
    },
    {
        name: 'GTA V',
        icon: '/uploads/games/gtav.png',
        banner: '/uploads/games/gtav.png',
        bgImage: '/uploads/bg/gtav-bg.jpg',
        characterImage: '/uploads/characters/gtav-char.png',
        category: 'Action',
        description: 'Open-world action game',
        isPopular: true,
        isHot: false,
        displayOrder: 16
    },
    {
        name: 'Warframe',
        icon: '/uploads/games/warframe.png',
        banner: '/uploads/games/warframe.png',
        bgImage: '/uploads/bg/warframe-bg.jpg',
        characterImage: '/uploads/characters/warframe-char.png',
        category: 'Action',
        description: 'Free-to-play action game',
        isPopular: false,
        isHot: false,
        displayOrder: 17
    },
    {
        name: 'Path of Exile',
        icon: '/uploads/games/pathofexile.png',
        banner: '/uploads/games/pathofexile.png',
        bgImage: '/uploads/bg/pathofexile-bg.jpg',
        characterImage: '/uploads/characters/pathofexile-char.png',
        category: 'RPG',
        description: 'Action RPG dungeon crawler',
        isPopular: false,
        isHot: false,
        displayOrder: 18
    },
    {
        name: 'Honkai: Star Rail',
        icon: '/uploads/games/honkai.png',
        banner: '/uploads/games/honkai.png',
        bgImage: '/uploads/bg/honkai-bg.jpg',
        characterImage: '/uploads/characters/honkai-char.png',
        category: 'RPG',
        description: 'Space fantasy RPG',
        isPopular: true,
        isHot: true,
        displayOrder: 19
    },
    {
        name: 'Lost Ark',
        icon: '/uploads/games/lostark.png',
        banner: '/uploads/games/lostark.png',
        bgImage: '/uploads/bg/lostark-bg.jpg',
        characterImage: '/uploads/characters/lostark-char.png',
        category: 'MMORPG',
        description: 'Korean action MMO',
        isPopular: false,
        isHot: false,
        displayOrder: 20
    },
    {
        name: 'Palworld',
        icon: '/uploads/games/palworld.png',
        banner: '/uploads/games/palworld.png',
        bgImage: '/uploads/bg/palworld-bg.jpg',
        characterImage: '/uploads/characters/palworld-char.png',
        category: 'Adventure',
        description: 'Monster collection survival',
        isPopular: true,
        isHot: false,
        displayOrder: 21
    },
    {
        name: 'Once Human',
        icon: '/uploads/games/oncehuman.png',
        banner: '/uploads/games/oncehuman.png',
        bgImage: '/uploads/bg/oncehuman-bg.jpg',
        characterImage: '/uploads/characters/oncehuman-char.png',
        category: 'Survival',
        description: 'Multiplayer survival horror',
        isPopular: false,
        isHot: false,
        displayOrder: 22
    },
    {
        name: 'The Finals',
        icon: '/uploads/games/thefinals.png',
        banner: '/uploads/games/thefinals.png',
        bgImage: '/uploads/bg/thefinals-bg.jpg',
        characterImage: '/uploads/characters/thefinals-char.png',
        category: 'FPS',
        description: 'Free-to-play arena shooter',
        isPopular: false,
        isHot: false,
        displayOrder: 23
    },
    {
        name: 'Helldivers 2',
        icon: '/uploads/games/helldivers2.png',
        banner: '/uploads/games/helldivers2.png',
        bgImage: '/uploads/bg/helldivers2-bg.jpg',
        characterImage: '/uploads/characters/helldivers2-char.png',
        category: 'Action',
        description: 'Co-op shooter',
        isPopular: true,
        isHot: false,
        displayOrder: 24
    },
    {
        name: 'Last Epoch',
        icon: '/uploads/games/lastepoch.png',
        banner: '/uploads/games/lastepoch.png',
        bgImage: '/uploads/bg/lastepoch-bg.jpg',
        characterImage: '/uploads/characters/lastepoch-char.png',
        category: 'RPG',
        description: 'ARPG dungeon crawler',
        isPopular: false,
        isHot: false,
        displayOrder: 25
    }
];

const seedGames = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Clear existing games
        await Game.deleteMany({});
        console.log('Cleared existing games');

        // Insert new games
        const createdGames = await Game.insertMany(games);
        console.log(`Created ${createdGames.length} games`);

        console.log('Seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding games:', error.message);
        process.exit(1);
    }
};

seedGames();
