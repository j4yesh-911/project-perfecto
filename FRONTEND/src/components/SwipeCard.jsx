import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Video } from "lucide-react";

export default function SwipeCard({
  user,
  isAlreadySwapper,
  isSent,
  setSentRequestIds,
}) {
  const [localIsSent, setLocalIsSent] = useState(isSent);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalIsSent(isSent);
  }, [isSent]);

  if (!user) return null;

  const avatar =
    user.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.username || user.name || "User"
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
    <motion.div
      onClick={() => navigate(`/users/${user._id}`)}
      className="cursor-pointer w-80 h-96 rounded-3xl bg-gradient-to-br from-white/20 to-white/5 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-2xl flex flex-col items-center p-6 relative overflow-hidden group"
      whileHover={{
        scale: 1.05,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <motion.img
        src={avatar}
        className="w-28 h-28 rounded-full border-4 border-gradient-to-r from-blue-400 to-purple-500 mb-4 shadow-lg"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
      />

      <motion.h2
        className="text-xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        @{user.username || user.name}
      </motion.h2>

      <motion.p
        className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {user.skillsToTeach?.join(", ") || "No skills added"}
      </motion.p>

      <div className="mt-auto w-full">
        {isAlreadySwapper ? (
          <motion.div
            className="flex gap-2 justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl border border-green-500/30 hover:bg-green-500/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </motion.button>
            <motion.button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Video className="w-4 h-4" />
              Video
            </motion.button>
          </motion.div>
        ) : localIsSent ? (
          <motion.div
            className="text-center text-yellow-500 dark:text-yellow-400 font-semibold py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            ⏳ Request Sent
          </motion.div>
        ) : (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              sendRequest();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Heart className="w-4 h-4" />
            SwapSkill
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}




















// import { motion, AnimatePresence } from "framer-motion";
// import { useState, useEffect } from "react";
// import API from "../services/api";
// import { useNavigate } from "react-router-dom";

// export default function SwipeCard({
//   user,
//   isAlreadySwapper,
//   isSent,
//   setSentRequestIds,
// }) {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [localIsSent, setLocalIsSent] = useState(isSent);
//   const navigate = useNavigate();

//   useEffect(() => {
//     setLocalIsSent(isSent);
//   }, [isSent]);

//   if (!user) return null;

//   const avatar =
//     user.profilePic ||
//     `https://ui-avatars.com/api/?name=${encodeURIComponent(
//       user.username || user.name || "User"
//     )}`;

//   const sendRequest = async () => {
//     if (isAlreadySwapper || localIsSent) return;

//     try {
//       await API.post("/swaps/send", {
//         toUser: user._id,
//         skillOffered: "React",
//         skillRequested: "Node",
//       });

//       setLocalIsSent(true);
//       setSentRequestIds((prev) => [...prev, user._id]);
//     } catch (err) {
//       console.error("Send request failed:", err);
//     }
//   };

//   return (
//     <>
//       {/* ================= CARD ================= */}
//       <motion.div
//         onClick={() => setIsModalOpen(true)}
//         className="cursor-pointer w-80 h-96 rounded-2xl bg-white/10
//                    backdrop-blur-xl border border-white/20 shadow-xl
//                    flex flex-col items-center p-6"
//         whileHover={{ scale: 1.05 }}
//       >
//         <img
//           src={avatar}
//           className="w-28 h-28 rounded-full border-2 border-violet-500 mb-4"
//         />

//         <h2 className="text-xl font-bold mb-2">
//           @{user.username || user.name}
//         </h2>

//         <p className="text-sm text-gray-300 text-center">
//           {user.skillsToTeach?.join(", ") || "No skills added"}
//         </p>

//         <div className="mt-auto">
//           {isAlreadySwapper ? (
//             <span className="text-green-500 font-semibold">
//               ✓ Swap Partner
//             </span>
//           ) : localIsSent ? (
//             <span className="text-yellow-400 font-semibold">
//               ⏳ Request Sent
//             </span>
//           ) : (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 sendRequest();
//               }}
//               className="px-4 py-2 bg-emerald-500/20 rounded-lg"
//             >
//               SwapSkill
//             </button>
//           )}
//         </div>
//       </motion.div>

//       {/* ================= MODAL ================= */}
//       <AnimatePresence>
//         {isModalOpen && (
//           <motion.div
//             className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setIsModalOpen(false)}
//           >
//             <motion.div
//               onClick={(e) => e.stopPropagation()}
//               className="w-full max-w-md bg-slate-900 rounded-2xl p-6"
//               initial={{ scale: 0.9 }}
//               animate={{ scale: 1 }}
//             >
//               <img
//                 src={avatar}
//                 className="w-24 h-24 rounded-full mx-auto mb-4"
//               />

//               <h2 className="text-2xl font-bold text-center">
//                 @{user.username}
//               </h2>

//               <p className="text-center text-gray-400 mt-2">
//                 {user.city || "—"}, {user.state || "—"}
//               </p>

//               <div className="mt-4 text-sm">
//                 <p><b>Teaches:</b> {user.skillsToTeach?.join(", ") || "N/A"}</p>
//                 <p><b>Learns:</b> {user.skillsToLearn?.join(", ") || "N/A"}</p>
//               </div>

//               <div className="flex gap-3 mt-6">
//                 {isAlreadySwapper ? (
//                   <>
//                     <button
//                       className="flex-1 bg-cyan-500/20 p-2 rounded-lg"
//                       onClick={async () => {
//                         const res = await API.post("/chats/find-or-create", {
//                           receiverId: user._id,
//                         });
//                         navigate(`/chat/${res.data._id}`);
//                       }}
//                     >
//                       Chat
//                     </button>

//                     <button
//                       className="flex-1 bg-violet-500/20 p-2 rounded-lg"
//                       onClick={async () => {
//                         const res = await API.post("/chats/find-or-create", {
//                           receiverId: user._id,
//                         });
//                         navigate(`/video/${res.data._id}`);
//                       }}
//                     >
//                       Video
//                     </button>
//                   </>
//                 ) : (
//                   <p className="text-sm text-gray-400 text-center w-full">
//                     Chat & video available after swap acceptance
//                   </p>
//                 )}
//               </div>

//               <button
//                 className="mt-6 w-full text-sm text-gray-400"
//                 onClick={() => setIsModalOpen(false)}
//               >
//                 Close
//               </button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

