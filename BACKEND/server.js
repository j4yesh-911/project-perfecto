const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const likeRoutes = require("./routes/likeRoutes");

const Message = require("./models/Message");
const Chat = require("./models/Chat");

const app = express();
const server = http.createServer(app);

connectDB();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/likes", likeRoutes);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 socket connected", socket.id);

  socket.on("joinChat", (chatId) => {
    console.log("👥 joinChat", chatId);
    socket.join(chatId);
  });




socket.on("webrtcOffer", ({ chatId, offer }) => {
  socket.to(chatId).emit("webrtcOffer", offer);
});

socket.on("webrtcAnswer", ({ chatId, answer }) => {
  socket.to(chatId).emit("webrtcAnswer", answer);
});

socket.on("iceCandidate", ({ chatId, candidate }) => {
  socket.to(chatId).emit("iceCandidate", candidate);
});








  socket.on("sendMessage", async ({ chatId, senderId, text }) => {
    console.log("📨 sendMessage", { chatId, senderId, text });

    const message = await Message.create({
      chatId,
      sender: senderId,
      text,
    });

    console.log("💾 saved message", message._id);

    io.to(chatId).emit("receiveMessage", {
      _id: message._id,
      chatId,
      sender: senderId,
      text,
      createdAt: message.createdAt,
    });

    console.log("📤 emitted to room", chatId);
  });
});

server.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
