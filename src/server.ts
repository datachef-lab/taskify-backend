import app from "./app"; // Import the Express application instance
import "tsconfig-paths/register"; //for running ts-node and migrations
// import { AppDataSource, connectDatabase } from "./config/data-source"; // Import the database connection instance

// Utility function for logging errors
const logError = (error: Error | any, context: string): void => {
  console.error(`[${context}]`, {
    message: error.message || "Unknown error",
    stack: error.stack || "No stack trace available",
  });
};

// Handle uncaught exceptions globally
process.on("uncaughtException", (err: Error) => {
  logError(err, "Uncaught Exception");
  // Gracefully shut down the process in case of an uncaught exception
  process.exit(1);
});

// Immediately invoked async function to establish a database connection
(async () => {
  try {
    // await connectDatabase(); // Attempt to initialize the database connection
    console.log("✅ Database connection established successfully.");
  } catch (err) {
    logError(err, "Database Connection Error");
    process.exit(1); // Exit the process if the database connection fails
  }
})();

// Define the port on which the server will listen, defaulting to 4000 if not specified in environment variables
const port: number = parseInt(process.env.PORT || "4000", 10);

let server: any;

// Start the server
try {
  server = app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
  app._router.stack.forEach(function (r: any) {
    if (r.route && r.route.path) {
      console.log(r.route.path);
    }
  });
} catch (err) {
  logError(err, "Server Startup Error");
  process.exit(1);
}

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logError(reason, "Unhandled Rejection");
  if (server) {
    server.close(() => {
      console.log("🔒 Shutting down server due to unhandled rejection.");
      process.exit(1); // Gracefully shut down the server
    });
  }
});

// Graceful shutdown for SIGTERM and SIGINT signals (e.g., from Docker or Kubernetes)
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log("🚦 Server closed.");
    });
  }
  try {
    // await AppDataSource.destroy(); // Close database connection
    console.log("🔌 Database connection closed.");
    process.exit(0); // Exit the process gracefully
  } catch (err) {
    logError(err, "Error during shutdown");
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
