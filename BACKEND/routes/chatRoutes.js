const router = require("express").Router();
const Chat = require("../models/Chat");
const auth = require("../middleware/authMiddleware");

router.post("/find-or-create", auth, async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;

  let chat = await Chat.findOne({
    members: { $all: [senderId, receiverId] },
  });

  if (!chat) {
    chat = await Chat.create({
      members: [senderId, receiverId],
    });
  }

  res.json(chat);
});

router.get("/", auth, async (req, res) => {
  const chats = await Chat.find({
    members: { $in: [req.user.id] },
  })
    .populate("members", "name profilePic")
    .sort({ updatedAt: -1 });

  // Convert Map to object for JSON serialization
  const chatsWithUnreadCounts = chats.map(chat => {
    const chatObj = chat.toObject();
    if (chatObj.unreadCounts instanceof Map) {
      chatObj.unreadCounts = Object.fromEntries(chatObj.unreadCounts);
    }
    return chatObj;
  });

  res.json(chatsWithUnreadCounts);
});

module.exports = router;
