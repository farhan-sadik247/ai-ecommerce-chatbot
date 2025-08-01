import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Extend global type for mongoose caching
declare global {
  var mongoose: {
    conn: any;
    promise: Promise<any> | null;
  };
}

// Global connection promise to prevent multiple connections
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  try {
    // If we already have a connection and it's ready, return it
    if (cached.conn && mongoose.connection.readyState === 1) {
      return cached.conn;
    }

    // If we don't have a promise, create one
    if (!cached.promise) {
      const opts = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      };

      console.log('Attempting to connect to MongoDB...');
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('Successfully connected to MongoDB');

        // Wait for the connection to be fully ready
        return new Promise((resolve) => {
          if (mongoose.connection.readyState === 1) {
            resolve(mongoose);
          } else {
            mongoose.connection.once('connected', () => {
              resolve(mongoose);
            });
          }
        });
      }).catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
        cached.promise = null; // Reset promise on error
        throw error;
      });
    }

    // Wait for the connection to be established
    cached.conn = await cached.promise;

    // Double check the connection state
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB connection not ready');
    }

    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Reset the promise and connection so we can try again
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

export default connectDB;
