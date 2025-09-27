import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Please add MONGODB_URI to .env.local");

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  __mongoose?: MongooseCache;
};

if (!globalWithMongoose.__mongoose) {
  globalWithMongoose.__mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (globalWithMongoose.__mongoose!.conn) {
    return globalWithMongoose.__mongoose!.conn;
  }
  if (!globalWithMongoose.__mongoose!.promise) {
    globalWithMongoose.__mongoose!.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  globalWithMongoose.__mongoose!.conn = await globalWithMongoose.__mongoose!.promise;
  return globalWithMongoose.__mongoose!.conn;
}
