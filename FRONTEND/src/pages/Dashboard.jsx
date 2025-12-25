import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mySwappers, setMySwappers] = useState([]);
  const [sentRequestIds, setSentRequestIds] = useState([]);

  const [usernameFilter, setUsernameFilter] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, usersRes, sentRes] = await Promise.all([
          API.get("/auth/me"),
          API.get("/users"),
          API.get("/swaps/sent"),
        ]);

        setUsers(usersRes.data);

        setMySwappers(
          (meRes.data.swappers || []).map((u) => u._id.toString())
        );

        setSentRequestIds(
          sentRes.data.map((r) => r.toUser.toString())
        );
      } catch (err) {
        alert("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesUsername =
      usernameFilter === "" ||
      (user.username || user.name || "")
        .toLowerCase()
        .includes(usernameFilter.toLowerCase());

    const matchesSkills =
      skillsFilter === "" ||
      (user.skillsToTeach || []).some((skill) =>
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
          Connect, chat & exchange skills
        </p>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <input
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            placeholder="Search by username..."
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20"
          />
          <input
            value={skillsFilter}
            onChange={(e) => setSkillsFilter(e.target.value)}
            placeholder="Search by skills..."
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20"
          />
        </div>

        {/* Cards */}
        <motion.div className="flex gap-6 flex-wrap justify-center">
          {filteredUsers.map((user) => (
            <SwipeCard
              key={user._id}
              user={user}
              isAlreadySwapper={mySwappers.includes(user._id.toString())}
              isSent={sentRequestIds.includes(user._id.toString())}
              setSentRequestIds={setSentRequestIds}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
