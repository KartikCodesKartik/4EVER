import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Set up the connection event listener
        mongoose.connection.on('connected', () => {
            console.log('Connected to MongoDB');
        });

        // Attempt to connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

    } catch (error) {
        // Handle connection errors
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with a failure code if connection fails
    }
};

export default connectDB;
