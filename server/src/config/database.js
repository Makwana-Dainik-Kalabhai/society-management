const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    // Attempt local/configured mongo connection with short serverSelectionTimeoutMS
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}`);

    // Check if database needs initial seeding
    const Society = require('../models/Society');
    const count = await Society.countDocuments();
    if (count === 0) {
      console.log('🌱 Database is empty. Seeding initial test data...');
      const { seedData } = require('./seed');
      await seedData();
    }
  } catch (error) {
    console.warn(`⚠️ Could not connect to configured MongoDB (${error.message}).`);
    console.log('🔄 Initializing in-memory MongoDB fallback engine (Zero-Config Mode)...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();

      await mongoose.connect(memoryUri);
      console.log(`✅ Connected to In-Memory MongoDB at ${memoryUri}`);

      // Auto-seed in-memory DB
      const { seedData } = require('./seed');
      await seedData();
    } catch (memErr) {
      console.error('❌ Failed to initialize in-memory database:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
