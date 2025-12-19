const router = require("express").Router();
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, async (req, res) => {
  try {
    const { chatId, text } = req.body;

    // ✅ validation
    if (!chatId || !text) {
      return res.status(400).json({ msg: "chatId and text required" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // ✅ FIXED HERE (Message not message)
    const message = await Message.create({
      chatId,
      sender: req.user.id,
      text,
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text,
        sender: req.user.id,
      },
    });

    res.status(200).json(message);
  } catch (err) {
    console.error("Message send error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/:chatId", auth, async (req, res) => {
  const messages = await Message.find({
    chatId: req.params.chatId,
  });

  res.json(messages);
});

module.exports = router;
