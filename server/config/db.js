const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongodInstance = null;

async function connectDB() {
  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      console.log(`[DB] Attempting connection to custom MongoDB URI...`);
      await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`[DB] Successfully connected to custom MongoDB.`);
      return;
    } catch (err) {
      console.warn(`[DB] Custom MongoDB connection failed (${err.message}). Falling back to embedded MongoMemoryServer...`);
    }
  }

  try {
    console.log(`[DB] Starting embedded MongoMemoryServer for reliable standalone operation...`);
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    console.log(`[DB] Connected to embedded MongoDB at ${uri}`);
  } catch (err) {
    console.error(`[DB] Fatal: Failed to initialize MongoDB:`, err);
    throw err;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

module.exports = { connectDB, disconnectDB };
