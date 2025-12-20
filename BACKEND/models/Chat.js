const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    unreadCounts: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
