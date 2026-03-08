import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(uri);
        console.log(`[database]: MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[database]: Error connecting to MongoDB: ${(error as Error).message}`);
        process.exit(1);
    }
};
