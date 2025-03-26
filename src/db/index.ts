import { drizzle } from "drizzle-orm/node-postgres";
// import { createConnection } from "mysql2";
// import { Connection } from "mysql2/typings/mysql/lib/Connection";
import { Client, Pool, PoolClient } from "pg";
import * as templates from "../modules/tasks/templates/models";
// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle ORM with the pool
export const db = drizzle(pool, { casing: "snake_case" });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});
client.connect();

export const dbClient = drizzle(client, { schema: templates }); // TODO: Fix the schema imports

// Test the connection 🔌
export const connectToDatabase = async () => {
    try {
        const client: PoolClient = await pool.connect(); // Test the connection ✔️
        console.log("Connected to the database successfully. 🎉");
        client.release(); // Release the connection back to the pool
    } catch (error) {
        console.log(process.env.DATABASE_URL);
        console.error("Failed to connect to the database: ⚠️", error);
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
        console.log("[MySQL] - Connected successfully. 🎉");
    } catch (error) {
        console.error("[MySQL] - Connection failed: ⚠️", error);
    }
};
*/
