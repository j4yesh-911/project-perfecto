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

  const chat = await Chat.findById(chatId);
  const otherMember = chat.members.find(m => m.toString() !== req.user.id.toString());
  if (otherMember) {
    const currentUnread = chat.unreadCounts.get(otherMember.toString()) || 0;
    chat.unreadCounts.set(otherMember.toString(), currentUnread + 1);
    await chat.save();
  }

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

router.post("/:chatId/read", auth, async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (chat) {
    chat.unreadCounts.set(req.user.id.toString(), 0);
    await chat.save();
  }
  res.status(200).json({ success: true });
});

module.exports = router;
