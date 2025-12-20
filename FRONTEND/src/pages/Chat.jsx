import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../services/socket";

export default function Chat() {
  const { chatId } = useParams();
  const socket = getSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const myId = JSON.parse(
    atob(localStorage.getItem("token").split(".")[1])
  ).id;

  // JOIN ROOM + LISTEN
  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", chatId);

    const handleReceive = (msg) => {
      if (!msg || msg.chatId !== chatId) return; // 🔥 IMPORTANT
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [chatId, socket]);

  // LOAD OLD MESSAGES
  useEffect(() => {
    fetch(`http://localhost:5000/api/messages/${chatId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data.filter(Boolean)));
  }, [chatId]);


useEffect(() => {
  if (!chatId) return;

  console.log("🟢 joining chat", chatId);
  socket.emit("joinChat", chatId);

  const handleReceive = (msg) => {
    console.log("📥 received msg", msg);

    if (!msg || msg.chatId !== chatId) return;

    setMessages((prev) => {
      const exists = prev.some((m) => m._id === msg._id);
      if (exists) return prev; // 🔥 FIX
      return [...prev, msg];
    });
  };

  socket.on("receiveMessage", handleReceive);

  return () => {
    socket.off("receiveMessage", handleReceive);
  };
}, [chatId]);



  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND MESSAGE (SOCKET ONLY)
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
    <div className="h-screen bg-black text-white flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-10">
            Start a conversation 👋
          </p>
        )}

        {messages.map((m) => {
          if (!m || !m.sender) return null;

          const isMine = String(m.sender) === String(myId);

          return (
            <div
              key={m._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  isMine
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 flex gap-2 border-t border-white/10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-3 rounded-lg bg-white/10"
          placeholder="Message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-6 bg-blue-500 rounded-lg font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}
