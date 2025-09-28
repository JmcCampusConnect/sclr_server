const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB has been connected succesfully')
    } catch (error) {
        console.error('Error in connecting MongoDB : ', error.message);
        process.exit(1);
    }
}

module.exports = connectDB;