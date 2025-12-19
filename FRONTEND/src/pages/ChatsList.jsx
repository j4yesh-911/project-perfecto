import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ChatsList() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
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
        const currentUserId = meRes.data._id;

        // Get user's chats
        const chatsRes = await API.get(`/chats/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // For each chat, get the other user and last message
        const chatsWithUsers = await Promise.all(
          chatsRes.data.map(async (chat) => {
            const otherUserId = chat.members.find(id => id !== currentUserId);
            const userRes = await API.get(`/users/${otherUserId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            // Get last message
            const messagesRes = await API.get(`/messages/${chat._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const lastMessage = messagesRes.data[messagesRes.data.length - 1];

            return {
              ...chat,
              otherUser: userRes.data,
              lastMessage
            };
          })
        );

        setChats(chatsWithUsers);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [navigate]);

  const handleChatClick = (userId) => {
    navigate(`/chat/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-black via-slate-900 to-black">
        Loading chats...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black via-slate-900 to-black text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-neon">My Chats</h1>
        </div>

        <div className="glass p-6 rounded-2xl">
          {chats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No chats yet</p>
              <p className="text-gray-500">Start a conversation by messaging someone from the dashboard!</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-lg font-semibold hover:opacity-90 transition text-white"
              >
                Find People to Chat
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => handleChatClick(chat.otherUser._id)}
                  className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                >
                  <img
                    src={chat.otherUser.profilePic || "https://ui-avatars.com/api/?name=" + encodeURIComponent(chat.otherUser.name)}
                    alt={chat.otherUser.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-neon">{chat.otherUser.username || chat.otherUser.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {chat.lastMessage ? (
                        <>
                          {chat.lastMessage.senderId === chat.members.find(id => id !== chat.otherUser._id) ? 'You: ' : ''}
                          {chat.lastMessage.text}
                        </>
                      ) : (
                        'No messages yet'
                      )}
                    </p>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {chat.lastMessage && new Date(chat.lastMessage.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}