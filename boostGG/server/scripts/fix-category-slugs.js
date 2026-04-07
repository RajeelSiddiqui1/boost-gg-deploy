const mongoose = require('mongoose');

async function fixCategorySlugs() {
    try {
        const mongoUri = 'mongodb://localhost:27017/boostgg';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Define models dynamically to avoid import issues in script
        const Category = mongoose.model('Category', new mongoose.Schema({
            slug: String
        }, { strict: false }));

        const Service = mongoose.model('Service', new mongoose.Schema({
            categoryId: mongoose.Schema.Types.ObjectId,
            categorySlug: String
        }, { strict: false }));

        const services = await Service.find({});
        console.log(`Auditing ${services.length} services...`);

        let updatedCount = 0;

        for (const service of services) {
            if (!service.categoryId) continue;

            const category = await Category.findById(service.categoryId);
            if (!category) {
                console.log(`Warning: Category not found for service ${service._id} (${service.title})`);
                continue;
            }

            if (service.categorySlug !== category.slug) {
                console.log(`Updating service: "${service.title}"`);
                console.log(`  Old Slug: ${service.categorySlug}`);
                console.log(`  New Slug: ${category.slug}`);

                service.categorySlug = category.slug;
                await Service.updateOne({ _id: service._id }, { $set: { categorySlug: category.slug } });
                updatedCount++;
            }
        }

        console.log(`Done! Updated ${updatedCount} services.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

fixCategorySlugs();
