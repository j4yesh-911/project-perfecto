import { useEffect, useState } from "react";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  const handleUserAction = (userId) => {
    setUsers(prev => prev.filter(u => u._id !== userId));
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("No token found. Please login again.");
        return;
      }

      try {
        // Fetch current user
        const meRes = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserId(meRes.data._id);

        // Fetch all users
        const usersRes = await API.get("/users/potential-matches", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(usersRes.data);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.msg || "Unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter users based on username and skills
  const filteredUsers = users.filter((user) => {
    // Filter by username (case-insensitive)
    const matchesUsername = usernameFilter === "" || 
      user.name?.toLowerCase().includes(usernameFilter.toLowerCase());

    // Filter by skills (check if any skill in skillsToTeach matches)
    const matchesSkills = skillsFilter === "" || 
      user.skillsToTeach?.some((skill) =>
        skill.toLowerCase().includes(skillsFilter.toLowerCase())
      );

    // Both filters must match
    return matchesUsername && matchesSkills;
  });

  if (loading) return <p className="p-6 text-white">Loading...</p>;

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-3xl mb-6">Discover Users</h1>

      {users.length === 0 && <p>No users found</p>}

      <div className="flex gap-6 flex-wrap">
        {users.map((u) => (
          <SwipeCard key={u._id} user={u} />
        ))}
      </div>
    </div>
  );
}
