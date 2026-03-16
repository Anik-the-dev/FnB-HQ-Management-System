import app from "./app.js";
import config from "./config/app.js";
import { pool } from "./config/db.js";

const start = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("[DB] Connected successfully");

    app.listen(config.port, () => {
      console.log(
        `[SERVER] ${config.env} mode → port ${config.port}`,
      );
    });
  } catch (err) {
    console.error("[SERVER] DB connection failed:", err.message);
    process.exit(1);
  }
};

// Safety layer
process.on("unhandledRejection", (reason) => {
  console.error("[SERVER] Unhandled rejection:", reason);
  process.exit(1);
});

// Start the server
start();
