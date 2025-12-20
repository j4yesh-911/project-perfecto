import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getSocket } from "../services/socket";
import { useUnreadMessages } from "../context/UnreadMessagesContext";

export default function ChatsList() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const { chatsUnreadCounts } = useUnreadMessages();

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
                  },
                  updatedAt: message.createdAt || new Date().toISOString(),
                  members: c.members.map(u => u._id === message.sender ? { ...u, lastSeen: new Date() } : u),
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

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, []);

  return (
    <div className="min-h-screen dark:bg-black dark:text-white light:bg-white light:text-black p-6">
      <h1 className="text-3xl mb-6 font-bold">Chats</h1>

      {chats.length === 0 && (
        <p className="text-gray-400">No chats yet</p>
      )}

      {chats.map((chat) => {
        const otherUser = chat.members.find(
          (u) => u._id !== myId
        );

        const unread = chatsUnreadCounts[chat._id] || 0;
        const previewText = unread > 4 ? "4+ messages" : chat.lastMessage?.text || "Start a conversation";

        return (
          <div
            key={chat._id}
            onClick={() => navigate(`/chat/${chat._id}`)}
            className="flex items-center gap-4 p-4 dark:hover:bg-white/10 light:hover:bg-gray-100 rounded-lg cursor-pointer relative"
          >
            <img
              src={otherUser?.profilePic || "/avatar.png"}
              className="w-12 h-12 rounded-full"
            />

            <div className="flex-1">
              <p className="font-semibold">{otherUser?.name}</p>
              <p className="text-xs dark:text-gray-500 light:text-gray-400">
                Last seen {otherUser?.lastSeen ? new Date(otherUser.lastSeen).toLocaleString() : 'never'}
              </p>
              <p className="text-sm dark:text-gray-400 light:text-gray-600 truncate">
                {previewText}
              </p>
            </div>

            {unread > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unread > 4 ? "4+" : unread}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
