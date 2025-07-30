/* eslint-disable no-console */
import { Server } from "http";
import app from "./app";
import mongoose from "mongoose";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.MONGODB_URI);
    console.log("✅ Database connected successfully.");

    server = app.listen(envVars.PORT, () => {
      console.log(`🚀 Server is running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
  }
};

(async () => {
  await startServer();
  await seedSuperAdmin();
})();

// Unhandled rejection error

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection Detected. Server Shutting Down...", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Uncaught rejection error

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception Detected. Server Shutting Down...", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Signal termination error

process.on("SIGTERM", () => {
  console.log("SIGTERM Signal Detected. Server Shutting Down...");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
