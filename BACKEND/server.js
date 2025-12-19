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

const app = express();
const server = http.createServer(app);

// 🔥 CONNECT DATABASE
connectDB();

// 🔥 MIDDLEWARES
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


// 🔥 ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/likes", likeRoutes);

// 🔍 DEBUG
app._router.stack.forEach((layer) => {
  if (layer.route) {
    console.log(
      Object.keys(layer.route.methods)[0].toUpperCase(),
      layer.route.path
    );
  }
});

// 🔥 SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Add user to online users
  socket.on("addUser", (userId) => {
    // You can implement online users tracking here if needed
    console.log(`User ${userId} is online`);
  });

  // Send message
  socket.on("sendMessage", async (data) => {
    try {
      const { senderId, receiverId, text } = data;
      
      // Find or create chat
      const Chat = require("./models/Chat");
      let chat = await Chat.findOne({
        members: { $all: [senderId, receiverId] }
      });
      
      if (!chat) {
        chat = new Chat({
          members: [senderId, receiverId],
        });
        await chat.save();
      }
      
      // Save message
      const Message = require("./models/Message");
      const newMessage = new Message({
        chatId: chat._id,
        senderId,
        text,
      });
      const savedMessage = await newMessage.save();
      
      // Emit to receiver
      socket.broadcast.emit("getMessage", {
        senderId,
        text,
      });
    } catch (error) {
      console.error("Socket message error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// 🔥 START SERVER
server.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});


app._router.stack.forEach((layer) => {
  if (layer.route) {
    console.log(
      Object.keys(layer.route.methods)[0].toUpperCase(),
      layer.route.path
    );
  }
});
