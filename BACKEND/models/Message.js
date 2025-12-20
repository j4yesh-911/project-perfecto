const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    type: { type: String, enum: ['user', 'system'], default: 'user' },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
