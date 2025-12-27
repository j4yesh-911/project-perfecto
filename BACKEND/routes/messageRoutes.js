const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const auth = require("../middleware/authMiddleware");

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/audio"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Keep original extension to maintain format compatibility
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

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
    isDeleted: false,
  }).sort({ createdAt: 1 });

  res.json(messages);
});

// Mark messages as read by current user
router.post("/:chatId/read", auth, async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (chat) {
    chat.unreadCounts.set(req.user.id.toString(), 0);
    await chat.save();
  }

  // Update message status to seen for messages from other users
  await Message.updateMany(
    {
      chatId: req.params.chatId,
      sender: { $ne: req.user.id },
      status: { $ne: "seen" }
    },
    {
      status: "seen",
      $addToSet: {
        readBy: {
          userId: req.user.id,
          readAt: new Date()
        }
      }
    }
  );

  res.status(200).json({ success: true });
});

// Get message read status
router.get("/:messageId/status", auth, async (req, res) => {
  const message = await Message.findById(req.params.messageId).populate('readBy.userId', 'name profilePic');
  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  res.json({
    _id: message._id,
    status: message.status,
    readBy: message.readBy || [],
    createdAt: message.createdAt
  });
});

// Upload voice message
router.post("/upload", auth, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const audioUrl = `/uploads/audio/${req.file.filename}`;

    res.status(201).json({
      audioUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload audio file" });
  }
});

module.exports = router;
