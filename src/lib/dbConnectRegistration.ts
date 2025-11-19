import mongoose from 'mongoose';

// Prefer an explicit registration DB URI. If not provided, attempt to derive
// a registration-specific DB name from the main MONGODB_URI. If that fails,
// fall back to the primary URI (will store in the same DB).
const MONGODB_URI = process.env.MONGODB_URI as string | undefined;
const REGISTRATION_URI = process.env.MONGODB_URI_REGISTRATION as string | undefined;

if (!MONGODB_URI && !REGISTRATION_URI) {
  throw new Error(
    'Please define at least one of MONGODB_URI or MONGODB_URI_REGISTRATION in .env.local'
  );
}

function deriveRegistrationUri(primaryUri: string): string | null {
  try {
    // Try to replace the database name part in the connection string.
    // This handles both standard and srv URIs like:
    // mongodb+srv://user:pass@host/dbname?opts  OR  mongodb://host:port/dbname
    const protoSep = primaryUri.indexOf('//');
    if (protoSep === -1) return null;
    const afterProto = primaryUri.indexOf('/', protoSep + 2);
    if (afterProto === -1) return null;

    // database+options part
    const dbAndOptions = primaryUri.substring(afterProto + 1);
    // split options (query string)
    const qIdx = dbAndOptions.indexOf('?');
    const dbName = qIdx === -1 ? dbAndOptions : dbAndOptions.substring(0, qIdx);
    if (!dbName) return null;

    const newDbName = `${dbName}_registration`;
    const newUri = primaryUri.replace(`${afterProto + 1}${dbName}`, `${afterProto + 1}${newDbName}`);
    return newUri;
  } catch (e) {
    return null;
  }
}

const CONNECTION_URI = REGISTRATION_URI || (MONGODB_URI ? deriveRegistrationUri(MONGODB_URI) || MONGODB_URI : '');

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // separate global cache to avoid colliding with the main connection cache
  var mongooseRegistration: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseRegistration || { conn: null, promise: null };

if (!global.mongooseRegistration) {
  global.mongooseRegistration = cached;
}

async function dbConnectRegistration(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(CONNECTION_URI, opts).then((mongooseRes) => {
      console.log('✅ MongoDB (registration) connected successfully');
      return mongooseRes;
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

export default dbConnectRegistration;
