// import SwipeCard from "../components/SwipeCard";
// import MapView from "../components/MapView";

// const dummyUser = {
//   name: "Alex",
//   skillsToTeach: ["React"],
//   skillsToLearn: ["Node"]
// };

// export default function Dashboard() {
//   return (
//     <div className="p-10 space-y-10">
//       <h1 className="text-4xl font-bold">Dashboard</h1>

//       <SwipeCard user={dummyUser} />

//       <MapView users={[{ lat: 23.02, lng: 72.57 }]} />
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("No token found. Please login again.");
        return;
      }

      try {
        const res = await API.get("/users", {
        });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.msg || "Unauthorized");
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-3xl mb-6">Discover Users</h1>

      {users.length === 0 && <p>No users found</p>}

      {users.map((u) => (
        <div
          key={u._id}
          className="bg-white/10 p-4 rounded-xl mb-4"
        >
          <h2 className="text-xl">{u.name}</h2>
        </div>
      ))}
    </div>
  );
}
