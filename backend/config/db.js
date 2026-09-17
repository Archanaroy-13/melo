const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/melo';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`\n======================================================`);
    console.error(`[MongoDB Error] MongoDB connection unavailable.`);
    console.error(`Configure MONGODB_URI in .env or start local MongoDB instance.`);
    console.error(`Error details: ${error.message}`);
    console.error(`======================================================\n`);
    return false;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
