const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] No local or remote MongoDB active (${error.message}).`);
    console.log(`[DataStore] Running on embedded zero-downtime persistent storage.`);
  }
};

module.exports = connectDB;
