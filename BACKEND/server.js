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

const app = express();
const server = http.createServer(app);

// 🔥 CONNECT DATABASE
connectDB();

// 🔥 MIDDLEWARES
app.use(cors());
app.use(express.json());

// 🔥 ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

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
