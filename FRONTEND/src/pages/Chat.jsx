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
      console.log("📨 Received message:", msg);
      if (!msg || msg.chatId !== chatId) {
        console.log("📨 Message filtered out - wrong chat or invalid");
        return;
      }
      console.log("📨 Adding message to state");
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

    console.log("📤 Sending message:", { chatId, senderId: myId, text });
    socket.emit("sendMessage", {
      chatId,
      senderId: myId,
      text,
    });

    setText("");
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {videoOpen && <VideoRoom isCaller={true} />}

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
            name="message"
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