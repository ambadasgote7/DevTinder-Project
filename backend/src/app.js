const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/database");
const initializeSocket = require("./utils/socket");
require("./utils/cronjob");

const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

/* =======================
   GLOBAL MIDDLEWARES
======================= */


// CORS configuration (env based)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parser & cookies
app.use(express.json());
app.use(cookieParser());

/* =======================
   ROUTES
======================= */

app.use("/", require("./routes/auth"));
app.use("/profile", require("./routes/profile"));
app.use("/request", require("./routes/request"));
app.use("/user", require("./routes/user"));
app.use("/chat", require("./routes/chat"));
app.use("/admin", require("./routes/admin"));

/* =======================
   HEALTH CHECK
======================= */

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/* =======================
   STATIC FRONTEND (PRODUCTION)
======================= */
const rootDir = path.resolve(__dirname, "../../");

app.use(express.static(path.join(rootDir, "frontend", "dist")));

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.resolve(rootDir, "frontend", "dist", "index.html"));
});



/* =======================
   SERVER & SOCKET
======================= */

const server = http.createServer(app);
initializeSocket(server);

/* =======================
   DB & SERVER START
======================= */

connectDB()
  .then(() => {
    console.log("✅ Database connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
  });

module.exports = app;
