// Purpose: Common server utilities and helpers.
import { Server } from "http";

/*
 * Utility function for logging errors
 * @param {Error} error - The error object to log
 * @param {string} context - The context in which the error occurred
 *
 * @returns {void}
 */
export const logError = (error: Error, context: string): void => {
    console.error(`[${context}]`, {
        message: error.message || "Unknown error",
        stack: error.stack || "No stack trace available",
    });
};

/*
 * Handle server shutdown gracefully
 * @param {string} signal - The signal that triggered the shutdown
 * @param {Server} server - The server instance to close
 *
 * @returns {Promise<void>}
 */
export const handleShutdown = async (signal: "SIGTERM" | "SIGINT", server: Server) => {
    console.log(`⚠️ Received ${signal}. Shutting down gracefully...`);
    if (server) {
        server.close(() => console.log("🛑 Server closed."));
    }
    try {
        console.log("🔌 Database connection closed.");
        process.exit(0);
    } catch (error) {
        logError(error as Error, "Shutdown Error");
        process.exit(1);
    }
};
