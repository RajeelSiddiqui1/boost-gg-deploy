require('dotenv').config();
const mongoose = require('mongoose');
const Deal = require('../server/models/Deal');
const Service = require('../server/models/Service');

const deals = [
    { title: 'Flash Deals', slug: 'flash-deals' },
    { title: 'Best Sellers', slug: 'best-sellers' },
    { title: 'Winter Sale', slug: 'winter-sale' },
    { title: 'Hot Offers', slug: 'hot-offers' },
    { title: 'Limited Time', slug: 'limited-time' },
    { title: 'Daily Deals', slug: 'daily-deals' },
    { title: 'Top Rated', slug: 'top-rated' },
    { title: 'New Arrival', slug: 'new-arrival' },
    { title: 'Pro Picks', slug: 'pro-picks' },
    { title: 'Bundle & Save', slug: 'bundle-save' }
];

const seedDealsAndAssignToServices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg');
        console.log('Connected to MongoDB');

        // 1. Create Deals
        console.log('Cleaning existing deals...');
        await Deal.deleteMany({});
        
        console.log('Seeding 10 deals...');
        const createdDeals = await Deal.insertMany(deals);
        console.log(`Created ${createdDeals.length} deals`);

        // 2. Fetch Services
        const services = await Service.find({});
        console.log(`Found ${services.length} services to update`);

        // 3. Randomly assign deals to services
        for (const service of services) {
            // Assign a deal to ~70% of services randomly
            if (Math.random() > 0.3) {
                const randomDeal = createdDeals[Math.floor(Math.random() * createdDeals.length)];
                service.dealId = randomDeal._id;
                service.dealSlug = randomDeal.slug;
                await service.save();
                console.log(`Updated service: ${service.title} -> Deal: ${randomDeal.title}`);
            }
        }

        console.log('Seeding and assignment complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

seedDealsAndAssignToServices();
