import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { socket } from "../services/socket";

export default function Chat() {
  const { userId } = useParams(); // The other user's ID from URL
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Get current user
        const meRes = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(meRes.data);

        // Get chat user
        const userRes = await API.get(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChatUser(userRes.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        navigate("/dashboard");
      }
    };

    if (userId) {
      fetchUsers();
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (currentUser) {
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
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && chatUser) {
      const initChat = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await API.post("/chats", {
            senderId: currentUser._id,
            receiverId: chatUser._id,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setChatId(res.data._id);

          const msgs = await API.get(`/messages/${res.data._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(msgs.data);
        } catch (err) {
          console.error("Chat init error:", err);
        }
      };

      initChat();
    }
  }, [currentUser, chatUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !currentUser || !chatUser) return;

    socket.emit("sendMessage", {
      senderId: currentUser._id,
      receiverId: chatUser._id,
      text,
    });

    try {
      const token = localStorage.getItem("token");
      await API.post("/messages", {
        chatId,
        senderId: currentUser._id,
        text,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages((prev) => [
        ...prev,
        { senderId: currentUser._id, text, _id: Date.now() },
      ]);
      setText("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  if (!currentUser || !chatUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-black via-slate-900 to-black">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-neon">Chat with {chatUser.username}</h1>
        </div>

        <div className="glass p-6 rounded-2xl">
          <div className="h-96 overflow-y-auto mb-4 p-4 bg-black/20 rounded-lg">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={m._id || i}
                  className={`mb-4 flex ${m.senderId === currentUser._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      m.senderId === currentUser._id
                        ? 'bg-neon text-black'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.createdAt && (
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(m.createdAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-4">
            <input
              className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-lg font-semibold hover:opacity-90 transition text-white"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
