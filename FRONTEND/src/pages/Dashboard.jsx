import { useEffect, useState } from "react";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
