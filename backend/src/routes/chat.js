const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/:targetUserId", isAuthenticated, async (req, res) => {
  const userId = req.user._id;
  const { targetUserId } = req.params;

  let chat = await Chat.findOne({
    participants: { $all: [userId, targetUserId] },
  }).populate("messages.senderId", "firstName lastName");

  if (!chat) {
    chat = new Chat({
      participants: [userId, targetUserId],
      messages: [],
    });
    await chat.save();
  }

  res.status(200).json(chat);
});

module.exports = chatRouter;
