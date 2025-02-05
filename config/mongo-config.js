require('dotenv').config(); 
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI;

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = connectDB;
