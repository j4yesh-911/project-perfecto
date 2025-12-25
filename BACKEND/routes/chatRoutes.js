const router = require("express").Router();
const Chat = require("../models/Chat");
const auth = require("../middleware/authMiddleware");

// ================= CREATE OR GET CHAT =================
router.post("/find-or-create", auth, async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ msg: "receiverId required" });
    }

    let chat = await Chat.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = await Chat.create({
        members: [senderId, receiverId],
      });
    }

    res.json(chat);
  } catch (err) {
    console.error("chat error:", err);
    res.status(500).json({ msg: "Chat failed" });
  }
});

// ================= GET MY CHATS =================
router.get("/", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      members: { $in: [req.user.id] },
    })
      .populate("members", "name profilePic")
      .sort({ updatedAt: -1 });

    // 🔹 Convert Map to Object for JSON response (important fix)
    const chatsWithUnreadCounts = chats.map((chat) => {
      const chatObj = chat.toObject();
      if (chatObj.unreadCounts instanceof Map) {
        chatObj.unreadCounts = Object.fromEntries(chatObj.unreadCounts);
      }
      return chatObj;
    });

    res.json(chatsWithUnreadCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to load chats" });
  }
});

module.exports = router;
