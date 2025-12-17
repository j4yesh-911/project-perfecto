const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});

server.listen(5000, () => {
  console.log("Backend + Socket.IO running on port 5000");
});
