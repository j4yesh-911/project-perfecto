import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null); // ✅ missing
  const [usernameFilter, setUsernameFilter] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, usersRes] = await Promise.all([
          API.get("/auth/me"),
          API.get("/users"),
        ]);

        setCurrentUserId(meRes.data._id);
        setUsers(usersRes.data.filter(u => u._id !== meRes.data._id));
      } catch (err) {
        alert("Failed to load users");
        alert("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // ✅ FIX HERE
  }, []);

  const handleOpenChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  // Filter users based on username and skills
  const filteredUsers = users.filter((user) => {
    // Filter by username (case-insensitive)
    const matchesUsername = usernameFilter === "" || 
      (user.username || user.name || "").toLowerCase().includes(usernameFilter.toLowerCase());
    
    // Filter by skills (match inside skillsToTeach array)
    const matchesSkills = skillsFilter === "" || 
      (user.skillsToTeach || []).some(skill => 
        skill.toLowerCase().includes(skillsFilter.toLowerCase())
      );
    
    // Both filters must match (AND logic)
    return matchesUsername && matchesSkills;
  });

  if (loading) return <p className="p-6 text-white">Loading users...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black via-slate-900 to-black text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Discover People</h1>
        <p className="text-gray-400 mb-8">
          Connect, chat & exchange skills 🚀
        </p>

        <motion.div
          className="flex gap-6 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {users.map(user => (
            <SwipeCard
              key={user._id}
              user={user}
              onMessage={handleOpenChat} // 🔥 PASS HANDLER
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
