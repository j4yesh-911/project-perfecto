import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const filteredUsers = users.filter((user) => {
    const matchesUsername =
      usernameFilter === "" ||
      (user.username || user.name || "")
        .toLowerCase()
        .includes(usernameFilter.toLowerCase());

    const matchesSkills =
      skillsFilter === "" ||
      (user.skillsToTeach || []).some(skill =>
        skill.toLowerCase().includes(skillsFilter.toLowerCase())
      );

    return matchesUsername && matchesSkills;
  });

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Discover People</h1>
        <p className="text-gray-400 mb-8">
          Connect, chat & exchange skills 🚀
        </p>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Filter by Username
            </label>
            <input
              type="text"
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
              placeholder="Search by username..."
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Filter by Skills
            </label>
            <input
              type="text"
              value={skillsFilter}
              onChange={(e) => setSkillsFilter(e.target.value)}
              placeholder="Search by skills..."
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Cards */}
        <motion.div
          className="flex gap-6 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <SwipeCard
                key={user._id}
                user={user}
                onMessage={handleOpenChat}
              />
            ))
          ) : (
            <p className="text-gray-400 text-center w-full py-8">
              No users found matching your filters.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
