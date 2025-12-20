import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../services/socket";
import VideoRoom from "../components/VideoRoom";
import { useUnreadMessages } from "../context/UnreadMessagesContext";

export default function Chat() {
  const { chatId } = useParams();
  const socket = getSocket();
  const { markChatAsRead } = useUnreadMessages();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [videoOpen, setVideoOpen] = useState(false);
  const [isCaller, setIsCaller] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
        const newMessages = [...prev, msg];
        // Mark as delivered
        fetch(`http://localhost:5000/api/messages/delivered`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ messageIds: [msg._id] }),
        });
        return newMessages;
      });
    };

    socket.on("receiveMessage", handler);

    // Incoming call
    const callHandler = () => {
      setIsCaller(false);
      setVideoOpen(true);
    };

    socket.on("webrtcOffer", callHandler);

    // Typing indicators
    const typingStartHandler = (data) => {
      if (data.chatId === chatId && data.userId !== myId) {
        setOtherUserTyping(true);
      }
    };

    const typingStopHandler = (data) => {
      if (data.chatId === chatId && data.userId !== myId) {
        setOtherUserTyping(false);
      }
    };

    socket.on("typingStart", typingStartHandler);
    socket.on("typingStop", typingStopHandler);

    // Message status updates
    const statusUpdateHandler = (data) => {
      if (data.chatId === chatId) {
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg._id) ? { ...msg, status: data.status } : msg
          )
        );
      }
    };

    socket.on("messageStatusUpdate", statusUpdateHandler);

    return () => {
      socket.off("receiveMessage", handler);
      socket.off("webrtcOffer", callHandler);
      socket.off("typingStart", typingStartHandler);
      socket.off("typingStop", typingStopHandler);
      socket.off("messageStatusUpdate", statusUpdateHandler);
      stopTyping(); // Stop typing when leaving chat
    };
  }, [chatId]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/messages/${chatId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(setMessages)
      .then(() => {
        // Mark as read
        fetch(`http://localhost:5000/api/messages/${chatId}/read`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        // Update global unread count
        markChatAsRead(chatId);
      });
  }, [chatId, markChatAsRead]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      chatId,
      text,
    });

    setText("");
    stopTyping();
  };

  const startTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typingStart", { chatId, userId: myId });
    }
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Set new timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(stopTyping, 3000);
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socket.emit("typingStop", { chatId, userId: myId });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    startTyping();
  };

  return (
    <div className="h-screen dark:bg-black dark:text-white light:bg-white light:text-black flex flex-col">
      {videoOpen && <VideoRoom isCaller={isCaller} onEnd={() => setVideoOpen(false)} />}

      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed'
        }}
      >
        {messages.map((m) => {
          const isMine = String(m.sender) === String(myId);
          const isSystem = m.type === 'system';
          
          if (isSystem) {
            return (
              <div key={m._id} className="flex justify-center my-2">
                <div className="px-3 py-1 rounded-full bg-gray-500/80 backdrop-blur-sm text-white text-sm text-center max-w-xs">
                  {m.text}
                </div>
              </div>
            );
          }
          
          return (
            <div
              key={m._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs backdrop-blur-sm ${
                  isMine ? "bg-blue-500/90 text-white" : "dark:bg-white/20 dark:text-white light:bg-gray-200/90 light:text-black"
                }`}
              >
                {m.text}
                {isMine && (
                  <div className="flex justify-end mt-1">
                    {m.status === 'sent' && <span className="text-gray-400">✓</span>}
                    {m.status === 'delivered' && <span className="text-gray-400">✓✓</span>}
                    {m.status === 'read' && <span className="text-blue-400">✓✓</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {otherUserTyping && (
        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic bg-black/20 backdrop-blur-sm rounded-lg mx-4">
          typing...
        </div>
      )}

      <div className="p-4 flex gap-2 dark:border-t dark:border-white/10 light:border-t light:border-gray-300">
        <button
          onClick={() => setVideoOpen(true)}
          className="px-4 bg-green-500 rounded-lg"
        >
          📹
        </button>

        <input
          id="message-input"
          name="message"
          value={text}
          onChange={handleInputChange}
          className="flex-1 p-3 rounded-lg dark:bg-white/10 dark:text-white light:bg-gray-100 light:text-black"
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
