import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");

  const handleUserAction = (userId) => {
    setUsers(prev => prev.filter(u => u._id !== userId));
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again");
        return;
      }

      try {
        // Fetch current user and all users in parallel for better performance
        const [currentUserRes, usersRes] = await Promise.all([
          API.get("/auth/me"),
          API.get("/users")
        ]);

        if (currentUserRes.data?._id) {
          setCurrentUserId(currentUserRes.data._id);
        }

        // Backend already excludes current user, but filter again for safety
        setUsers((usersRes.data || []).filter(u => u._id !== currentUserRes.data?._id));
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          alert("Unauthorized - Please login again");
        } else {
          alert("Failed to load users");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter users based on username and skills, excluding current user
  const filteredUsers = users.filter((user) => {
    // Exclude current user
    if (user._id === currentUserId) return false;

    // Filter by username (case-insensitive)
    const matchesUsername = usernameFilter === "" || 
      user.name?.toLowerCase().includes(usernameFilter.toLowerCase()) ||
      user.username?.toLowerCase().includes(usernameFilter.toLowerCase());

    // Filter by skills (check if any skill in skillsToTeach matches)
    const matchesSkills = skillsFilter === "" || 
      user.skillsToTeach?.some((skill) =>
        skill.toLowerCase().includes(skillsFilter.toLowerCase())
      );

    // Both filters must match
    return matchesUsername && matchesSkills;
  });

  if (loading)
    return <p className="p-6 text-white">Loading users...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black via-slate-900 to-black text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Discover People
        </h1>
        <p className="text-gray-400 mb-8">
          Connect, chat & exchange skills 🚀
        </p>

        {filteredUsers.length === 0 && (
          <p className="text-center text-gray-400 mt-12">
            No other users found
          </p>
        )}

        <motion.div
          initial="show"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="flex gap-6 flex-wrap justify-center"
        >
          {filteredUsers.map(user => (
            <SwipeCard key={user._id} user={user} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
