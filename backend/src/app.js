import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import config from "./config/app.js";

const app = express();
// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Http Logging middleware
app.use(morgan(config.env === "development" ? "dev" : "combined"));

// Health check
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "FnB API is running", env: config.env });
});

// Not Found 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

export default app;
