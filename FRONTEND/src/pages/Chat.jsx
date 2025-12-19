import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { socket } from "../services/socket";

export default function Chat() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // join socket room
  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", chatId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, [chatId]);

  // load old messages
  useEffect(() => {
    if (!chatId) return;

    const loadMessages = async () => {
      const res = await API.get(`/messages/${chatId}`);
      setMessages(res.data);
    };

    loadMessages();
  }, [chatId]);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await API.post("/messages", {
      chatId,
      text,
    });

    socket.emit("sendMessage", res.data);
    setMessages((prev) => [...prev, res.data]);
    setText("");
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m._id} className="mb-2">
            <div className="inline-block bg-white/10 px-4 py-2 rounded-lg">
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 flex gap-2 border-t border-white/10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-3 rounded-lg bg-white/10"
          placeholder="Message…"
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
