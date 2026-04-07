require('dotenv').config();
const mongoose = require('mongoose');

async function fixPrices() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg');
    console.log('Connected.');

    const result = await mongoose.connection.db.collection('services').find({
        'pricing.basePrice': { $gt: 0 }
    }).toArray();

    let updated = 0;
    for (const svc of result) {
        const basePrice = svc.pricing?.basePrice || 0;
        const discount = svc.pricing?.discountPercent || 0;
        const price = Math.round(basePrice * (1 - discount / 100) * 100) / 100;
        await mongoose.connection.db.collection('services').updateOne(
            { _id: svc._id },
            { $set: { price } }
        );
        updated++;
    }

    console.log(`Updated price for ${updated} services.`);
    process.exit(0);
}
fixPrices().catch(err => { console.error(err); process.exit(1); });
