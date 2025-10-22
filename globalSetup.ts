// globalSetup.ts
import mongoose from 'mongoose';
import { ENV } from './src/config/env';

export default async () => {
  try {
    await mongoose.connect(ENV.mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully in global setup');
  } catch (error) {
    console.error('MongoDB connection error in global setup:', error);
    throw error;
  }
};