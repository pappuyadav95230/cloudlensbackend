const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const checkCollections = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI not found');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB.');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log('Collections in database:');
        collectionNames.forEach(name => console.log(`- ${name}`));

        if (collectionNames.includes('users')) {
            console.log('\nSUCCESS: "users" collection exists.');
        } else {
            console.log('\nWARNING: "users" collection does NOT exist.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkCollections();
