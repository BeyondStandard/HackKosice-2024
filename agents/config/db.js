const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true, // Added option for unified topology
      useCreateIndex: true, // Added option for creating indexes
      useFindAndModify: false // Added option to disable findAndModify
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error); // Log the full error message and trace
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;