const router = require("express").Router();
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, async (req, res) => {
  const { chatId, text } = req.body;

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
    updatedAt: Date.now(),
  });

  res.status(201).json(message);
});

router.get("/:chatId", auth, async (req, res) => {
  const messages = await Message.find({
    chatId: req.params.chatId,
  }).sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = router;
