import express, { Request, Response, NextFunction } from "express";
import cors from "cors"; // Enable CORS for cross-origin requests
import { corsOptions } from "./config/corsOptions";
import dotenv from "dotenv"; // Load environment variables from .env file
dotenv.config(); // Initialize dotenv
import morgan from "morgan"; // HTTP request logger middleware
// import router from "./routes/index.routes"; // Main application routes
import endpoints from "express-list-endpoints"; // To list registered endpoints
import { logger, errorHandler } from "./middlewares/index.middleware";
import path from "path"; // Import path module for path operations

// Import user routes
import userRoutes from "./modules/user/routes/user.routes";

const app = express(); // Create an Express application instance

// **Middleware setup**

// Parse incoming request bodies as JSON
app.use(express.json());

// Enable CORS for all routes to allow cross-origin requests
app.use(cors(corsOptions));
app.use(logger);

// Serve static files from the "public" directory (e.g., images, CSS, JavaScript)
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("^/$|/index(.html)?", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "src", "views", "index.html"));
});

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

// **Main Routes Registration**
// Register the user routes
app.use("/api/users", userRoutes);

// **Global Error Handler Registration**
// Register the custom error handler to manage application errors centrally
// This should be registered after all routes
app.use(errorHandler);

// **404 Error Handler**
// Catch-all route for handling undefined routes and request methods
app.all("*", (req: Request, res: Response) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(
      path.join(__dirname, "..", "src", "views", "404.html"),
      (err) => {
        if (err) {
          res.status(500).send("Internal Server Error");
        }
      }
    );
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Export the Express app instance for use in other modules (e.g., server.ts)
export default app;
