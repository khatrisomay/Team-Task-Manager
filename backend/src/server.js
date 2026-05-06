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

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missing = requiredEnv.filter((v) => !process.env[v]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./config/db.js");

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
