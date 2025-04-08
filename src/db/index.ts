/**
 * Database connection and Drizzle ORM configuration
 *
 * This file establishes database connections and exports Drizzle ORM instances
 * with the complete schema imported from schema.ts
 */
import dotenv from "dotenv";
dotenv.config();
import { drizzle } from "drizzle-orm/node-postgres";
// import { createConnection } from "mysql2";
// import { Connection } from "mysql2/typings/mysql/lib/Connection";
import { Client, Pool, PoolClient } from "pg";
import * as schema from "./schema";
import { logger } from "../utils/logger";

// Create a PostgreSQL connection pool for efficient connection management
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Initialize the primary Drizzle ORM instance with connection pool
// This is the recommended way to use Drizzle in a production environment
// The schema includes all models exported from schema.ts
export const db = drizzle(pool, { schema, casing: "snake_case" });

// Create a single client connection
// This is useful for transactions or when a dedicated connection is needed
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});
client.connect();

// Initialize a secondary Drizzle ORM instance with the dedicated client
// This can be used for special operations that require a dedicated connection
export const dbClient = drizzle(client, { schema });

// Test the database connection on application startup
export const connectToDatabase = async () => {
    try {
        const client: PoolClient = await pool.connect();
        logger.success("Connected to the database successfully", "Database");
        client.release(); // Release the connection back to the pool
    } catch (error) {
        logger.error("Failed to connect to the database", error as Error, "Database");
        logger.info(`Connection URL: ${process.env.DATABASE_URL}`, "Database");
        process.exit(1); // Exit the application if the database connection fails
    }
};

/* MySQL (old DB)
// This will be used later to migrate data from the old MySQL database
export const mysqlConnection: Connection = createConnection({
    host: process.env.OLD_DB_HOST!,
    port: parseInt(process.env.OLD_DB_PORT!, 10),
    user: process.env.OLD_DB_USER!,
    password: process.env.OLD_DB_PASSWORD!,
    database: process.env.OLD_DB_NAME!,
});

// Test MySQL Connection
export const connectToMySQL = async () => {
    try {
        await mysqlConnection.query("SELECT COUNT(*) AS totalRows FROM community");
        logger.success("Connected to MySQL successfully", "MySQL");
    } catch (error) {
        logger.error("MySQL connection failed", error as Error, "MySQL");
    }
};
*/
