const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('./models/Service');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg');
    const service = await Service.findOne({ "sidebarSections.0": { $exists: true } }).sort({ createdAt: -1 });
    if(service) {
      console.log('Service Title:', service.title);
      console.log('Sidebar sections length:', service.sidebarSections?.length);
      console.log(JSON.stringify(service.sidebarSections, null, 2));
    } else {
      console.log('No service found');
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
