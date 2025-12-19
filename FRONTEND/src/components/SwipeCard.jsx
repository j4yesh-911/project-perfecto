import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function SwipeCard({ user }) {
  const navigate = useNavigate();

  if (!user) return null;

  const avatar =
    user.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`;

  const handleMessage = () => {
    navigate(`/chat/${user._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 120 }}
      className="w-80 h-96 rounded-2xl
                 bg-white/10 backdrop-blur-xl
                 border border-white/20
                 shadow-xl
                 flex flex-col items-center p-6"
    >
      {/* Avatar */}
      <motion.img
        src={avatar}
        alt={user.name}
        className="w-28 h-28 rounded-full object-cover
                   border-2 border-violet-500"
        whileHover={{ rotate: 2 }}
      />

      {/* Name */}
      <h2 className="text-2xl font-bold mt-4">{user.name}</h2>

      {/* Skills */}
      <p className="text-gray-300 text-center mt-4 text-sm">
        <span className="font-semibold text-white">Teaches:</span>{" "}
        {user.skillsToTeach?.join(", ") || "N/A"}
      </p>

      <p className="text-gray-300 text-center mt-2 text-sm">
        <span className="font-semibold text-white">Learns:</span>{" "}
        {user.skillsToLearn?.join(", ") || "N/A"}
      </p>

      {/* Message Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleMessage}
        className="mt-auto px-6 py-2
                   bg-gradient-to-r from-violet-500 to-cyan-400
                   rounded-lg font-semibold text-white
                   shadow-lg"
      >
        💬 Message
      </motion.button>
    </motion.div>
  );
}