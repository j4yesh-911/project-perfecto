import { useEffect, useState } from "react";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

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
        const usersRes = await API.get("/users", {
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

  if (loading) return <p className="p-6 text-white">Loading...</p>;

  return (
    <div className="min-h-screen p-6 text-white bg-gradient-to-br from-black via-slate-900 to-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-neon">Discover Users</h1>
        <p className="text-gray-300 mb-8">Start a chat with other people and exchange skills!</p>

        {users.length === 0 && <p className="text-center text-gray-400 mt-12">No users found. Be the first to complete your profile!</p>}

        <div className="flex gap-6 flex-wrap justify-center">
          {users.filter(u => u._id !== currentUserId).map((u) => (
            <SwipeCard key={u._id} user={u} />
          ))}
        </div>
      </div>
    </div>
  );
}
