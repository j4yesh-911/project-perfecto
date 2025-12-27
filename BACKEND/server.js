const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const likeRoutes = require("./routes/likeRoutes");
const swapRoutes = require("./routes/swapRoutes");

const Message = require("./models/Message");
const Chat = require("./models/Chat");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);

// ================= DB =================
connectDB();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "..")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, path) => {
    if (path.endsWith('.wav')) {
      res.setHeader('Content-Type', 'audio/wav');
    } else if (path.endsWith('.webm')) {
      res.setHeader('Content-Type', 'audio/webm');
    } else if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'audio/mp4');
    } else if (path.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    }
  }
}));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/swaps", swapRoutes);

// ================= SOCKET =================
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
    ],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // -------- AUTH --------
  socket.on("authenticate", (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      console.log("✅ Socket authenticated:", socket.userId);
    } catch {
      console.log("❌ Socket authentication failed");
    }
  });

  // -------- JOIN CHAT --------
  socket.on("joinChat", async (chatId) => {
    if (!socket.userId) return;
    socket.join(chatId);

    // Reset unread count safely
    await Chat.findByIdAndUpdate(chatId, {
      $set: { [`unreadCounts.${socket.userId}`]: 0 },
    });

    io.to(chatId).emit("unreadCountUpdate", {
      chatId,
      userId: socket.userId,
      unreadCount: 0,
    });

    // Mark messages as seen
    const unseen = await Message.find({
      chatId,
      sender: { $ne: socket.userId },
      status: { $ne: "seen" },
    }).select("_id");

    if (unseen.length) {
      await Message.updateMany(
        { _id: { $in: unseen.map((m) => m._id) } },
        { status: "seen" }
      );

      io.to(chatId).emit("messageStatusUpdate", {
        chatId,
        messageIds: unseen.map((m) => m._id.toString()),
        status: "seen",
      });
    }
  });

  // -------- TYPING --------
  socket.on("typing", async ({ chatId }) => {
    if (!socket.userId) return;

    await Chat.findByIdAndUpdate(chatId, {
      $addToSet: { typingUsers: socket.userId },
    });

    socket.to(chatId).emit("typing", {
      chatId,
      userId: socket.userId,
    });

    setTimeout(async () => {
      await Chat.findByIdAndUpdate(chatId, {
        $pull: { typingUsers: socket.userId },
      });
    }, 3000);
  });

  socket.on("stopTyping", async ({ chatId }) => {
    if (!socket.userId) return;

    await Chat.findByIdAndUpdate(chatId, {
      $pull: { typingUsers: socket.userId },
    });

    socket.to(chatId).emit("stopTyping", {
      chatId,
      userId: socket.userId,
    });
  });

  // -------- SEND MESSAGE --------
  socket.on("sendMessage", async ({ chatId, text, type, audioUrl }) => {
    if (!socket.userId) return;

    const senderId = socket.userId;

    const messageData = {
      chatId,
      sender: senderId,
      type: type || "text",
      status: "sent",
    };

    if (type === "voice") {
      messageData.audioUrl = audioUrl;
    } else {
      messageData.text = text;
    }

    const message = await Message.create(messageData);

    await User.findByIdAndUpdate(senderId, { lastSeen: new Date() });

    const chat = await Chat.findById(chatId).select("members");
    const receiverId = chat.members.find(
      (m) => m.toString() !== senderId
    );

    // Increment unread safely
    await Chat.findByIdAndUpdate(chatId, {
      $inc: { [`unreadCounts.${receiverId}`]: 1 },
      $set: {
        lastMessage: {
          text: type === "voice" ? "Voice message" : text,
          sender: senderId
        },
        updatedAt: Date.now(),
      },
    });

    // Emit to sender
    socket.emit("receiveMessage", {
      _id: message._id,
      chatId,
      sender: senderId,
      text: type === "voice" ? null : text,
      audioUrl: type === "voice" ? audioUrl : null,
      type: type || "text",
      status: "sent",
      createdAt: message.createdAt,
    });

    // Delivered
    await Message.findByIdAndUpdate(message._id, {
      status: "delivered",
    });

    socket.emit("messageStatusUpdate", {
      chatId,
      messageId: message._id.toString(),
      status: "delivered",
    });

    // Emit to receiver
    socket.to(chatId).emit("receiveMessage", {
      _id: message._id,
      chatId,
      sender: senderId,
      text: type === "voice" ? null : text,
      audioUrl: type === "voice" ? audioUrl : null,
      type: type || "text",
      createdAt: message.createdAt,
    });
  });

  // -------- MARK SEEN --------
  socket.on("markMessagesAsSeen", async ({ chatId }) => {
    if (!socket.userId) return;

    const msgs = await Message.find({
      chatId,
      sender: { $ne: socket.userId },
      status: { $ne: "seen" },
    }).select("_id");

    if (msgs.length) {
      await Message.updateMany(
        { _id: { $in: msgs.map((m) => m._id) } },
        { status: "seen" }
      );

      io.to(chatId).emit("messageStatusUpdate", {
        chatId,
        messageIds: msgs.map((m) => m._id.toString()),
        status: "seen",
      });
    }
  });

  // -------- UNSEND --------
  socket.on("unsendMessage", async ({ chatId, messageId }) => {
    const msg = await Message.findById(messageId);
    if (!msg || msg.sender.toString() !== socket.userId) return;

    msg.isDeleted = true;
    msg.deletedAt = new Date();
    await msg.save();

    io.to(chatId).emit("messageDeleted", {
      chatId,
      messageId,
      isDeleted: true,
    });
  });

  // -------- WEBRTC --------
  socket.on("webrtcOffer", ({ chatId, offer }) =>
    socket.to(chatId).emit("webrtcOffer", offer)
  );
  socket.on("webrtcAnswer", ({ chatId, answer }) =>
    socket.to(chatId).emit("webrtcAnswer", answer)
  );
  socket.on("iceCandidate", ({ chatId, candidate }) =>
    socket.to(chatId).emit("iceCandidate", candidate)
  );
  socket.on("callEnd", ({ chatId }) =>
    socket.to(chatId).emit("callEnd")
  );
  socket.on("callDeclined", ({ chatId }) =>
    socket.to(chatId).emit("callDeclined")
  );
});

// ================= START SERVER =================
server.listen(5000, () => {
  console.log("🚀 Backend running on http://localhost:5000");
});

module.exports = { io };
