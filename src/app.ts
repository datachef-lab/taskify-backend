import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import morgan from "morgan";
import express, { Request, Response } from "express";
import endpoints from "express-list-endpoints";
import chalk from "chalk";

import authRouter from "./modules/auth/routes/auth.routes";
import { authenticate } from "./middleware/auth.middleware";
import userRouter from "./modules/user/routes/user.routes";

const app = express(); // Create an Express application instance

// **Middleware setup**

app.use(express.json()); // Parse incoming JSON requests

app.use(express.urlencoded({ extended: true })); // Parse incoming requests with urlencoded payloads

app.use(cors()); // Enable CORS for all routes

app.use(express.static("public")); // Serve static files from the "public" directory

// **Custom Morgan Token for Status Colors**
morgan.token("status-colored", (req, res) => {
    // Get the status code from the response
    const status = res.statusCode;

    // Choose the color based on the status code
    let color;
    if (status >= 500) color = chalk.red;
    else if (status >= 400) color = chalk.yellow;
    else if (status >= 300) color = chalk.cyan;
    else if (status >= 200) color = chalk.green;
    else color = chalk.white;

    return color(status);
});

// **Custom Morgan Token for Method Colors**
morgan.token("method-colored", (req) => {
    // Get the method from the request
    const method = req.method;

    // Choose the color based on the method
    let color;
    switch (method) {
        case "GET":
            color = chalk.green;
            break;
        case "POST":
            color = chalk.yellow;
            break;
        case "PUT":
            color = chalk.blue;
            break;
        case "DELETE":
            color = chalk.red;
            break;
        case "PATCH":
            color = chalk.magenta;
            break;
        default:
            color = chalk.white;
    }

    return color(method);
});

// **Request Logging Setup with Morgan**
if (process.env.NODE_ENV === "development") {
    // Custom format for development
    const customFormat = (tokens: any, req: Request, res: Response) => {
        const timestamp = new Date().toISOString();
        const method = tokens["method-colored"](req, res);
        const url = chalk.white(tokens.url(req, res));
        const status = tokens["status-colored"](req, res);
        const responseTime = chalk.magenta(`${tokens["response-time"](req, res)} ms`);
        const contentLength = tokens.res(req, res, "content-length") || "-";

        return `\n${chalk.gray(timestamp)} ${chalk.cyan("HTTP")} ${method} ${url} ${status} ${responseTime} - ${contentLength}`;
    };

    app.use(morgan(customFormat));
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

// Public routes
app.use("/api/auth", authRouter);

// Protected routes
app.use("/api/users", authenticate, userRouter);

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
