import { MongoClient, Db } from "mongodb";

const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient;
};

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  return uri;
}

function getDbName(): string {
  const dbName = process.env.MONGO_DB_NAME;
  if (!dbName) {
    throw new Error("MONGO_DB_NAME is not defined in environment variables");
  }
  return dbName;
}

function getClient(): MongoClient {
  if (!globalForMongo._mongoClient) {
    globalForMongo._mongoClient = new MongoClient(getUri());
  }
  return globalForMongo._mongoClient;
}

export function getDb(): Db {
  return getClient().db(getDbName());
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, receiver);
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});
