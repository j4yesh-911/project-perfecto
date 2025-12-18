import { motion } from "framer-motion";

export default function SwipeCard({ user }) {
  if (!user) return null;

  const avatar =
    user.profilePic ||
    "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(user.name);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      className="w-80 h-96 rounded-2xl bg-white/10 backdrop-blur-xl
                 border border-white/20 shadow-lg
                 flex flex-col items-center p-6"
    >
      {/* 👤 Profile Image */}
      <img
        src={avatar}
        alt={user.name}
        className="w-28 h-28 rounded-full object-cover border-2 border-purple-500"
      />

      {/* 👤 Name */}
      <h2 className="text-2xl font-bold mt-4">{user.name}</h2>

      {/* 🎓 Skills */}
      <p className="text-gray-300 text-center mt-4">
        <span className="font-semibold">Teaches:</span>{" "}
        {user.skillsToTeach?.join(", ") || "N/A"}
      </p>

      <p className="text-gray-300 text-center mt-2">
        <span className="font-semibold">Learns:</span>{" "}
        {user.skillsToLearn?.join(", ") || "N/A"}
      </p>
    </motion.div>
  );
}
