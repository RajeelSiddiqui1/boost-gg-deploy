const mongoose = require('mongoose');
require('dotenv').config({ path: '../server/.env' });
const Service = require('../server/models/Service');

async function updateServiceForRange() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg');
        console.log('Connected to MongoDB');

        // Find a currency/gold service or the first active service
        let service = await Service.findOne({ 
            $or: [{ serviceType: 'currency' }, { serviceType: 'gold' }, { categorySlug: 'gold' }] 
        });

        if (!service) {
            service = await Service.findOne({ isActive: true });
        }

        if (!service) {
            console.log('No services found to update');
            process.exit(0);
        }

        console.log(`Updating service: ${service.title} (${service._id})`);

        // Add a range slider section
        const rangeSection = {
            id: 'amount_slider',
            heading: 'Select Amount',
            fieldType: 'range',
            displayOrder: 1,
            stepperConfig: {
                min: 100,
                max: 5000,
                default: 500,
                unitLabel: 'k',
                pricePerUnit: 0.01 // $0.01 per 1k -> 100k = $1
            }
        };

        // Remove existing stepper if any with same id or similar heading
        service.sidebarSections = service.sidebarSections.filter(s => s.id !== 'amount_slider' && s.heading !== 'Select Amount');
        service.sidebarSections.push(rangeSection);

        await service.save();
        console.log('Service updated successfully with range slider!');
        console.log(`Check it at: http://localhost:5173/products/${service.slug || service._id}`);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

updateServiceForRange();
