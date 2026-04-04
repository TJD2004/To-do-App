require("dotenv").config();
const cors = require('cors');

const path = require("path");
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/database");
const taskRoutes = require("./routes/taskRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();
app.use(cors({
  origin: 'http://127.0.0.1:5500'
}));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Static frontend ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "..", "public")));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/tasks", taskRoutes);

// ── 404 & error handling ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

// Only start the server when run directly (not during tests)
if (require.main === module) {
  startServer();
}

module.exports = app;
