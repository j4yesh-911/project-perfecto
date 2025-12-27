import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";
import { MapPin, BookOpen, Lightbulb, MessageCircle, Video, Heart, RefreshCw } from "lucide-react";

/* ================= MATCH HELPERS ================= */
const calculateSkillMatch = (me, user) => {
  if (!me || !user) return 0;

  const myTeach = me.skillsToTeach || [];
  const myLearn = me.skillsToLearn || [];
  const userTeach = user.skillsToTeach || [];
  const userLearn = user.skillsToLearn || [];

  return (
    myLearn.filter((s) => userTeach.includes(s)).length +
    myTeach.filter((s) => userLearn.includes(s)).length
  );
};

const locationScore = (me, user) => {
  if (!me || !user) return 0;
  if (me.city === user.city) return 2;
  if (me.state === user.state) return 1;
  return 0;
};

const shuffle = (arr) =>
  [...arr].sort(() => 0.5 - Math.random());

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const [mySwappers, setMySwappers] = useState([]);
  const [sentRequestIds, setSentRequestIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ================= BUILD SUGGESTIONS ================= */
  const buildSuggestions = (currentUser, users, swappers) => {
    return shuffle(
      users
        .filter(
          (u) =>
            u._id !== currentUser._id &&
            !swappers.includes(u._id)
        )
        .map((u) => ({
          ...u,
          score:
            calculateSkillMatch(currentUser, u) * 3 +
            locationScore(currentUser, u),
        }))
        .filter((u) => u.score > 0)
    ).slice(0, 4);
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, usersRes, sentRes] = await Promise.all([
          API.get("/auth/me"),
          API.get("/users"),
          API.get("/swaps/sent"),
        ]);

        const found = usersRes.data.find((u) => u._id === id);
        if (!found) return navigate("/dashboard");

        setMe(meRes.data);
        setSelectedUser(found);

        const swapperIds =
          (meRes.data.swappers || []).map((u) => u._id);

        setMySwappers(swapperIds);
        setSentRequestIds(sentRes.data.map((r) => r.toUser));
        setAllUsers(usersRes.data);

        setSuggestedUsers(
          buildSuggestions(found, usersRes.data, swapperIds)
        );
      } catch {
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-blue-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );

  const isSwapper = mySwappers.includes(selectedUser._id);
  const isSent = sentRequestIds.includes(selectedUser._id);

  const avatar =
    selectedUser.profilePic ||
    `https://ui-avatars.com/api/?name=${selectedUser.username}`;

  /* ================= ACTIONS ================= */
  const refreshSuggestions = () => {
    setRefreshing(true);
    setTimeout(() => {
      setSuggestedUsers(
        buildSuggestions(selectedUser, allUsers, mySwappers)
      );
      setRefreshing(false);
    }, 300);
  };

  const sendSwapRequest = async () => {
    if (isSwapper || isSent) return;
    try {
      setSending(true);
      await API.post("/swaps/send", {
        toUser: selectedUser._id,
        skillOffered: "React",
        skillRequested: "Node",
      });
      setSentRequestIds((p) => [...p, selectedUser._id]);
    } finally {
      setSending(false);
    }
  };

  const startChat = async () => {
    const res = await API.post("/chats/find-or-create", {
      receiverId: selectedUser._id,
    });
    navigate(`/chat/${res.data._id}`);
  };

  const startVideo = async () => {
    const res = await API.post("/chats/find-or-create", {
      receiverId: selectedUser._id,
    });
    navigate(`/video/${res.data._id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-blue-900 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">

        {/* ================= LEFT PROFILE ================= */}
        <motion.div
          className="bg-white/20 dark:bg-gray-800/50 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.img
              src={avatar}
              className="w-32 h-32 rounded-full mx-auto border-4 border-gradient-to-r from-green-400 to-blue-500 shadow-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              @{selectedUser.username}
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 mt-2">
              <MapPin className="w-4 h-4" />
              <p>{selectedUser.city || "—"}, {selectedUser.state || "—"}</p>
            </div>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/10 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-green-600 dark:text-green-400">Teaches</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedUser.skillsToTeach?.join(", ") || "N/A"}
              </p>
            </div>
            <div className="bg-white/10 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-blue-600 dark:text-blue-400">Learns</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedUser.skillsToLearn?.join(", ") || "N/A"}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {isSwapper ? (
              <div className="flex gap-3">
                <motion.button
                  onClick={startChat}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </motion.button>
                <motion.button
                  onClick={startVideo}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Video className="w-4 h-4" />
                  Video
                </motion.button>
              </div>
            ) : isSent ? (
              <div className="text-center text-yellow-500 dark:text-yellow-400 font-semibold py-4">
                ⏳ Request Sent
              </div>
            ) : (
              <motion.button
                onClick={sendSwapRequest}
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart className="w-4 h-4" />
                {sending ? "Sending..." : "SwapSkill"}
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        {/* ================= RIGHT SUGGESTIONS ================= */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              People you may like
            </h2>

            <motion.button
              onClick={refreshSuggestions}
              className="group relative w-12 h-12 rounded-full bg-white/20 dark:bg-gray-800/50 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${
                  refreshing ? "animate-spin" : "group-hover:rotate-180"
                }`}
              />
            </motion.button>
          </div>

          <motion.div
            className="flex flex-wrap gap-6 justify-center"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            {suggestedUsers.map((u) => (
              <motion.div
                key={u._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <SwipeCard
                  user={u}
                  isAlreadySwapper={false}
                  isSent={sentRequestIds.includes(u._id)}
                  setSentRequestIds={setSentRequestIds}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
