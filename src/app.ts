import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import morgan from "morgan";
import express, { Request, Response } from "express";
import endpoints from "express-list-endpoints";

// Import user routes
import userRoutes from "./modules/user/routes/user.routes";

const app = express(); // Create an Express application instance

// **Middleware setup**

app.use(express.json()); // Parse incoming JSON requests

app.use(express.urlencoded({ extended: true })); // Parse incoming requests with urlencoded payloads

app.use(cors()); // Enable CORS for all routes

app.use(express.static("public")); // Serve static files from the "public" directory

// **Request Logging Setup with Morgan**
if (process.env.NODE_ENV === "development") {
    // In development, log all HTTP requests in the 'dev' format (concise and colored)
    app.use(morgan("dev"));
} else {
    // In production, log requests in the 'combined' format (standard Apache combined log format)
    app.use(morgan("combined"));
}

// **Health Check Route**
// A simple GET endpoint to check if the server is running
app.get("/health", (req, res) => {
    res.status(200).json({
        message: "Server health is ok!",
    });
});

// **Endpoint Listing Route**
// Return a list of all registered routes in the application
app.get("/routes", (req, res) => {
    res.status(200).send(endpoints(app));
});

// Available routes
app.use("/api/users", userRoutes);

// **Global Error Handler Registration**
// Register the custom error handler to manage application errors centrally
// This should be registered after all routes
// app.use(httpErrorHandler);

// **404 Error Handler**
// Catch-all route for handling undefined routes and request methods
app.all("*", async (req: Request, res: Response) => {
    res.status(404).json({
        error: {
            message: "Not Found. Kindly Check the API path as well as request type",
        },
    });
});

// Export the Express app instance for use in other modules (e.g., server.ts)
export default app;
