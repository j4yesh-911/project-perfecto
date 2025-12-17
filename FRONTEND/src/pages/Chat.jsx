import { useEffect, useState } from "react";
import { socket } from "../services/socket";
import api from "../services/api";

const Chat = () => {
  // ✅ USERS FROM LOCAL STORAGE (REQUIRED)
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const friend = JSON.parse(localStorage.getItem("chatUser"));

  if (!currentUser || !friend) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-black">
        No chat selected
      </div>
    );
  }

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatId, setChatId] = useState(null);

  // ✅ SOCKET CONNECTION
  useEffect(() => {
    socket.emit("addUser", currentUser._id);

    socket.on("getMessage", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          senderId: data.senderId,
          text: data.text,
        },
      ]);
    });

    return () => {
      socket.off("getMessage");
    };
  }, [currentUser._id]);

  // ✅ CREATE CHAT & LOAD OLD MESSAGES
  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await api.post("/chats", {
          senderId: currentUser._id,
          receiverId: friend._id,
        });

        setChatId(res.data._id);

        const msgs = await api.get(`/messages/${res.data._id}`);
        setMessages(msgs.data);
      } catch (err) {
        console.error("Chat init error:", err);
      }
    };

    initChat();
  }, [currentUser._id, friend._id]);

  // ✅ SEND MESSAGE
  const sendMessage = async () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      senderId: currentUser._id,
      receiverId: friend._id,
      text,
    });

    try {
      await api.post("/messages", {
        chatId,
        senderId: currentUser._id,
        text,
      });

      setMessages((prev) => [
        ...prev,
        { senderId: currentUser._id, text },
      ]);
      setText("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* HEADER */}
      <div className="p-3 border-b border-gray-700">
        Chat with <b>{friend.username}</b>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${
              m.senderId === currentUser._id ? "text-right" : "text-left"
            }`}
          >
            <span className="bg-blue-600 px-3 py-1 rounded-xl inline-block">
              {m.text}
            </span>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex p-2 border-t border-gray-700">
        <input
          className="flex-1 bg-gray-800 p-2 rounded outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 bg-blue-600 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
