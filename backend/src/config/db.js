import mongoose from "mongoose";

const getDatabaseNameFromUri = (mongoUri) => {
  const parsedUri = new URL(mongoUri);
  const dbName = parsedUri.pathname.replace(/^\/+/, "").trim();

  return dbName || null;
};

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from environment variables");
  }

  const dbName =
    getDatabaseNameFromUri(process.env.MONGO_URI) ||
    process.env.MONGO_DB_NAME ||
    process.env.REQUIRED_DB_NAME;

  if (!dbName) {
    throw new Error(
      "Set MONGO_DB_NAME or include an explicit database name in MONGO_URI for data isolation"
    );
  }

  if (process.env.REQUIRED_DB_NAME && dbName !== process.env.REQUIRED_DB_NAME) {
    throw new Error(
      `MONGO_URI database must be ${process.env.REQUIRED_DB_NAME}; received ${dbName}`
    );
  }

  const connection = await mongoose.connect(process.env.MONGO_URI, { dbName });
  console.log(`Connected to DB: ${connection.connection.name}`);
};

export default connectDB;
