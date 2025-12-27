import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "../services/socket";
import VideoRoom from "../components/VideoRoom";
import { useTheme } from "../context/ThemeContext";
import EmojiPicker from "emoji-picker-react";


export default function Chat() {
  const { chatId } = useParams();
  const socket = getSocket();
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [videoOpen, setVideoOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [otherUserName, setOtherUserName] = useState("");
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingIndicatorTimeoutRef = useRef(null);

  const [showEmoji, setShowEmoji] = useState(false);

const onEmojiClick = (emojiData) => {
  setText((prev) => prev + emojiData.emoji);
};


  const myId = JSON.parse(
    atob(window.localStorage.getItem("token").split(".")[1])
  ).id;

  const userBg = window.localStorage.getItem("chat_bg");

  /* JOIN CHAT SOCKET */
  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", chatId);

    const handler = (msg) => {
      if (!msg || msg.chatId !== chatId) return;
      setMessages((prev) => {
        const existingIndex = prev.findIndex((m) => m._id === msg._id);
        if (existingIndex >= 0) {
          // Update existing message
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...msg };
          return updated;
        }
        return [...prev, msg];
      });
    };

    const statusHandler = ({ chatId: statusChatId, messageIds, messageId, status }) => {
      if (statusChatId !== chatId) return;
      const ids = messageIds || (messageId ? [messageId] : []);
      if (ids.length === 0) return;
      
      setMessages((prev) =>
        prev.map((m) =>
          ids.includes(m._id) ? { ...m, status } : m
        )
      );
    };

    const typingHandler = ({ chatId: typingChatId, userId: typingUserId }) => {
      if (typingChatId !== chatId || typingUserId === myId) return;
      setIsTyping(true);
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
      }
      typingIndicatorTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    };

    const stopTypingHandler = ({ chatId: typingChatId, userId: typingUserId }) => {
      if (typingChatId !== chatId || typingUserId === myId) return;
      setIsTyping(false);
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
      }
    };

    const messageDeletedHandler = ({ chatId: deletedChatId, messageId, isDeleted }) => {
      if (deletedChatId !== chatId) return;
      setMessages((prev) =>
        prev.filter((m) => m._id !== messageId)
      );
    };

    socket.on("receiveMessage", handler);
    socket.on("messageStatusUpdate", statusHandler);
    socket.on("typing", typingHandler);
    socket.on("stopTyping", stopTypingHandler);
    socket.on("messageDeleted", messageDeletedHandler);

    return () => {
      socket.off("receiveMessage", handler);
      socket.off("messageStatusUpdate", statusHandler);
      socket.off("typing", typingHandler);
      socket.off("stopTyping", stopTypingHandler);
      socket.off("messageDeleted", messageDeletedHandler);
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
      }
    };
  }, [chatId, socket, myId]);

  /* FETCH OLD MESSAGES */
  useEffect(() => {
    fetch(`http://localhost:5000/api/messages/${chatId}`, {
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    })
    .then((res) => res.json())
.then((data) => {
  const filtered = data.filter((m) => !m.isDeleted);
  setMessages(filtered);
});

  }, [chatId]);

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* TYPING DETECTION */
  useEffect(() => {
  if (!text.trim()) {
    socket.emit("stopTyping", { chatId });
    return;
  }

  socket.emit("typing", { chatId });

  clearTimeout(typingTimeoutRef.current);

  typingTimeoutRef.current = setTimeout(() => {
    socket.emit("stopTyping", { chatId });
  }, 1500); // 👈 smoother UX

  return () => clearTimeout(typingTimeoutRef.current);
}, [text, chatId, socket]);


  const sendMessage = () => {
  const message = text.trim();
  if (!message) return;

  socket.emit("sendMessage", {
    chatId,
    senderId: myId,
    text: message,
  });

  setText("");
};


  const unsendMessage = (messageId) => {
    socket.emit("unsendMessage", {
      chatId,
      messageId,
    });
  };

  // Format time
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className="h-screen w-full flex flex-col relative"
      style={
        userBg
          ? {
              backgroundImage: `url(${userBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : dark
          ? { background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)" }
          : { background: "linear-gradient(180deg, #f8fafc 0%, #e5e7eb 100%)" }
      }
    >
      {/* OVERLAY */}
      <div
        className={`absolute inset-0 backdrop-blur-sm ${
          dark ? "bg-black/60" : "bg-white/60"
        }`}
      />

      {/* HEADER */}
      <div
        className={`relative z-10 px-4 py-4 border-b backdrop-blur flex items-center justify-between
          ${
            dark
              ? "border-white/10 bg-black/40"
              : "border-black/10 bg-white/60"
          }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/chats")}
            className="w-9 h-9 rounded-full
                     bg-white/20 hover:bg-white/30
                     active:scale-95 transition-all duration-200
                     flex items-center justify-center text-lg"
          >
            ←
          </button>
          <div>
            <h2 className={`font-semibold text-lg ${dark ? "text-white" : "text-black"}`}>
              {otherUserName}
            </h2>
            {isTyping && (
              <p className="text-xs text-blue-500">
                ✏️ typing...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <AnimatePresence>
    {messages.map((m) => {
      // 🔥 INSTAGRAM STYLE: completely remove deleted messages
      if (m.isDeleted) return null;

      const isMine = String(m.sender) === String(myId);
      const status = m.status || "sent";

      const StatusIndicator = () => {
        if (!isMine) return null;

        if (status === "seen") {
          return <span className="text-xs ml-1 text-blue-500 font-bold">✔️✔️</span>;
        } else if (status === "delivered") {
          return <span className="text-xs ml-1 text-gray-400">✔️✔️</span>;
        } else {
          return <span className="text-xs ml-1 text-gray-400">✔️</span>;
        }
      };

      return (
        <motion.div
          key={m._id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`flex mb-4 ${isMine ? "justify-end" : "justify-start"}`}
          onMouseEnter={() => isMine && setHoveredMessageId(m._id)}
          onMouseLeave={() => setHoveredMessageId(null)}
        >
          <div className="flex flex-col items-end relative group">
            <div
              className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                whitespace-pre-wrap break-words overflow-hidden
                ${
                  isMine
                    ? dark
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : dark
                    ? "bg-white/10 text-white"
                    : "bg-white/30 text-black"
                }`}
            >
              {m.text}
            </div>

            <div className="flex items-center mt-1 px-1 gap-1.5">
              <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
                {formatTime(m.createdAt)}
              </span>
              <StatusIndicator />

              {hoveredMessageId === m._id && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => unsendMessage(m._id)}
                  className="text-xs text-red-500 hover:text-red-600 opacity-70 hover:opacity-100 transition-opacity px-1.5 py-0.5 hover:bg-red-500/10 rounded"
                  title="Unsend message"
                >
                  ↩️
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      );
    })}
  </AnimatePresence>
        
        {/* TYPING INDICATOR */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex justify-start mb-4"
          >
            <div
              className={`px-4 py-2.5 rounded-2xl text-sm ${
                dark ? "bg-white/10 text-white" : "bg-black/10 text-black"
              }`}
            >
              <div className="flex gap-1 items-center">
                <span className="animate-bounce" style={{ animationDelay: '0s' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div
        className={`relative z-10 px-4 py-3 border-t backdrop-blur
          ${
            dark
              ? "border-white/10 bg-black/40"
              : "border-black/10 bg-white/60"
          }`}
      >
       <div className="flex items-center gap-3 relative">
  {/* VIDEO BUTTON */}
  <button
    onClick={() => setVideoOpen(true)}
    className="w-11 h-11 rounded-lg bg-emerald-500/80
               hover:bg-emerald-500 hover:scale-105
               active:scale-95 transition-all duration-200
               flex items-center justify-center text-lg
               shadow-lg shadow-emerald-500/30"
    title="Start video call"
  >
    📹
  </button>

  {/* EMOJI BUTTON */}
  <button
    onClick={() => setShowEmoji((p) => !p)}
    className="w-11 h-11 rounded-lg
               bg-yellow-400/80 hover:bg-yellow-400
               active:scale-95 transition-all
               flex items-center justify-center text-lg"
    title="Emoji"
  >
    😀
  </button>

  {/* EMOJI PICKER */}
  {showEmoji && (
    <div className="absolute bottom-16 left-14 z-50">
      <EmojiPicker
        theme={dark ? "dark" : "light"}
        onEmojiClick={onEmojiClick}
      />
    </div>
  )}

  {/* INPUT */}
  <input
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Write a message…"
    className={`flex-1 px-4 py-3 rounded-2xl outline-none
      ${
        dark
          ? "bg-white/10 text-white placeholder-gray-400"
          : "bg-black/10 text-black placeholder-gray-500"
      }
      focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
        setShowEmoji(false);
      }
    }}
  />

  {/* SEND BUTTON */}
  <AnimatePresence>
    {text.trim() && (
      <motion.button
        onClick={() => {
          sendMessage();
          setShowEmoji(false);
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
        className="w-11 h-11 rounded-lg
                   bg-blue-500 hover:bg-blue-600
                   hover:shadow-lg hover:shadow-blue-500/40
                   hover:scale-110 active:scale-95
                   transition-all duration-200
                   flex items-center justify-center
                   font-bold text-white text-lg"
        title="Send message"
      >
        ➤
      </motion.button>
    )}
  </AnimatePresence>
</div>

      </div>

      {/* VIDEO ROOM */}
      {videoOpen && (
        <VideoRoom isCaller={true} onClose={() => setVideoOpen(false)} />
      )}

    
    </div>
  );
}
