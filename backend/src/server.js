import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== "production") {
  const envPaths = [
    path.resolve(__dirname, "..", ".env"),
    path.resolve(__dirname, "..", "..", ".env")
  ];

  const envPath = envPaths.find((candidate) => fs.existsSync(candidate));

  if (envPath) {
    dotenv.config({ path: envPath });
  } else {
    dotenv.config();
  }
}

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
const DB_RETRY_MS = Number(process.env.DB_RETRY_MS) || 10000;

const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./config/db.js");

const connectWithRetry = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    console.error(`Retrying database connection in ${DB_RETRY_MS}ms`);
    setTimeout(connectWithRetry, DB_RETRY_MS);
  }
};

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  connectWithRetry();
});
