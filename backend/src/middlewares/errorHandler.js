const PG_ERRORS = {
  23505: { status: 409, message: "Duplicate entry — record already exists." },
  23503: { status: 400, message: "Referenced record does not exist." },
  23514: { status: 400, message: "Value violates a data constraint." },
  23502: { status: 400, message: "A required field is missing." },
};

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Known Postgres errors
  if (err.code && PG_ERRORS[err.code]) {
    const { status, message } = PG_ERRORS[err.code];
    return res
      .status(status)
      .json({ success: false, error: message, detail: err.detail ?? null });
  }

  // App-thrown errors with explicit status
  if (err.statusCode) {
    return res
      .status(err.statusCode)
      .json({ success: false, error: err.message });
  }

  // Fallback 500
  return res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};

export default errorHandler;
