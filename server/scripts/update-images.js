const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Game = require('../models/Game');
dotenv.config();

const gameDefinitions = [
    { name: 'Apex Legends', slug: 'apex-legends', asset: 'apex' },
    { name: 'Call of Duty', slug: 'call-of-duty', asset: 'callofduty' },
    { name: 'Counter-Strike 2', slug: 'counter-strike-2', asset: 'cs2' },
    { name: 'Dead by Daylight', slug: 'dead-by-daylight', asset: 'deadbydaylight' },
    { name: 'Destiny 2', slug: 'destiny-2', asset: 'destiny2' },
    { name: 'Dota 2', slug: 'dota-2', asset: 'dota2' },
    { name: 'Fortnite', slug: 'fortnite', asset: 'fortnite' },
    { name: 'Genshin Impact', slug: 'genshin-impact', asset: 'genshin' },
    { name: 'GTA V', slug: 'gta-v', asset: 'gtav' },
    { name: 'Helldivers 2', slug: 'helldivers-2', asset: 'helldivers2' },
    { name: 'Honkai: Star Rail', slug: 'honkai-star-rail', asset: 'honkai' },
    { name: 'Last Epoch', slug: 'last-epoch', asset: 'lastepoch' },
    { name: 'League of Legends', slug: 'league-of-legends', asset: 'lol' },
    { name: 'Lost Ark', slug: 'lost-ark', asset: 'lostark' },
    { name: 'Minecraft', slug: 'minecraft', asset: 'minecraft' },
    { name: 'Once Human', slug: 'once-human', asset: 'oncehuman' },
    { name: 'Overwatch 2', slug: 'overwatch-2', asset: 'overwatch2' },
    { name: 'Palworld', slug: 'palworld', asset: 'palworld' },
    { name: 'Path of Exile', slug: 'path-of-exile', asset: 'pathofexile' },
    { name: 'PUBG', slug: 'pubg', asset: 'pubg' },
    { name: 'Rainbow Six Siege', slug: 'rainbow-six-siege', asset: 'rainbow6' },
    { name: 'Escape from Tarkov', slug: 'escape-from-tarkov', asset: 'tarkov' },
    { name: 'The Finals', slug: 'the-finals', asset: 'thefinals' },
    { name: 'Valorant', slug: 'valorant', asset: 'valorant' },
    { name: 'Warframe', slug: 'warframe', asset: 'warframe' },
    { name: 'World of Warcraft', slug: 'world-of-warcraft', asset: 'wow', isCustom: true },
    { name: 'FC 24', slug: 'fc-24', asset: 'fc24', isCustom: true }
];

async function updateGames() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg');
        console.log('Connected to DB');
        for (const g of gameDefinitions) {
            let game = await Game.findOne({ name: g.name });
            if (game) {
                game.icon = g.isCustom && g.name === 'World of Warcraft' ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070' : `/uploads/games/${g.asset}.png`;
                game.banner = g.isCustom && g.name === 'World of Warcraft' ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070' : `/uploads/games/${g.asset}.png`;
                game.bgImage = g.isCustom && g.name === 'World of Warcraft' ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070' : `/uploads/bg/${g.asset}-bg.jpg`;
                game.characterImage = g.isCustom && g.name === 'World of Warcraft' ? 'https://skycoach.gg/storage/uploads/games/wow/banner_char.png' : `/uploads/characters/${g.asset}-char.png`;

                // Handle FC24 fallback explicitly 
                if (g.name === 'FC 24') {
                    game.icon = `/uploads/games/fifa.png`;
                    game.banner = `/uploads/games/fifa.png`;
                    game.bgImage = `/uploads/bg/fifa-bg.jpg`;
                    game.characterImage = `/uploads/characters/fifa-char.png`;
                }

                await game.save();
                console.log(`Updated images for ${g.name}`);
            }
        }
        console.log('Done mapping images to existing games!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
updateGames();
