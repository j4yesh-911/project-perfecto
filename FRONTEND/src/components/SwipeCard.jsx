import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

export default function SwipeCard({ user, onAction }) {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (!user) return null;

  const avatar =
    user.profilePic ||
    "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(user.name);

  const handleMessage = () => {
    navigate(`/chat/${user._id}`);
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.post("/likes", { toUserId: user._id, action: "like" }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.msg === "It's a match!") {
        alert(`It's a match with ${user.name}! You can now chat.`);
        navigate(`/chat/${res.data.chatId}`);
      }
      onAction(user._id); // Remove from list
    } catch (err) {
      console.error(err);
      alert("Error liking user");
    }
  };

  const handleDislike = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post("/likes", { toUserId: user._id, action: "dislike" }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onAction(user._id); // Remove from list
    } catch (err) {
      console.error(err);
      alert("Error disliking user");
    }
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleLike();
    } else if (info.offset.x < -threshold) {
      handleDislike();
    }
  };

  const handleDrag = (event, info) => {
    setDragOffset(info.offset);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      onDragStart={() => setIsDragging(true)}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={{
        rotate: dragOffset.x * 0.1,
        scale: isDragging ? 1.05 : 1
      }}
      className="w-80 h-96 rounded-2xl bg-white/10 backdrop-blur-xl
                 border border-white/20 shadow-lg
                 flex flex-col items-center p-6 relative overflow-hidden"
    >
      {/* LIKE/NOPE Overlays */}
      {dragOffset.x > 50 && (
        <div className="absolute top-8 right-8 text-4xl font-bold text-green-500 rotate-12 border-4 border-green-500 rounded-lg px-4 py-2">
          LIKE
        </div>
      )}
      {dragOffset.x < -50 && (
        <div className="absolute top-8 left-8 text-4xl font-bold text-red-500 -rotate-12 border-4 border-red-500 rounded-lg px-4 py-2">
          NOPE
        </div>
      )}
      {/* 👤 Profile Image */}
      <img
        src={avatar}
        alt={user.name}
        className="w-28 h-28 rounded-full object-cover border-2 border-purple-500"
      />

      {/* 👤 Name */}
      <h2 className="text-2xl font-bold mt-4">{user.name}</h2>

      {/* 🎓 Skills */}
      <p className="text-gray-300 text-center mt-4">
        <span className="font-semibold">Teaches:</span>{" "}
        {user.skillsToTeach?.join(", ") || "N/A"}
      </p>

      <p className="text-gray-300 text-center mt-2">
        <span className="font-semibold">Learns:</span>{" "}
        {user.skillsToLearn?.join(", ") || "N/A"}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleDislike}
          className="px-4 py-2 bg-red-500 rounded-lg font-semibold hover:opacity-90 transition text-white"
        >
          ❌ Dislike
        </button>
        <button
          onClick={handleLike}
          className="px-4 py-2 bg-green-500 rounded-lg font-semibold hover:opacity-90 transition text-white"
        >
          ❤️ Like
        </button>
      </div>

      {/* Message Button */}
      <button
        onClick={handleMessage}
        className="mt-4 px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-lg font-semibold hover:opacity-90 transition text-white"
      >
        💬 Message
      </button>
    </motion.div>
  );
}
