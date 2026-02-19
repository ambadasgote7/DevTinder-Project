const mongoose = require("mongoose");

/* =========================
   MESSAGE SCHEMA
========================= */
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    seenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* =========================
   CHAT SCHEMA
========================= */
const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    messages: [messageSchema],
  },
  { timestamps: true }
);

/* =========================
   INDEXES (IMPORTANT)
========================= */

// Faster participant lookup
chatSchema.index({ participants: 1 });

// Faster message queries
chatSchema.index({ "messages.senderId": 1 });
chatSchema.index({ "messages.receiverId": 1 });

const Chat = mongoose.model("Chat", chatSchema);

module.exports = { Chat };
