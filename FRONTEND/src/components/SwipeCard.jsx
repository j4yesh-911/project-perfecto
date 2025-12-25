import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
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

  const sendRequest = async () => {
    if (isAlreadySwapper || localIsSent) return;

    try {
      await API.post("/swaps/send", {
        toUser: user._id,
        skillOffered: "React",
        skillRequested: "Node",
      });

      setLocalIsSent(true);
      setSentRequestIds((prev) => [...prev, user._id]);
    } catch (err) {
      console.error("Send request failed:", err);
    }
  };

  return (
    <>
      {/* ================= MAIN CARD ================= */}
      <motion.div
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer w-80 h-96 rounded-2xl bg-white/10
                   backdrop-blur-xl border border-white/20 shadow-xl
                   flex flex-col items-center p-6"
        whileHover={{ scale: 1.05 }}
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

      {/* ================= PROFILE MODAL ================= */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 rounded-2xl p-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <img
                src={avatar}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />

              <h2 className="text-2xl font-bold text-center">
                @{user.username}
              </h2>

              <p className="text-center text-gray-400 mt-2">
                {user.city}, {user.state}
              </p>

              <div className="mt-4 text-sm">
                <p>
                  <b>Teaches:</b>{" "}
                  {user.skillsToTeach?.join(", ") || "N/A"}
                </p>
                <p>
                  <b>Learns:</b>{" "}
                  {user.skillsToLearn?.join(", ") || "N/A"}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-6">
                {isAlreadySwapper ? (
                  <>
                 <button
  className="flex-1 bg-cyan-500/20 p-2 rounded-lg"
  onClick={async () => {
    try {
      const res = await API.post("/chats/find-or-create", {
        receiverId: user._id,
      });

      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      console.error("Chat open failed", err);
    }
  }}
>
  Chat
</button>

<button
  className="flex-1 bg-violet-500/20 p-2 rounded-lg"
  onClick={async () => {
    try {
      const res = await API.post("/chats/find-or-create", {
        receiverId: user._id,
      });

      navigate(`/video/${res.data._id}`);
    } catch (err) {
      console.error("Video open failed", err);
    }
  }}
>
  Video
</button>

                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center w-full">
                    Chat & video available after swap acceptance
                  </p>
                )}
              </div>

              <button
                className="mt-6 w-full text-sm text-gray-400"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
