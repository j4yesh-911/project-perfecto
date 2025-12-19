import { useEffect, useState } from "react";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("No token found. Please login again.");
        return;
      }

      try {
        const res = await API.get("/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(res.data);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.msg || "Unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on username and skills
  const filteredUsers = users.filter((user) => {
    // Filter by username (case-insensitive)
    const matchesUsername = usernameFilter === "" || 
      (user.username && user.username.toLowerCase().includes(usernameFilter.toLowerCase())) ||
      (user.name && user.name.toLowerCase().includes(usernameFilter.toLowerCase()));

    // Filter by skills (match inside skillsToTeach array, case-insensitive)
    const matchesSkills = skillsFilter === "" || 
      (user.skillsToTeach && user.skillsToTeach.some(skill => 
        skill.toLowerCase().includes(skillsFilter.toLowerCase())
      ));

    // Both filters must match
    return matchesUsername && matchesSkills;
  });

  if (loading) return <p className="p-6 text-white">Loading...</p>;

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-3xl mb-6">Discover Users</h1>

      {/* Filter Inputs */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="username-filter" className="block text-sm font-semibold mb-2">
            Filter by Username
          </label>
          <input
            id="username-filter"
            type="text"
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            placeholder="Search by username or name..."
            className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="skills-filter" className="block text-sm font-semibold mb-2">
            Filter by Skills
          </label>
          <input
            id="skills-filter"
            type="text"
            value={skillsFilter}
            onChange={(e) => setSkillsFilter(e.target.value)}
            placeholder="Search by skills to teach..."
            className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {filteredUsers.length === 0 && users.length > 0 && (
        <p className="text-gray-400 mb-4">No users match your filters</p>
      )}
      {users.length === 0 && <p>No users found</p>}

      <div className="flex gap-6 flex-wrap">
        {filteredUsers.map((u) => (
          <SwipeCard key={u._id} user={u} />
        ))}
      </div>
    </div>
  );
}
