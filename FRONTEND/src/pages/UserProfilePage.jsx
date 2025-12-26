import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";

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

  if (loading) return <p className="p-6">Loading...</p>;

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
    <div className="min-h-screen p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">

        {/* ================= LEFT PROFILE ================= */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <img
            src={avatar}
            className="w-32 h-32 rounded-full mx-auto border-2 border-violet-500"
          />

          <h1 className="text-2xl font-bold text-center mt-4">
            @{selectedUser.username}
          </h1>

          <p className="text-center text-gray-400 mt-1">
            {selectedUser.city || "—"}, {selectedUser.state || "—"}
          </p>

          <div className="mt-6 text-sm space-y-2">
            <p><b>Teaches:</b> {selectedUser.skillsToTeach?.join(", ") || "N/A"}</p>
            <p><b>Learns:</b> {selectedUser.skillsToLearn?.join(", ") || "N/A"}</p>
          </div>

          <div className="mt-8">
            {isSwapper ? (
              <div className="flex gap-3">
                <button onClick={startChat} className="flex-1 bg-cyan-500/20 p-2 rounded-lg">Chat</button>
                <button onClick={startVideo} className="flex-1 bg-violet-500/20 p-2 rounded-lg">Video</button>
              </div>
            ) : isSent ? (
              <div className="text-center text-yellow-400 font-semibold">
                ⏳ Request Sent
              </div>
            ) : (
              <button
                onClick={sendSwapRequest}
                disabled={sending}
                className="w-full bg-emerald-500/20 p-2 rounded-lg"
              >
                {sending ? "Sending..." : "SwapSkill"}
              </button>
            )}
          </div>
        </div>

        {/* ================= RIGHT SUGGESTIONS ================= */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">People you may like</h2>

            {/* 🌟 AESTHETIC REFRESH PILL */}
            <button
              onClick={refreshSuggestions}
              className="
                group relative w-10 h-10 rounded-full
                bg-white/10 backdrop-blur-xl
                border border-white/20
                hover:bg-white/20 transition
                flex items-center justify-center
              "
            >
              <span
                className={`
                  text-lg transition-transform
                  ${refreshing ? "animate-spin" : "group-hover:rotate-180"}
                `}
              >
                ⟳
              </span>
            </button>
          </div>

          <div className="flex flex-wrap gap-6 justify-center">
            {suggestedUsers.map((u) => (
              <SwipeCard
                key={u._id}
                user={u}
                isAlreadySwapper={false}
                isSent={sentRequestIds.includes(u._id)}
                setSentRequestIds={setSentRequestIds}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
