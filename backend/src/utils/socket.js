const socketIO = require("socket.io");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { Chat } = require("../models/chat");
const { ConnectionRequest } = require("../models/connectionRequest");

/* =========================
   ROOM ID
========================= */
const getRoomId = (a, b) =>
  crypto
    .createHash("sha256")
    .update([a.toString(), b.toString()].sort().join("_"))
    .digest("hex");

/* =========================
   ONLINE USERS
========================= */
const onlineUsers = new Map();

/* =========================
   SOCKET INIT
========================= */
const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  /* =========================
     AUTH
  ========================= */
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) return next(new Error("Unauthorized"));

      const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((c) => c.split("="))
      );

      const token = cookies.token;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);

      if (!user) return next(new Error("Unauthorized"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  /* =========================
     CONNECTION
  ========================= */
  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    console.log("🟢 Connected:", userId, socket.id);

    /* ADD ONLINE */
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    io.emit("onlineUsersList", Array.from(onlineUsers.keys()));
    socket.broadcast.emit("userOnline", userId);

    /* REQUEST ONLINE */
    socket.on("getOnlineUsers", () => {
      socket.emit("onlineUsersList", Array.from(onlineUsers.keys()));
    });

    /* =========================
       JOIN CHAT
    ========================= */
    socket.on("joinChat", async ({ targetUserId }) => {
      if (!targetUserId) return;

      const roomId = getRoomId(userId, targetUserId);
      socket.join(roomId);

      const targetOnline = onlineUsers.has(targetUserId);

      socket.emit("targetStatus", {
        userId: targetUserId,
        online: targetOnline,
      });

      /* ===== MARK DELIVERED ===== */
      try {
        const chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) return;

        let updated = false;

        chat.messages.forEach((msg) => {
          if (
            msg.receiverId.toString() === userId &&
            msg.status === "sent"
          ) {
            msg.status = "delivered";
            updated = true;
          }
        });

        if (updated) {
          await chat.save();

          io.to(roomId).emit("messagesDelivered", {
            deliveredTo: userId,
          });
        }
      } catch (err) {
        console.log("joinChat delivered error:", err.message);
      }
    });

    /* =========================
       TYPING
    ========================= */
    socket.on("typing", ({ targetUserId }) => {
      const roomId = getRoomId(userId, targetUserId);

      socket.to(roomId).emit("typing", {
        userId,
      });
    });

    socket.on("stopTyping", ({ targetUserId }) => {
      const roomId = getRoomId(userId, targetUserId);

      socket.to(roomId).emit("stopTyping", {
        userId,
      });
    });

    /* =========================
       SEND MESSAGE
    ========================= */
    socket.on("sendMessage", async ({ targetUserId, text }) => {
      try {
        if (!targetUserId || !text) return;

        const roomId = getRoomId(userId, targetUserId);

        const connection = await ConnectionRequest.findOne({
          $or: [
            {
              fromUserId: userId,
              toUserId: targetUserId,
              status: "accepted",
            },
            {
              fromUserId: targetUserId,
              toUserId: userId,
              status: "accepted",
            },
          ],
        });

        if (!connection) return;

        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        const receiverOnline = onlineUsers.has(targetUserId);

        const message = {
          senderId: userId,
          receiverId: targetUserId,
          text,
          status: receiverOnline ? "delivered" : "sent",
          createdAt: new Date(),
        };

        chat.messages.push(message);
        await chat.save();

        const savedMessage =
          chat.messages[chat.messages.length - 1];

        io.to(roomId).emit("messageReceived", savedMessage);
      } catch (err) {
        console.log("sendMessage error:", err.message);
      }
    });

    /* =========================
       MARK SEEN
    ========================= */
    socket.on("markSeen", async ({ targetUserId }) => {
      try {
        const roomId = getRoomId(userId, targetUserId);

        const chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) return;

        let updated = false;

        chat.messages.forEach((msg) => {
          if (
            msg.senderId.toString() === targetUserId &&
            msg.receiverId.toString() === userId &&
            msg.status !== "seen"
          ) {
            msg.status = "seen";
            msg.seenAt = new Date();
            updated = true;
          }
        });

        if (updated) {
          await chat.save();

          io.to(roomId).emit("messagesSeen", {
            seenBy: userId,
          });
        }
      } catch (err) {
        console.log("markSeen error:", err.message);
      }
    });

    /* =========================
       DISCONNECT
    ========================= */
    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", userId, socket.id);

      if (!onlineUsers.has(userId)) return;

      const userSockets = onlineUsers.get(userId);
      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit("userOffline", userId);
      }
    });
  });
};

module.exports = initializeSocket;
