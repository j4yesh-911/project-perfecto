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

  socket.on("joinChat", async (chatId) => {
    console.log("👥 joinChat", chatId);
    socket.join(chatId);
    
    // Mark all messages in this chat as seen when user opens the chat
    // Reset unread count for this user
    if (socket.userId) {
      const chat = await Chat.findById(chatId);
      if (chat) {
        // Reset unread count for this user
        chat.unreadCounts.set(socket.userId.toString(), 0);
        await chat.save();
        
        // Emit unread count update
        io.to(chatId).emit("unreadCountUpdate", {
          chatId,
          userId: socket.userId.toString(),
          unreadCount: 0
        });
        
        // Find all messages sent to this user in this chat that are not yet seen
        const unseenMessages = await Message.find({
          chatId,
          sender: { $ne: socket.userId },
          status: { $ne: "seen" }
        });

        if (unseenMessages.length > 0) {
          // Update status to seen
          await Message.updateMany(
            {
              chatId,
              sender: { $ne: socket.userId },
              status: { $ne: "seen" }
            },
            { status: "seen" }
          );
          
          // Emit status update to sender
          io.to(chatId).emit("messageStatusUpdate", {
            chatId,
            messageIds: unseenMessages.map(m => m._id.toString()),
            status: "seen"
          });
        }
      }
    }
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

socket.on("typing", async ({ chatId }) => {
  if (!socket.userId) return;
  
  // Add user to typing list
  const chat = await Chat.findById(chatId);
  if (chat && !chat.typingUsers.includes(socket.userId)) {
    chat.typingUsers.push(socket.userId);
    await chat.save();
  }
  
  // Broadcast typing event with user info
  socket.to(chatId).emit("typing", { chatId, userId: socket.userId });
  
  // Auto-remove from typing after 5 seconds if no new event
  setTimeout(async () => {
    const updatedChat = await Chat.findById(chatId);
    if (updatedChat) {
      updatedChat.typingUsers = updatedChat.typingUsers.filter(
        u => u.toString() !== socket.userId.toString()
      );
      await updatedChat.save();
    }
  }, 5000);
});

socket.on("stopTyping", async ({ chatId }) => {
  if (!socket.userId) return;
  
  // Remove user from typing list
  const chat = await Chat.findById(chatId);
  if (chat) {
    chat.typingUsers = chat.typingUsers.filter(
      u => u.toString() !== socket.userId.toString()
    );
    await chat.save();
  }
  
  socket.to(chatId).emit("stopTyping", { chatId, userId: socket.userId });
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
      status: "sent",
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
      
      // Emit unread count update to receiver
      io.to(chatId).emit("unreadCountUpdate", {
        chatId,
        userId: otherMember.toString(),
        unreadCount: currentUnread + 1
      });
    }

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text,
        sender: senderId,
      },
      updatedAt: Date.now(),
    });

    // Emit to sender with "sent" status (so they see their message immediately)
    socket.emit("receiveMessage", {
      _id: message._id,
      chatId,
      sender: senderId,
      text,
      type: "user",
      status: "sent",
      createdAt: message.createdAt,
    });

    // Update message to "delivered" and emit to receiver (receiver doesn't need status)
    await Message.findByIdAndUpdate(
      message._id,
      { status: "delivered" },
      { new: true }
    );

    // Emit to receiver (they don't need status field)
    socket.to(chatId).emit("receiveMessage", {
      _id: message._id,
      chatId,
      sender: senderId,
      text,
      type: "user",
      createdAt: message.createdAt,
    });

    // Emit status update to sender to change from "sent" to "delivered"
    socket.emit("messageStatusUpdate", {
      chatId,
      messageId: message._id.toString(),
      status: "delivered"
    });

    console.log("📤 Message emitted to room", chatId, "with data:", {
      _id: message._id,
      chatId,
      sender: senderId,
      text,
      type: "user",
      status: "delivered"
    });
  });

  // Handle message seen status update - improved version
  socket.on("markMessagesAsSeen", async ({ chatId }) => {
    if (!socket.userId) return;

    const chat = await Chat.findById(chatId);
    if (!chat) return;

    // Find messages that need to be updated
    const messagesToUpdate = await Message.find({
      chatId,
      sender: { $ne: socket.userId },
      status: { $ne: "seen" }
    }).select("_id status");

    if (messagesToUpdate.length > 0) {
      const messageIds = messagesToUpdate.map(m => m._id);
      
      // Update all messages to "seen" and add user to readBy
      await Message.updateMany(
        {
          _id: { $in: messageIds }
        },
        { 
          status: "seen",
          $addToSet: { 
            readBy: { 
              userId: socket.userId,
              readAt: new Date()
            }
          }
        }
      );

      // Emit status update to sender with double checkmark
      io.to(chatId).emit("messageStatusUpdate", {
        chatId,
        messageIds: messageIds.map(id => id.toString()),
        status: "seen"
      });
      
      console.log("✔️✔️ Messages marked as seen in chat:", chatId);
    }
  });

  // Handle unsend message - professional soft delete
  socket.on("unsendMessage", async ({ chatId, messageId }) => {
    if (!socket.userId) return;

    const message = await Message.findById(messageId);
    if (!message) return;

    // Check if user is the sender
    if (message.sender.toString() !== socket.userId.toString()) {
      console.log("❌ User is not the sender of this message");
      return;
    }

    // Check if message is older than 2 hours (optional: adjust as needed)
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const twoHours = 2 * 60 * 60 * 1000;
    
    if (messageAge > twoHours) {
      socket.emit("unsendError", { 
        messageId, 
        error: "Cannot unsend message older than 2 hours" 
      });
      return;
    }

    // Soft delete the message
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    // Emit update to all users in the chat
    io.to(chatId).emit("messageDeleted", {
      chatId,
      messageId: messageId.toString(),
      text: "🗑️ This message was deleted",
      isDeleted: true
    });

    // Update last message if this was the last message
    const chat = await Chat.findById(chatId);
    if (chat.lastMessage && chat.lastMessage.sender?.toString() === message.sender.toString()) {
      // Find the most recent non-deleted message
      const lastNonDeletedMessage = await Message.findOne({
        chatId,
        isDeleted: { $ne: true }
      }).sort({ createdAt: -1 });

      if (lastNonDeletedMessage) {
        chat.lastMessage = {
          text: lastNonDeletedMessage.text,
          sender: lastNonDeletedMessage.sender,
          isDeleted: false
        };
      } else {
        chat.lastMessage = {
          text: "Start a conversation",
          sender: null
        };
      }
      await chat.save();
    }

    console.log("🗑️ Message unsent:", messageId);
  });
});

module.exports = { io };

server.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
