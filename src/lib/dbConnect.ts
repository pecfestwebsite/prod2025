import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global cache to prevent multiple connections during development
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
      console.log('✅ MongoDB connected successfully');
      
      // Handle schema migration - update validator for Event collection
      try {
        const db = mongoose.connection.db;
        if (db) {
          const collections = await db.listCollections().toArray();
          const eventCollectionExists = collections.some(c => c.name === 'events');
          
          if (eventCollectionExists) {
            // Try to get collection stats
            const collectionInfo = await db.command({ collStats: 'events' }).catch(() => null);
            
            // If there's a JSON schema validator for events, we might need to update it
            // For now, we'll just log it
            console.log('📋 Event collection exists, validator will be enforced by Mongoose schema');
          }
        }
      } catch (error) {
        console.log('⚠️ Could not check/update collection validators:', error);
        // Continue anyway - the Mongoose schema validation will handle it
      }
      
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
