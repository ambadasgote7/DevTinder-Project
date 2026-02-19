const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { Chat } = require("../models/chat");
const User = require("../models/user");

const chatRouter = express.Router();

/* =========================
   GET CHAT BETWEEN USERS
========================= */
chatRouter.get("/:targetUserId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user required" });
    }

    /* =========================
       FIND TARGET USER
    ========================= */
    const targetUser = await User.findById(targetUserId).select(
      "firstName lastName photoUrl"
    );

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    /* =========================
       FIND CHAT
    ========================= */
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    })
      .populate("messages.senderId", "firstName lastName photoUrl")
      .populate("messages.receiverId", "firstName lastName photoUrl")
      .lean();

    /* =========================
       CREATE CHAT IF NOT EXISTS
    ========================= */
    if (!chat) {
      const newChat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });

      await newChat.save();

      chat = newChat.toObject();
    }

    /* =========================
       SORT MESSAGES
    ========================= */
    if (chat.messages && chat.messages.length > 0) {
      chat.messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }

    /* =========================
       RESPONSE
    ========================= */
    res.status(200).json({
      chatId: chat._id,
      participants: chat.participants,
      messages: chat.messages || [],
      targetUser, // ⭐ IMPORTANT FOR UI
    });

  } catch (err) {
    console.error("Get chat error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = chatRouter;
