const router = require("express").Router();
const Chat = require("../models/Chat");

// create chat
router.post("/", async (req, res) => {
  const newChat = new Chat({
    members: [req.body.senderId, req.body.receiverId],
  });

  const savedChat = await newChat.save();
  res.status(200).json(savedChat);
});

// get user chats
router.get("/:userId", async (req, res) => {
  const chats = await Chat.find({
    members: { $in: [req.params.userId] },
  });
  res.status(200).json(chats);
});

module.exports = router;
