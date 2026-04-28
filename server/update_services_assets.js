const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const Service = require('./models/Service');

const updateServices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg');
        console.log('MongoDB Connected...');

        const backgroundDir = path.join(__dirname, 'uploads', 'services', 'background');
        const iconDir = path.join(__dirname, 'uploads', 'services', 'icon');

        const backgrounds = fs.readdirSync(backgroundDir).filter(file => fs.statSync(path.join(backgroundDir, file)).isFile());
        const icons = fs.readdirSync(iconDir).filter(file => fs.statSync(path.join(iconDir, file)).isFile());

        if (backgrounds.length === 0 || icons.length === 0) {
            console.error('No background images or icons found in the specified directories.');
            process.exit(1);
        }

        // Find services where backgroundImage OR icon is missing, null, empty string, or default placeholder
        const servicesToUpdate = await Service.find({
            $or: [
                { backgroundImage: { $in: ['', null, 'default-bg.jpg'] } },
                { icon: { $in: ['', null, 'default-icon.png'] } },
                { backgroundImage: { $exists: false } },
                { icon: { $exists: false } }
            ]
        });

        console.log(`Found ${servicesToUpdate.length} services to update.`);

        for (let i = 0; i < servicesToUpdate.length; i++) {
            const service = servicesToUpdate[i];
            const updates = {};

            // Update if empty, null, or common placeholder strings
            if (!service.backgroundImage || service.backgroundImage === '' || service.backgroundImage.includes('default')) {
                const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
                updates.backgroundImage = `/uploads/services/background/${randomBg}`;
            }

            if (!service.icon || service.icon === '' || service.icon.includes('default')) {
                const randomIcon = icons[Math.floor(Math.random() * icons.length)];
                updates.icon = `/uploads/services/icon/${randomIcon}`;
            }

            if (Object.keys(updates).length > 0) {
                await Service.findByIdAndUpdate(service._id, updates);
                console.log(`Updated service: ${service.title}`);
            }
        }

        console.log('Service update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating services:', err);
        process.exit(1);
    }
};

updateServices();
