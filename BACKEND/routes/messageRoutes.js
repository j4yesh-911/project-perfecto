const router = require("express").Router();
const Message = require("../models/Message");
const mongoose = require("mongoose");

// add message
router.post("/", async (req, res) => {
  try {
    const { senderId, chatId, text } = req.body;

    // ✅ validate senderId
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({
        error: "Invalid senderId. Must be a MongoDB ObjectId",
      });
    }

    // (optional but recommended)
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        error: "Invalid chatId",
      });
    }

    const newMessage = new Message({
      senderId,
      chatId,
      text,
    });

    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// get messages
router.get("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chatId" });
    }

    const messages = await Message.find({ chatId });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
