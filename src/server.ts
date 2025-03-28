// Purpose: Entry point for the backend server.
import { Server } from "http";
import app from "./app";
import "tsconfig-paths/register";
import { connectToDatabase } from "./db";
import { logError, handleShutdown } from "./utils/server-helpers";
import { logger } from "./utils/logger";
import chalk from "chalk";
import { JobScheduler } from "./jobs/scheduler";

/**
 * Define the port for the server to listen on.
 * Uses environment variable PORT or defaults to 4000.
 */
const PORT: number = parseInt(process.env.PORT || "4000", 10);
let server: Server;

/**
 * Immediately invoked async function to establish a database connection.
 * If the connection fails, it logs the error and exits the process.
 */
(async () => {
    try {
        await connectToDatabase();
    } catch (err) {
        logError(err as Error, "Database Connection Error");
        process.exit(1);
    }
})();

/**
 * Start the server and print available routes for debugging.
 */
try {
    server = app.listen(PORT, () => {
        logger.server("Taskify Backend Server");

        // Initialize scheduled jobs
        JobScheduler.initializeJobs();

        logger.info("Available Routes:", "Server");

        // Get all registered routes and group them together before logging
        const routes = app._router.stack
            .filter((r: { route?: { path: string; methods?: Record<string, boolean> } }) => r.route && r.route.path)
            .map((r: { route: { path: string; methods?: Record<string, boolean> } }) => {
                // Get the HTTP method
                const method = r.route.methods
                    ? Object.keys(r.route.methods).find((m) => r.route.methods![m])
                    : undefined;

                return { path: r.route.path, method };
            });

        // Log all routes together with just one newline at the start
        console.log(
            "\n" +
                routes
                    .map((route: { path: string; method?: string }) => {
                        const methodColor = route.method ? logger.getMethodColor(route.method) : chalk.white;
                        const methodStr = route.method ? `[${methodColor(route.method.toUpperCase())}]` : "";
                        return `  ${chalk.cyan("→")} ${methodStr} ${chalk.white(route.path)}`;
                    })
                    .join("\n")
        );

        logger.success(`Server is running at http://localhost:${PORT}`, "Server");
    });
} catch (err) {
    logError(err as Error, "Server Startup Error");
    process.exit(1);
}

/**
 * Handles uncaught exceptions and logs the error details
 */
process.on("uncaughtException", (err: Error) => {
    logError(err, "Uncaught Exception");
    process.exit(1);
});

/**
 * Handle unhandled promise rejections and ensure a graceful shutdown.
 */
process.on("unhandledRejection", (reason: Error) => {
    logError(reason, "Unhandled Rejection");
    if (server) {
        server.close(() => {
            logger.warn("Shutting down server due to unhandled rejection", "System");
            process.exit(1);
        });
    }
});

// Graceful shutdown for SIGTERM and SIGINT
process.on("SIGTERM", () => handleShutdown("SIGTERM", server));
process.on("SIGINT", () => handleShutdown("SIGINT", server));

/**
 * Handle process exit events to clean up resources
 */
process.on("exit", () => {
    // Stop all scheduled jobs
    JobScheduler.stopAllJobs();

    // ... other cleanup as needed
});
