import pg from "pg";
import config from "./app.js";

const { Pool } = pg;

const poolConfig = config.db.connectionString
  ? {
      connectionString: config.db.connectionString,
    }
  : {
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
    };

const pool = new Pool({
  ...poolConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  console.log("[DB] Client connected to pool");
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err.message);
  process.exit(-1);
});

// Single Query
const query = (text, params) => pool.query(text, params);

// Dedicated client
const getClient = () => pool.connect();

export { query, getClient, pool };
