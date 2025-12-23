import { motion } from "framer-motion";

export default function MatchCard({ user, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl"
    >
      <img
        src={user.profilePic || "/avatar.png"}
        className="w-16 h-16 rounded-full mb-4 object-cover"
        alt="profile"
      />

      <h2 className="text-xl font-semibold">
        {user.username || user.name || "User"}
      </h2>

      <p className="text-sm text-cyan-400 mt-2">
        Can Teach: {user.skillsToTeach?.join(", ") || "N/A"}
      </p>

      <p className="text-sm text-violet-400">
        Wants to Learn: {user.skillsToLearn?.join(", ") || "N/A"}
      </p>

      <div className="flex gap-3 mt-4">
        <button className="flex-1 bg-cyan-500/20 p-2 rounded-lg">
          Chat
        </button>
        <button className="flex-1 bg-violet-500/20 p-2 rounded-lg">
          Video
        </button>
      </div>
    </motion.div>
  );
}
