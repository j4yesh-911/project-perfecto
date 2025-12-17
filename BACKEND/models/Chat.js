const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    members: {
      type: [String],   // ✅ MUST be array
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
