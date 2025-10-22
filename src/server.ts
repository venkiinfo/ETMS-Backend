import mongoose from 'mongoose';
import app from './app';
import { ENV } from './config/env';

export const startServer = async () => {
  try {
    await mongoose.connect(ENV.mongoURI);
    console.log('MongoDB connected');
    
    const server = app.listen(ENV.port);
    console.log(`Server running at http://localhost:${ENV.port}`);
    
    server.on('error', (err: Error) => {
      console.error('Server error:', err);
    });
    
    return server;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}
