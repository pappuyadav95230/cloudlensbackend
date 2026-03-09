const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI not found in .env');
        return;
    }

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB Atlas.');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nCollections in "cloudlens" database:');
        collections.forEach(c => console.log(`  - ${c.name}`));

        if (collections.find(c => c.name === 'users')) {
            console.log('\n✅ "users" collection EXISTS.');
        } else {
            console.log('\n⚠️  "users" collection does NOT exist yet.');
            console.log('It will be created automatically when the first user logs in and syncs.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Connection error:', err.message);
    }
}

run();
