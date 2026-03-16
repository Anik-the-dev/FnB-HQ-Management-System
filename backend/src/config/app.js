import dotenv from "dotenv";

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 4000,

  db: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || "fnb_db",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "qwert12345cvbnm",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  },
};

export default config;
