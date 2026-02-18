const socketIO = require("socket.io");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { Chat } = require("../models/chat");
const { ConnectionRequest } = require("../models/connectionRequest");

const getRoomId = (a, b) =>
  crypto
    .createHash("sha256")
    .update([a.toString(), b.toString()].sort().join("_"))
    .digest("hex");

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // 🔐 Authenticate socket
 io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      console.log("❌ No cookie header");
      return next(new Error("Unauthorized"));
    }

    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => c.split("="))
    );

    const token = cookies.token;
    if (!token) {
      console.log("❌ No token cookie");
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      console.log("❌ User not found");
      return next(new Error("Unauthorized"));
    }

    socket.user = user;
    next();
  } catch (err) {
    console.log("❌ Socket auth error:", err.message);
    next(new Error("Unauthorized"));
  }
});


  io.on("connection", (socket) => {
    const user = socket.user;

    socket.on("joinChat", ({ targetUserId }) => {
  const roomId = getRoomId(socket.user._id, targetUserId);
  socket.join(roomId);
});


    socket.on("sendMessage", async ({ targetUserId, text }) => {
      const roomId = getRoomId(user._id, targetUserId);

      const connection = await ConnectionRequest.findOne({
        $or: [
          { fromUserId: user._id, toUserId: targetUserId, status: "accepted" },
          { fromUserId: targetUserId, toUserId: user._id, status: "accepted" },
        ],
      });

      if (!connection) return;

      let chat = await Chat.findOne({
        participants: { $all: [user._id, targetUserId] },
      });

      if (!chat) {
        chat = new Chat({
          participants: [user._id, targetUserId],
          messages: [],
        });
      }

      const message = {
        senderId: user._id,
        text,
        createdAt: new Date(),
      };

      chat.messages.push(message);
      await chat.save();

      io.to(roomId).emit("messageReceived", {
        senderId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        text,
      });
    });
  });
};

module.exports = initializeSocket;
