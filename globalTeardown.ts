// globalTeardown.ts
import mongoose from 'mongoose';
import { ENV } from './src/config/env';

export default async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB connection not active, attempting to reconnect...');
      await mongoose.connect(ENV.mongoURI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection is not available for cleanup.');
    }

    const collections = await db.collections();
    for (let collection of collections) {
      if (collection.collectionName !== 'certifications') {
        await collection.drop();
        console.log(`Dropped collection: ${collection.collectionName}`);
      }
    }
    console.log('All collections (except certifications) dropped successfully');
    await mongoose.connection.close();
    console.log('MongoDB connection closed successfully');
  } catch (error) {
    console.error('Error during global cleanup:', error);
    throw error;
  }
};