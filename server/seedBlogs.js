const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('./models/Blog');
const connectDB = require('./config/db');

dotenv.config();

const blogs = [
    {
        title: "The Ultimate Guide to WoW Gold Farming in 2026",
        slug: "ultimate-wow-gold-farming-guide-2026",
        shortDescription: "Learn the most efficient ways to farm gold in World of Warcraft with our comprehensive guide for 2026.",
        content: "<h1>World of Warcraft Gold Farming</h1><p>Gold is the lifeblood of Azeroth. Whether you're looking to buy the latest mounts or gear up for the next raid, having a steady flow of gold is essential.</p><h2>Top Farming Spots</h2><p>In the latest expansion, several new zones have become gold mines for dedicated farmers...</p>",
        category: "World of Warcraft",
        author: "BoostGG Team",
        image: "/uploads/blogs/wow-gold-farming.png",
        isFeatured: true,
        status: "published",
        views: 1250
    },
    {
        title: "How to Improve Your Aim in Valorant",
        slug: "improve-valorant-aim-guide",
        shortDescription: "Master the art of precision with these pro tips and training routines for Valorant.",
        content: "<h1>Valorant Aim Guide</h1><p>Aiming in Valorant is about more than just clicking heads. It's about crosshair placement, movement, and game sense.</p><h2>Training Routines</h2><p>We recommend spending at least 30 minutes in the practice range daily...</p>",
        category: "Valorant",
        author: "Radiant Pro",
        image: "/uploads/blogs/valorant-aim-guide.png",
        isFeatured: false,
        status: "published",
        views: 840
    },
    {
        title: "League of Legends: Top 5 Mid Laners for Season 16",
        slug: "lol-top-mid-laners-season-16",
        shortDescription: "Dominate the rift with the most powerful mid lane champions in the current meta.",
        content: "<h1>League of Legends Meta Update</h1><p>Season 16 has brought significant changes to the mid lane. Here are the top 5 champions you should be playing right now...</p>",
        category: "League of Legends",
        author: "Challenger Coach",
        image: "/uploads/blogs/lol-mid-laners.png",
        isFeatured: true,
        status: "published",
        views: 2100
    },
    {
        title: "CS2: New Map Strategies for Competitive Play",
        slug: "cs2-new-map-strategies",
        shortDescription: "Unlock the secrets of the newest CS2 maps with our expert tactical analysis.",
        content: "<h1>CS2 Tactical Guide</h1><p>With the introduction of new maps to the competitive pool, players need to adapt their strategies quickly.</p><h2>Execute Patterns</h2><p>Let's look at the A-site execute on the newest map...</p>",
        category: "Counter-Strike 2",
        author: "Global Elite",
        image: "/uploads/blogs/cs2-strategies.png",
        isFeatured: false,
        status: "published",
        views: 620
    },
    {
        title: "Destiny 2: Final Shape Complete Walkthrough",
        slug: "destiny-2-final-shape-walkthrough",
        shortDescription: "Step-by-step guide to conquering the latest Destiny 2 expansion and its challenging raids.",
        content: "<h1>Destiny 2: The Final Shape</h1><p>The journey has come to its epic conclusion. Here is how you can navigate the complex missions and defeat the Witness.</p>",
        category: "Destiny 2",
        author: "Guardian Master",
        image: "/uploads/blogs/destiny2-walkthrough.png",
        isFeatured: true,
        status: "published",
        views: 3500
    },
    {
        title: "Elden Ring: Shadow of the Erdtree Essential Tips",
        slug: "elden-ring-shadow-erdtree-tips",
        shortDescription: "Survival tips for the most difficult expansion in FromSoftware history.",
        content: "<h1>Elden Ring Expansion Guide</h1><p>Shadow of the Erdtree is no joke. Even veteran Tarnished will find themselves struggling against the new bosses.</p>",
        category: "Elden Ring",
        author: "BoostGG Team",
        image: "/uploads/blogs/elden-ring-tips.png",
        isFeatured: false,
        status: "published",
        views: 1800
    },
    {
        title: "Apex Legends: Seasonal Meta and Tier List",
        slug: "apex-legends-meta-tier-list",
        shortDescription: "Stay ahead of the competition with our comprehensive Apex Legends legend tier list.",
        content: "<h1>Apex Legends Meta</h1><p>Which legends are top-tier this season? We've analyzed the pick rates and win rates to bring you the definitive list.</p>",
        category: "Apex Legends",
        author: "Predator Player",
        image: "/uploads/blogs/apex-meta.png",
        isFeatured: false,
        status: "published",
        views: 950
    },
    {
        title: "Tarkov: Beginner's Guide to Extraction",
        slug: "tarkov-beginners-extraction-guide",
        shortDescription: "Don't lose your gear. Learn the maps and extraction points in Escape from Tarkov.",
        content: "<h1>Tarkov Survival Guide</h1><p>Escape from Tarkov is notoriously unforgiving for new players. The first step to success is knowing how to get out alive.</p>",
        category: "Escape from Tarkov",
        author: "Sherpa Guide",
        image: "/uploads/blogs/tarkov-guide.png",
        isFeatured: true,
        status: "published",
        views: 1100
    },
    {
        title: "Dota 2: Mastering the Art of Supporting",
        slug: "dota-2-mastering-support-role",
        shortDescription: "Carry your team from the support position with these advanced warding and rotation tips.",
        content: "<h1>Dota 2 Support Guide</h1><p>Playing support is more than just buying wards. It's about tempo, vision control, and enabling your carries.</p>",
        category: "Dota 2",
        author: "Immortal Coach",
        image: "/uploads/blogs/dota2-support.png",
        isFeatured: false,
        status: "published",
        views: 730
    },
    {
        title: "Overwatch 2: Meta Team Compositions for Ranked",
        slug: "overwatch-2-meta-team-compositions",
        shortDescription: "Find out which hero combinations are currently dominating the Overwatch 2 competitive ladder.",
        content: "<h1>Overwatch 2 Team Guide</h1><p>Synergy is everything in Overwatch 2. Here are the strongest team compositions for the current patch.</p>",
        category: "Overwatch 2",
        author: "Grandmaster Player",
        image: "/uploads/blogs/overwatch2-team.png",
        isFeatured: false,
        status: "published",
        views: 890
    },
    {
        title: "The Best Gaming Setup 2026: A Full Guide",
        slug: "best-gaming-setup-2026-guide",
        shortDescription: "Building a new PC? Here is our curated list of components for the ultimate gaming rig in 2026.",
        content: "<h1>Ultimate Gaming Setup</h1><p>Technology moves fast. What was top-tier last year is now mid-range. We've tested the latest CPUs and GPUs to bring you this guide.</p>",
        category: "Hardware",
        author: "Tech Guru",
        image: "/uploads/blogs/gaming-setup-2026.png",
        isFeatured: false,
        status: "published",
        views: 4200
    },
    {
        title: "Choosing the Best Gaming Mouse for Pro Play",
        slug: "best-gaming-mouse-pro-play",
        shortDescription: "Weight, sensor, and shape matter. We compare the top 10 gaming mice used by pros.",
        content: "<h1>Gaming Mouse Comparison</h1><p>In the world of competitive gaming, your peripheral choice can be the difference between winning and losing.</p>",
        category: "Hardware",
        author: "Tech Guru",
        image: "/uploads/blogs/best-gaming-mouse.png",
        isFeatured: false,
        status: "published",
        views: 1500
    },
    {
        title: "FFXIV: Ultimate Raiding Guide for Beginners",
        slug: "ffxiv-ultimate-raiding-guide",
        shortDescription: "New to raiding in Final Fantasy XIV? Here is everything you need to know to get started.",
        content: "<h1>FFXIV Raiding Guide</h1><p>Raiding is the pinnacle of FFXIV content. It requires teamwork, strategy, and a deep understanding of your job.</p>",
        category: "FFXIV",
        author: "Raid Lead",
        image: "/uploads/blogs/ffxiv-raiding-guide.png",
        isFeatured: true,
        status: "published",
        views: 2200
    },
    {
        title: "Hearthstone: Best Decks for the Current Expansion",
        slug: "hearthstone-best-decks-expansion",
        shortDescription: "Climb the ladder with these top-performing Hearthstone decks for the latest expansion.",
        content: "<h1>Hearthstone Meta</h1><p>The meta has shifted. Aggro is back, but control still holds its own. Here are the deck codes you need.</p>",
        category: "Hearthstone",
        author: "Pro Player",
        image: "/uploads/blogs/hearthstone-decks.png",
        isFeatured: false,
        status: "published",
        views: 1300
    },
    {
        title: "Fortnite: Advanced Building Techniques 2026",
        slug: "fortnite-advanced-building-techniques",
        shortDescription: "Stay ahead of the competition with these advanced building and editing tips for Fortnite.",
        content: "<h1>Fortnite Building Guide</h1><p>Building is what sets Fortnite apart. To stay competitive, you need to master the latest techniques.</p>",
        category: "Fortnite",
        author: "Builder Pro",
        image: "/uploads/blogs/fortnite-building.png",
        isFeatured: false,
        status: "published",
        views: 1900
    },
    {
        title: "Minecraft: Top 10 Must-Have Mods for 2026",
        slug: "minecraft-top-10-mods-2026",
        shortDescription: "Enhance your Minecraft experience with these essential mods for graphics, performance, and gameplay.",
        content: "<h1>Minecraft Mod Guide</h1><p>Mods are the lifeblood of the Minecraft community. Here are our top picks for 2026.</p>",
        category: "Minecraft",
        author: "Mod Master",
        image: "/uploads/blogs/minecraft-mods.png",
        isFeatured: false,
        status: "published",
        views: 5600
    },
    {
        title: "Cyberpunk 2077: Best Netrunner Builds",
        slug: "cyberpunk-2077-best-netrunner-builds",
        shortDescription: "Hack your way through Night City with these powerful Netrunner builds.",
        content: "<h1>Cyberpunk Build Guide</h1><p>Netrunning is one of the most fun ways to play Cyberpunk 2077. Here is how to optimize your stats and cyberware.</p>",
        category: "Cyberpunk 2077",
        author: "Netrunner",
        image: "/uploads/blogs/cyberpunk-builds.png",
        isFeatured: false,
        status: "published",
        views: 2400
    },
    {
        title: "Halo Infinite: Pro Tips for Ranked Arena",
        slug: "halo-infinite-pro-tips-ranked",
        shortDescription: "Climb the ranks in Halo Infinite with these expert tips for map control and team play.",
        content: "<h1>Halo Infinite Guide</h1><p>Halo is about map control and power weapon management. Here is how you can improve your rank.</p>",
        category: "Halo Infinite",
        author: "Spartan",
        image: "/uploads/blogs/halo-infinite-tips.png",
        isFeatured: false,
        status: "published",
        views: 1100
    },
    {
        title: "StarCraft 2: Mastering the Early Game Tactics",
        slug: "starcraft-2-mastering-early-game",
        shortDescription: "Learn the essential build orders and early game tactics for all three StarCraft 2 races.",
        content: "<h1>StarCraft 2 Strategy</h1><p>The first few minutes of a StarCraft 2 match are crucial. Here is how to optimize your opening.</p>",
        category: "StarCraft 2",
        author: "Grandmaster",
        image: "/uploads/blogs/starcraft2-tactics.png",
        isFeatured: false,
        status: "published",
        views: 980
    },
    {
        title: "League of Legends: Jungle Pathing Masterclass",
        slug: "lol-jungle-pathing-masterclass",
        shortDescription: "Optimize your jungle clear and gank paths with our expert masterclass for Season 16.",
        content: "<h1>LoL Jungle Guide</h1><p>Jungle pathing is an art. It's about predicting the enemy and being in the right place at the right time.</p>",
        category: "League of Legends",
        author: "Challenger Jungle",
        image: "/uploads/blogs/league-of-legends-jungle.png",
        isFeatured: true,
        status: "published",
        views: 2800
    }
];

const seedDB = async () => {
    try {
        await connectDB();
        
        console.log('Clearing existing blogs...');
        await Blog.deleteMany({});
        
        console.log('Inserting new blogs...');
        await Blog.insertMany(blogs);
        
        console.log(`Successfully seeded ${blogs.length} blogs!`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
