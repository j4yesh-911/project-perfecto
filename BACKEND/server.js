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

const Message = require("./models/Message");
const Chat = require("./models/Chat");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);

connectDB();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve static files from parent directory (for ringtone.mp3)
app.use(express.static(path.join(__dirname, '..')));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/swaps", require("./routes/swapRoutes"));


const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 socket connected", socket.id);

  socket.on("authenticate", (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      console.log("Authenticated socket for user:", decoded.id);
    } catch (err) {
      console.log("Authentication failed", err);
      // socket.disconnect(); // Temporarily disable
    }
  });

  socket.on("joinChat", (chatId) => {
    console.log("👥 joinChat", chatId);
    socket.join(chatId);
  });




socket.on("webrtcOffer", ({ chatId, offer }) => {
  console.log("📞 WebRTC offer received for chat:", chatId);
  socket.to(chatId).emit("webrtcOffer", offer);
});

socket.on("webrtcAnswer", ({ chatId, answer }) => {
  console.log("📞 WebRTC answer received for chat:", chatId);
  socket.to(chatId).emit("webrtcAnswer", answer);
});

socket.on("iceCandidate", ({ chatId, candidate }) => {
  console.log("🧊 ICE candidate received for chat:", chatId);
  socket.to(chatId).emit("iceCandidate", candidate);
});

socket.on("callEnd", ({ chatId }) => {
  socket.to(chatId).emit("callEnd");
});

socket.on("callDeclined", async ({ chatId }) => {
  console.log("📞 Call declined for chat:", chatId);
  
  // Create a system message indicating call was declined
  const message = await Message.create({
    chatId,
    sender: socket.userId, // The person who declined the call
    text: "Call declined",
    type: "system",
  });

  // Update chat's last message
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: {
      text: "Call declined",
      sender: socket.userId,
    },
    updatedAt: Date.now(),
  });

  // Emit the decline message to the chat room
  io.to(chatId).emit("receiveMessage", {
    _id: message._id,
    chatId,
    sender: socket.userId,
    text: "Call declined",
    type: "system",
    status: message.status,
    createdAt: message.createdAt,
  });

  // Also emit the callDeclined event to end the call
  socket.to(chatId).emit("callDeclined");
});

socket.on("typingStart", ({ chatId, userId }) => {
  socket.to(chatId).emit("typingStart", { chatId, userId });
});

socket.on("typingStop", ({ chatId, userId }) => {
  socket.to(chatId).emit("typingStop", { chatId, userId });
});








  socket.on("sendMessage", async ({ chatId, text }) => {
    const senderId = socket.userId;
    if (!senderId) {
      console.log("❌ No senderId - socket not authenticated");
      return;
    }

    console.log("📨 sendMessage received", { chatId, senderId, text });

    const message = await Message.create({
      chatId,
      sender: senderId,
      text,
    });

    // Update lastSeen for sender
    await User.findByIdAndUpdate(senderId, { lastSeen: new Date() });

    console.log("💾 saved message", message._id);

    const chat = await Chat.findById(chatId);
    const otherMember = chat.members.find(m => m.toString() !== senderId.toString());
    if (otherMember) {
      const currentUnread = chat.unreadCounts.get(otherMember.toString()) || 0;
      chat.unreadCounts.set(otherMember.toString(), currentUnread + 1);
      await chat.save();
    }

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text,
        sender: senderId,
      },
      updatedAt: Date.now(),
    });

    io.to(chatId).emit("receiveMessage", {
      _id: message._id,
      chatId,
      sender: senderId,
      text,
      type: "user",
      status: message.status,
      createdAt: message.createdAt,
    });

    console.log("📤 Message emitted to room", chatId, "with data:", {
      _id: message._id,
      chatId,
      sender: senderId,
      text,
      type: "user"
    });
  });
});

module.exports = { io };

server.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
