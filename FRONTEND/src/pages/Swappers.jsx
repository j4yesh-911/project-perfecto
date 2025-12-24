import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Swappers() {
  const [swappers, setSwappers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/auth/me");
        setSwappers(res.data.swappers || []);
      } catch (err) {
        console.error("Failed to load swappers:", err);
      }
    };
    load();
  }, []);

  const openChat = async (receiverId) => {
    if (!receiverId) return;

    try {
      const res = await API.post("/chats/find-or-create", {
        receiverId,
      });

      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      console.error("Chat open failed:", err);
      alert("Chat open failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <h1 className="text-xl font-bold px-4 py-4 border-b border-zinc-800">
        Your Swappers
      </h1>

      {swappers.length === 0 && (
        <p className="text-gray-400 px-4 mt-4">
          No swappers yet
        </p>
      )}

      <div>
        {swappers.map((u, index) => {
          const displayName = u.username || u.name || "User";
          const avatarLetter = displayName.charAt(0).toUpperCase();

          return (
            <div
              key={u._id || index}
              onClick={() => openChat(u._id)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 cursor-pointer border-b border-zinc-800"
            >
              {u.profilePic ? (
                <img
                  src={u.profilePic}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold">
                  {avatarLetter}
                </div>
              )}

              <div className="flex-1">
                <p className="font-medium">{displayName}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
