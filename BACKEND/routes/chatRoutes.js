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

  res.json(chats);
});

module.exports = router;
