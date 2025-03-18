import "dotenv/config";
import app from "./app";
// import { connectToDatabase, connectToMySQL } from "@/db/index.js";

const PORT = process.env.PORT || 5500;

(async () => {
  console.log("\nInitializing academic360...\n");
  try {
    // await connectToDatabase();
    // await connectToMySQL();
    app.listen(PORT, () => {
      console.log(
        `[backend] - taskify is running on http://localhost:${PORT} 🚀\n`
      );
      console.log(`PROFILE: ${process.env.NODE_ENV!}\n`);
      console.log("Press Ctrl+C to stop the application.\n");
    });
  } catch (error) {
    console.error("[backend] - Failed to start the application: ⚠️\n", error);
  }
})();
