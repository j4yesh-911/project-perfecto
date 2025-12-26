import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useNavigate } from "react-router-dom";


export default function SwipeCard({
  user,
  isAlreadySwapper,
  isSent,
  setSentRequestIds,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localIsSent, setLocalIsSent] = useState(isSent);
  const navigate = useNavigate();


  useEffect(() => {
    setLocalIsSent(isSent);
  }, [isSent]);

  if (!user) return null;

  const avatar =
    user.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.username || "User"
    )}`;

  const handleMessage = async () => {
    // 🔥 CALL BACKEND – NEVER NAVIGATE DIRECTLY
    const res = await API.post("/chats/find-or-create", {
      receiverId: user._id,
    });

    onMessage(res.data._id); // 🔥 PASS CHAT ID UP
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.classList.contains('modal-backdrop')) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <>
      {/* ================= MAIN CARD ================= */}
      <motion.div
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer w-80 h-96 rounded-2xl bg-white/10
                   backdrop-blur-xl border border-white/20 shadow-xl
                   flex flex-col items-center p-6"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="w-80 h-96 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl flex flex-col items-center p-6 cursor-pointer"
        onClick={openModal}
      >
        <img
          src={avatar}
          className="w-28 h-28 rounded-full border-2 border-violet-500 mb-4"
        />

        <h2 className="text-xl font-bold mb-2">
          @{user.username || user.name}
        </h2>

        <p className="text-sm text-gray-300 text-center">
          {user.skillsToTeach?.join(", ")}
        </p>

        {/* STATUS */}
        <div className="mt-auto">
          {isAlreadySwapper ? (
            <span className="text-green-500 font-semibold">
              ✓ Swap Partner
            </span>
          ) : localIsSent ? (
            <span className="text-yellow-400 font-semibold">
              ⏳ Request Sent
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                sendRequest();
              }}
              className="px-4 py-2 bg-emerald-500/20 rounded-lg"
            >
              SwapSkill
            </button>
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-backdrop"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xl font-bold transition-colors z-10"
              >
                ×
              </button>

              {/* Modal Content */}
              <div className="p-6 pt-12">
                <div className="flex flex-col items-center">
                  <motion.img
                    src={avatar}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-violet-500 mb-4"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  />

                  <h2 className="text-3xl font-bold mb-2 text-center">{user.name}</h2>

                  <div className="w-full space-y-3 text-center">
                    {user.username && (
                      <p className="text-gray-300">
                        <span className="font-semibold text-white">Username:</span> @{user.username}
                      </p>
                    )}

                    {user.age && (
                      <p className="text-gray-300">
                        <span className="font-semibold text-white">Age:</span> {user.age}
                      </p>
                    )}

                    {user.gender && (
                      <p className="text-gray-300">
                        <span className="font-semibold text-white">Gender:</span> {user.gender}
                      </p>
                    )}

                    {user.location && (
                      <p className="text-gray-300">
                        <span className="font-semibold text-white">📍 Location:</span> {user.location}
                      </p>
                    )}

                    {(user.city || user.state) && (
                      <p className="text-gray-300">
                        <span className="font-semibold text-white">🏙️ City/State:</span>{" "}
                        {[user.city, user.state].filter(Boolean).join(", ")}
                      </p>
                    )}

                    <div className="border-t border-white/20 pt-3 mt-4">
                      <p className="text-gray-300 mb-2">
                        <span className="font-semibold text-white">🎓 Teaches:</span>
                      </p>
                      <p className="text-sm text-gray-400">
                        {user.skillsToTeach?.join(", ") || "Not specified"}
                      </p>
                    </div>

                    <div className="border-t border-white/20 pt-3">
                      <p className="text-gray-300 mb-2">
                        <span className="font-semibold text-white">📚 Wants to Learn:</span>
                      </p>
                      <p className="text-sm text-gray-400">
                        {user.skillsToLearn?.join(", ") || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      handleMessage();
                      closeModal();
                    }}
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-lg font-semibold text-white shadow-lg"
                  >
                    💬 Send Message
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
