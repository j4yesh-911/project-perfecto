import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again");
        return;
      }

      try {
        // Get current user
        const meRes = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserId(meRes.data._id);

        // Get all users
        const usersRes = await API.get("/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(usersRes.data);
      } catch (err) {
        console.error(err);
        alert("Unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return <p className="p-6 text-white">Loading users...</p>;

  const filteredUsers = users.filter(u => u._id !== currentUserId);

  return (
    <div className="min-h-screen p-6
                    bg-gradient-to-br from-black via-slate-900 to-black
                    text-white">
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
