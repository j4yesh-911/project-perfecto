const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      // type: mongoose.Schema.Types.ObjectId,
           type: String,
      ref: "Chat",
    },
    senderId: {
      // type: mongoose.Schema.Types.ObjectId,
            type: String,
      ref: "User",
    },
    text: String,
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
