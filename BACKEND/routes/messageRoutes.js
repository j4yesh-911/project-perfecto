const router = require("express").Router();
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const auth = require("../middleware/authMiddleware");
const { io } = require("../server");

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

  // Mark messages as read
  const result = await Message.updateMany(
    { chatId: req.params.chatId, sender: { $ne: req.user.id }, status: { $ne: 'read' } },
    { status: 'read' }
  );

  // Emit status update if any messages were updated
  if (result.modifiedCount > 0) {
    const updatedMessages = await Message.find({
      chatId: req.params.chatId,
      sender: { $ne: req.user.id },
      status: 'read'
    }).select('_id');

    const messageIds = updatedMessages.map(msg => msg._id.toString());

    io.to(req.params.chatId).emit("messageStatusUpdate", {
      chatId: req.params.chatId,
      messageIds,
      status: 'read'
    });
  }

  res.status(200).json({ success: true });
});

router.post("/delivered", auth, async (req, res) => {
  const { messageIds } = req.body;
  await Message.updateMany(
    { _id: { $in: messageIds }, sender: { $ne: req.user.id } },
    { status: 'delivered' }
  );

  // Emit status update to the sender
  const messages = await Message.find({ _id: { $in: messageIds } });
  if (messages.length > 0) {
    const chatId = messages[0].chatId.toString();
    io.to(chatId).emit("messageStatusUpdate", {
      chatId,
      messageIds,
      status: 'delivered'
    });
  }

  res.status(200).json({ success: true });
});

module.exports = router;
