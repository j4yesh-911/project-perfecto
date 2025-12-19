import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ChatsList() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChats = async () => {
      const token = localStorage.getItem("token");
      const res = await API.get("/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data);
    };
    loadChats();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl mb-6 font-bold">Chats</h1>

      {chats.map((chat) => {
        const otherUser = chat.members[0];

        return (
          <div
            key={chat._id}
            onClick={() => navigate(`/chat/${chat._id}`)}
            className="flex items-center gap-4 p-4 hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <img
              src={otherUser.profilePic}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-semibold">{otherUser.name}</p>
              <p className="text-gray-400 text-sm">
                {chat.lastMessage?.text || "No messages yet"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
