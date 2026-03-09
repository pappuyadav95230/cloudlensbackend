import mongoose from 'mongoose';

export const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('[database]: MONGODB_URI is not defined in environment variables');
        process.exit(1);
    }

    // Retry connection up to 5 times
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const conn = await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 10000,
            });
            console.log(`[database]: MongoDB Atlas Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            console.error(`[database]: Connection attempt ${attempt}/${maxRetries} failed: ${(error as Error).message}`);
            if (attempt < maxRetries) {
                console.log(`[database]: Retrying in 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    console.error('[database]: All connection attempts failed. Server will run without database.');
};
