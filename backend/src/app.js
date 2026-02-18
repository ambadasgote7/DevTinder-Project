const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/database");
const initializeSocket = require("./utils/socket");
require("./utils/cronjob");

const app = express();

/* =======================
   GLOBAL MIDDLEWARES
======================= */

// ✅ CORS — supports PATCH + cookies (Node v22 safe)
app.use(
  cors({
    origin: "http://localhost:5173", // frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// JSON & cookies MUST come after CORS
app.use(express.json());
app.use(cookieParser());

/* =======================
   ROUTES
======================= */

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const adminRouter = require("./routes/admin");

// auth
app.use("/", authRouter);

// profile
app.use("/profile", profileRouter);

// connection requests
app.use("/request", requestRouter);

// user related (feed, connections, requests)
app.use("/user", userRouter);

// chat
app.use("/chat", chatRouter);

// admin
app.use("/admin", adminRouter);

/* =======================
   HEALTH CHECK (OPTIONAL BUT RECOMMENDED)
======================= */

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
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
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
  });

module.exports = app;
