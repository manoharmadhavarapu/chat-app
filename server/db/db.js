const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`Successfully connected to mongoDB`)
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
} 

module.exports = connectDB;