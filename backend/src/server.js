if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./config/db.js");

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];

const validateEnv = () => {
  const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
