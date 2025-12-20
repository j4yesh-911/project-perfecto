import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../services/socket";
import VideoRoom from "../components/VideoRoom";

export default function Chat() {
  const { chatId } = useParams();
  const socket = getSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [videoOpen, setVideoOpen] = useState(false);
  const bottomRef = useRef(null);

  const myId = JSON.parse(
    atob(localStorage.getItem("token").split(".")[1])
  ).id;

  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", chatId);

    const handler = (msg) => {
      if (!msg || msg.chatId !== chatId) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("receiveMessage", handler);

    return () => socket.off("receiveMessage", handler);
  }, [chatId]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/messages/${chatId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(setMessages);
  }, [chatId]);

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
    <div className="h-screen bg-black text-white flex flex-col">
      {videoOpen && <VideoRoom isCaller={true} />}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => {
          const isMine = String(m.sender) === String(myId);
          return (
            <div
              key={m._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  isMine ? "bg-blue-500" : "bg-white/10"
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
        <button
          onClick={() => setVideoOpen(true)}
          className="px-4 bg-green-500 rounded-lg"
        >
          📹
        </button>

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
