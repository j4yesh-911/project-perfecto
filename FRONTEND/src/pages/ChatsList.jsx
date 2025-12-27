import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { getSocket } from "../services/socket";
import { useTheme } from "../context/ThemeContext";

export default function ChatsList() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const { dark } = useTheme();

  const socket = getSocket();

  const myId = JSON.parse(
    atob(localStorage.getItem("token").split(".")[1])
  ).id;

  useEffect(() => {
    // load initial chats
    const loadChats = async () => {
      const res = await API.get("/chats");
      setChats(res.data);
    };
    loadChats();

    // realtime last-message update
    const handleReceive = (message) => {
      if (!message || !message.chatId) return;

      setChats((prev) => {
        const exists = prev.some((c) => c._id === message.chatId);

        if (exists) {
          const updated = prev.map((c) =>
            c._id === message.chatId
              ? {
                  ...c,
                  lastMessage: {
                    text: message.text,
                    sender: message.sender,
                    isDeleted: message.isDeleted || false,
                  },
                  updatedAt: message.createdAt || new Date().toISOString(),
                }
              : c
          );

          // sort like Instagram (latest on top)
          return updated.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        }

        // new chat → reload list
        API.get("/chats").then((res) => setChats(res.data));
        return prev;
      });
    };

    // Handle unread count updates
    const handleUnreadUpdate = ({ chatId, userId, unreadCount }) => {
      if (userId !== myId) return;
      
      setChats((prev) =>
        prev.map((c) => {
          if (c._id === chatId) {
            const updated = { ...c };
            if (!updated.unreadCounts) {
              updated.unreadCounts = {};
            }
            if (typeof updated.unreadCounts === 'object' && !Array.isArray(updated.unreadCounts)) {
              updated.unreadCounts[userId] = unreadCount;
            }
            return updated;
          }
          return c;
        })
      );
    };

    // Handle message deletion - reload chats to get updated last message
    const handleMessageDeleted = async ({ chatId }) => {
      // Reload chats to get the updated last message after deletion
      const res = await API.get("/chats");
      setChats(res.data);
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("unreadCountUpdate", handleUnreadUpdate);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("unreadCountUpdate", handleUnreadUpdate);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket, myId]);

  // Format last message time
  const formatLastSeen = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className={`min-h-screen p-6 ${
      dark 
        ? "bg-gradient-to-br from-slate-900 via-slate-900 to-black text-white" 
        : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-black"
    }`}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl mb-2 font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Messages
        </h1>
        <p className={`text-sm mb-6 ${dark ? "text-gray-400" : "text-gray-600"}`}>
          {chats.length} conversation{chats.length !== 1 ? "s" : ""}
        </p>

        {chats.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-12 rounded-xl backdrop-blur ${
              dark 
                ? "bg-white/5 text-gray-400" 
                : "bg-black/5 text-gray-600"
            }`}
          >
            <p className="text-lg">💬 No chats yet</p>
            <p className="text-sm mt-1">Start a conversation to begin messaging</p>
          </motion.div>
        )}

        <AnimatePresence>
          {chats.map((chat, index) => {
            const otherUser = chat.members.find((u) => u._id !== myId);

            // Get unread count for current user
            const unreadCount =
              chat.unreadCounts?.get?.(myId) ||
              (typeof chat.unreadCounts === "object" &&
                chat.unreadCounts[myId]) ||
              0;

            const isDeleted = chat.lastMessage?.isDeleted || false;
            const lastMessagePreview = chat.lastMessage?.text || "Start a conversation";

            return (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/chat/${chat._id}`)}
                className={`flex items-center gap-4 p-4 mb-3 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                  dark
                    ? `${unreadCount > 0 ? "bg-white/10 border border-blue-500/30" : "bg-white/5 border border-white/10 hover:bg-white/[0.08]"}`
                    : `${unreadCount > 0 ? "bg-blue-100/40 border border-blue-300/50" : "bg-white/50 border border-black/10 hover:bg-black/5"}`
                }`}
              >
                {/* Animated gradient border for unread */}
                {unreadCount > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                {/* Avatar */}
                <div className="relative z-10">
                 <img
  src={
    otherUser?.profilePic && otherUser.profilePic.trim() !== ""
      ? otherUser.profilePic
      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF02Jj8T2t7PdkytAw42HDuuSz7yXguKn8Lg&s"
  }
  alt={otherUser?.name || "User"}
  onError={(e) => {
    e.currentTarget.src =
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF02Jj8T2t7PdkytAw42HDuuSz7yXguKn8Lg&s";
  }}
  className="w-14 h-14 rounded-full object-cover"
/>

                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-semibold truncate ${
                      unreadCount > 0 && !dark ? "text-black font-bold" : ""
                    }`}>
                      {otherUser?.name}
                    </p>
                    <span className="text-xs whitespace-nowrap">
                      {formatLastSeen(chat.updatedAt)}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      isDeleted
                        ? dark
                          ? "text-gray-500 italic"
                          : "text-gray-500 italic"
                        : unreadCount > 0
                        ? dark
                          ? "text-white font-medium"
                          : "text-black/80 font-medium"
                        : dark
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    {isDeleted ? "🗑️ " : ""}{lastMessagePreview}
                  </p>
                </div>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="relative z-10"
                  >
                    <div className="flex items-center justify-center min-w-[28px] h-7 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50 ring-2 ring-white/20">
                      <span className="text-white text-xs font-bold">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur-lg"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}