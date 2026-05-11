const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notification = require('./models/Notification');
const User = require('./models/User');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boostgg');
        console.log('Connected to DB:', process.env.MONGODB_URI || 'default');

        const user = await User.findById('69f3ba25fd66d831ee5e06be'); 
        if (!user) {
            console.log('User 69f3ba... not found');
            const allUsers = await User.find().limit(5);
            console.log('Sample Users:', allUsers.map(u => ({ id: u._id, email: u.email })));
            process.exit(0);
        }

        console.log('Testing for user:', { id: user._id, email: user.email });

        const notifications = await Notification.find({ userId: user._id });
        console.log(`Found ${notifications.length} notifications for this user.`);
        
        if (notifications.length > 0) {
            console.log('Sample Notification:', notifications[0]);
        } else {
            console.log('Checking all notifications in DB...');
            const allNotifs = await Notification.find().limit(10);
            console.log('Sample Notifications in DB:', allNotifs.map(n => ({ id: n._id, userId: n.userId, title: n.title })));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
