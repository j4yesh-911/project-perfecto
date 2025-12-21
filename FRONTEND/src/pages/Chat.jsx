import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "../services/socket";
import VideoRoom from "../components/VideoRoom";

export default function Chat() {
  const { chatId } = useParams();
  const socket = getSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [videoOpen, setVideoOpen] = useState(false);
  const bottomRef = useRef(null);

  const myId = JSON.parse(
    atob(window.localStorage.getItem("token").split(".")[1])
  ).id;

  const userBg = window.localStorage.getItem("chat_bg");

  /* SOCKET */
  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", chatId);

    const handler = (msg) => {
      if (!msg || msg.chatId !== chatId) return;
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    };

    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [chatId]);

  /* FETCH OLD MESSAGES */
  useEffect(() => {
    fetch(`http://localhost:5000/api/messages/${chatId}`, {
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(setMessages);
  }, [chatId]);

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      chatId,
      senderId: myId,
      text,
    });

    setText("");
  };

  return (
    <div
      className="h-screen w-full flex flex-col text-white relative"
      style={
        userBg
          ? {
              backgroundImage: `url(${userBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {
              background:
                "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
            }
      }
    >
      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/chats")}
        className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-white/10 
                   hover:bg-white/20 active:scale-95 transition-all duration-200
                   flex items-center justify-center"
      >
        ←
      </button>

      {/* VIDEO ROOM */}
      {videoOpen && (
        <VideoRoom isCaller={true} onClose={() => setVideoOpen(false)} />
      )}

      {/* MESSAGES */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <AnimatePresence>
          {messages.map((m) => {
            const isMine = String(m.sender) === String(myId);
            return (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex mb-3 ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-xl text-sm ${
                    isMine
                      ? "bg-slate-600"
                      : "bg-white/10 backdrop-blur"
                  }`}
                >
                  {m.text}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div className="relative z-10 px-4 py-3 border-t border-white/10 bg-black/40 backdrop-blur">
        <div className="flex items-center gap-3">
          {/* VIDEO BUTTON */}
          <button
            onClick={() => setVideoOpen(true)}
            className="w-11 h-11 rounded-lg bg-emerald-500/80 
                       hover:bg-emerald-500 hover:scale-105 
                       active:scale-95 transition-all duration-200
                       flex items-center justify-center"
          >
            📹
          </button>

          {/* INPUT */}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message…"
            className="flex-1 bg-white/10 px-4 py-3 rounded-lg outline-none
                       focus:ring-2 focus:ring-slate-500 transition-all duration-200"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          {/* SEND ARROW (ONLY WHEN TEXT EXISTS) */}
          <AnimatePresence>
            {text.trim() && (
              <motion.button
                key="send-arrow"
                onClick={sendMessage}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="w-11 h-11 rounded-lg
                           bg-blue-500/80 backdrop-blur
                           hover:bg-blue-500
                           hover:shadow-lg hover:shadow-blue-500/30
                           hover:scale-110
                           active:scale-95
                           transition-all duration-200
                           flex items-center justify-center
                           font-bold"
              >
                ➤
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
