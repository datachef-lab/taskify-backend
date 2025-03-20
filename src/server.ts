// Purpose: Entry point for the backend server.
import { Server } from "http";
import app from "./app";
import "tsconfig-paths/register";
import { connectToDatabase } from "./db";
import { logError, handleShutdown } from "./utils/server-helpers";

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
        console.log("==============================================");
        console.log("🚀 Taskify Backend Server");
        console.log("==============================================");
        console.log("📍 Available Routes:");
        app._router.stack
            .filter((r: { route?: { path: string } }) => r.route && r.route.path)
            .forEach((r: { route: { path: string } }) => {
                console.log(` - ${r.route.path}`);
            });
        console.log("==============================================");
        console.log(`🚀 Server is running at http://localhost:${PORT}`);
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
            console.log("🔒 Shutting down server due to unhandled rejection.");
            process.exit(1);
        });
    }
});

// Graceful shutdown for SIGTERM and SIGINT
process.on("SIGTERM", () => handleShutdown("SIGTERM", server));
process.on("SIGINT", () => handleShutdown("SIGINT", server));
