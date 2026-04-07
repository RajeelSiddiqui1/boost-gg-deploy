require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');

const blogs = [
    {
        title: 'How to Rank Up Fast in Valorant: Pro Tips & Tricks',
        slug: 'how-to-rank-up-fast-valorant',
        category: 'Valorant',
        author: 'BoostGG Team',
        shortDescription: 'Master the fundamentals and climb the ranks faster with these expert-approved strategies used by professional Valorant players.',
        content: `<h2>Introduction</h2><p>Climbing the ranks in Valorant requires much more than just good aim. It demands game sense, communication, and consistent practice. In this guide, we break down the most effective strategies to help you rank up efficiently.</p><h2>1. Master Your Agent</h2><p>Pick 1-2 agents and master them thoroughly. Focus on understanding their abilities and how they synergize with common team compositions.</p><h2>2. Focus on Your Crosshair Placement</h2><p>Good crosshair placement wins gunfights before they even start. Always pre-aim common spots at head level to minimize the adjustments needed when an enemy appears.</p><h2>3. Use Your Minimap</h2><p>The minimap is one of the most underutilized tools. Check it regularly and use the information to rotate correctly and avoid getting caught off-guard.</p><h2>4. Communication Wins Games</h2><p>Call out enemy positions, count abilities, and coordinate pushes. Even basic callouts dramatically improve team coordination.</p>`,
        image: '/uploads/blogs/valorant-guide.jpg',
        status: 'published',
        isFeatured: true,
        views: 1247
    },
    {
        title: 'League of Legends Season 2024: Complete Tier List & Meta Guide',
        slug: 'lol-season-2024-tier-list-meta-guide',
        category: 'League of Legends',
        author: 'BoostGG Team',
        shortDescription: 'Everything you need to know about the current League of Legends meta, the best champions, and optimal rune choices for each role.',
        content: `<h2>The Current Meta</h2><p>Season 2024 has brought significant changes to the League of Legends meta with the complete item system overhaul. Understanding the current state of the game is crucial to climbing the ladder.</p><h2>Top Lane</h2><p>Tanks and bruisers dominate the top lane this patch. Champions like Malphite, Camille, and Garen are all strong picks with high carry potential.</p><h2>Jungle</h2><p>Fast-clearing junglers with strong gank threat are favored in the current meta. Vi, Hecarim, and Amumu lead the pack as A+ tier picks.</p><h2>Mid Lane</h2><p>Control mages and assassins both have their place in mid. Orianna and Syndra are reliable safe picks, while Zed and Katarina thrive in solo queue.</p>`,
        image: '/uploads/blogs/lol-guide.jpg',
        status: 'published',
        isFeatured: true,
        views: 2341
    },
    {
        title: 'Counter-Strike 2: Ultimate Premier Rating Guide',
        slug: 'cs2-premier-rating-complete-guide',
        category: 'Counter-Strike 2',
        author: 'BoostGG Team',
        shortDescription: 'Learn how to master CS2\'s Premier Rating system, improve your skills, and achieve consistent wins in competitive matchmaking.',
        content: `<h2>Understanding Premier Mode</h2><p>CS2's Premier mode uses a MMR-based rating system rather than the old rank emblems. Your rating goes from 0 to 35,000+ and determines your skill bracket.</p><h2>Economy Management</h2><p>Knowing when to save, force-buy, or full-buy is one of the most critical skills in CS2. A disciplined economy leads to more consistent round wins.</p><h2>Utility Usage</h2><p>Grenades win rounds. Learn at least 5-10 key smokes, flashes, and Molotovs for each map in the pool. Utility usage separates average players from great ones.</p><h2>Map Pool</h2><p>Focus on mastering 2-3 maps rather than trying to play all maps equally. Deep knowledge of fewer maps is more valuable than surface knowledge of many.</p>`,
        image: '/uploads/blogs/cs2-guide.jpg',
        status: 'published',
        isFeatured: true,
        views: 1892
    },
    {
        title: 'Genshin Impact: Spiral Abyss Floor 12 Complete Walkthrough',
        slug: 'genshin-impact-spiral-abyss-floor-12',
        category: 'Genshin Impact',
        author: 'BoostGG Team',
        shortDescription: 'Step-by-step guide to clearing Spiral Abyss Floor 12 and earning 9 stars with the best team compositions and element reactions.',
        content: `<h2>Team Compositions</h2><p>Floor 12 requires two well-built teams. The most reliable setup is a Freeze team for one side and a Vaporize or Hyperbloom team for the other.</p><h2>First Half: Freeze Team</h2><p>Use Ayaka + Kazuha + Kokomi + Rosaria for the first half. This team provides consistent freeze uptime and excellent AoE damage for the grouped enemies.</p><h2>Second Half: Hyperbloom</h2><p>Nahida + Raiden + Yelan + Kokomi creates a powerful Hyperbloom reaction machine. The high bloom trigger rate melts through the final boss quickly.</p><h2>Artifact Recommendations</h2><p>Focus on Crit Rate/Damage ratio first. Aim for at least 1:2 ratio. Energy Recharge requirements should be met before focusing on offensive stats.</p>`,
        image: '/uploads/blogs/genshin-guide.jpg',
        status: 'published',
        isFeatured: false,
        views: 987
    },
    {
        title: 'Apex Legends: How to Master Movement and Win More Games',
        slug: 'apex-legends-movement-guide',
        category: 'Apex Legends',
        author: 'BoostGG Team',
        shortDescription: 'Comprehensive guide to Apex Legends movement mechanics including bunny hopping, slide jumps, and advanced positioning techniques.',
        content: `<h2>The Importance of Movement</h2><p>Apex Legends has one of the most complex and rewarding movement systems in any battle royale. Mastering movement gives you a massive advantage in gunfights and positioning.</p><h2>Slide Jumps</h2><p>The slide jump is the foundation of Apex movement. Sprint, crouch to slide, then jump at the end of the slide for extra speed and distance. This maintains momentum better than normal sprinting.</p><h2>Bunny Hopping</h2><p>Chaining slide jumps together creates bunny hopping. This maintains high speed while making you a harder target. It requires practice but becomes natural with time.</p><h2>Legend Selection</h2><p>Movement legends like Octane, Pathfinder, and Horizon have major advantages. Their abilities provide escape tools and repositioning options that other legends lack.</p>`,
        image: '/uploads/blogs/apex-guide.jpg',
        status: 'published',
        isFeatured: false,
        views: 756
    },
    {
        title: 'World of Warcraft: Mythic+ Dungeon Beginner\'s Guide',
        slug: 'wow-mythic-plus-beginners-guide',
        category: 'World of Warcraft',
        author: 'BoostGG Team',
        shortDescription: 'Everything you need to know to start your Mythic+ journey in WoW, from key mechanics to optimal routes and seasonal affixes.',
        content: `<h2>What is Mythic+?</h2><p>Mythic+ is WoW's endgame dungeon system where you run dungeons at increasing difficulty levels (called keys) with modifiers called Affixes that change gameplay rules.</p><h2>Getting Your First Key</h2><p>Completing a Mythic 0 dungeon will give every player in the group a random Mythic+ keystone. This allows you to start the Mythic+ progression ladder.</p><h2>Understanding Affixes</h2><p>Affixes are modifiers that change how dungeons work. Common ones include Fortified (stronger trash), Tyrannical (stronger bosses), and Sanguine (enemies heal when grouped). Always check the weekly affixes before running keys.</p><h2>Key Priority</h2><p>Focus on completing your key in time rather than just finishing it. Timed completions give you better loot and upgrade your keystone to a higher level.</p>`,
        image: '/uploads/blogs/wow-guide.jpg',
        status: 'published',
        isFeatured: true,
        views: 1543
    }
];

async function seedBlogs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg');
        console.log('Connected to MongoDB...');

        // Clear existing blogs
        await Blog.deleteMany({});
        console.log('Cleared existing blogs.');

        // Insert new blogs
        const created = await Blog.insertMany(blogs);
        console.log(`Inserted ${created.length} blog posts successfully!`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding blogs:', err.message);
        process.exit(1);
    }
}

seedBlogs();
