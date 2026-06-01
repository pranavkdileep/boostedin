import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGO_DB_NAME;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

if (!dbName) {
  throw new Error("MONGO_DB_NAME is not defined in environment variables");
}

const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient;
};

const client = globalForMongo._mongoClient ?? new MongoClient(uri);
if (!globalForMongo._mongoClient) {
  globalForMongo._mongoClient = client;
}

export const db: Db = client.db(dbName);
