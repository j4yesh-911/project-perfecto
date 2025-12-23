import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import MatchCard from "../components/MatchCard";
import MatchAnimation from "../components/MatchAnimation";

export default function Match() {
  const [learnSkill, setLearnSkill] = useState("");
  const [teachSkill, setTeachSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");

  const generateMatch = async () => {
    if (!learnSkill || !teachSkill) return;

    setLoading(true);
    setMatches([]);
    setError("");

    try {
      const res = await API.post("/users/match", {
        learnSkill: learnSkill.trim(),
        teachSkill: teachSkill.trim(),
      });

      console.log("MATCH RESULT:", res.data);

      setTimeout(() => {
        if (res.data.length === 0) {
          setError("No matching users found.");
        } else {
          setMatches(res.data);
        }
        setLoading(false);
      }, 2500);
    } catch (err) {
      console.error("MATCH ERROR:", err);
      setError("Something went wrong while finding matches.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black p-6 text-white">
      {/* INPUT SECTION */}
      <div className="max-w-3xl mx-auto mt-20">
        <h1 className="text-4xl font-bold text-center mb-10">
          Find Your Perfect Skill Swap
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Skill you want to learn"
            className="bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-cyan-400"
            value={learnSkill}
            onChange={(e) => setLearnSkill(e.target.value)}
          />

          <input
            type="text"
            placeholder="Skill you can teach"
            className="bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-violet-400"
            value={teachSkill}
            onChange={(e) => setTeachSkill(e.target.value)}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateMatch}
          disabled={!learnSkill || !teachSkill || loading}
          className="mt-8 w-full bg-gradient-to-r from-cyan-500 to-violet-500 p-4 rounded-xl font-semibold text-lg disabled:opacity-40"
        >
          {loading ? "Matching..." : "Generate Match"}
        </motion.button>
      </div>

      {/* FULLSCREEN ANIMATION */}
      <AnimatePresence>
        {loading && <MatchAnimation />}
      </AnimatePresence>

      {/* ERROR / EMPTY STATE */}
      {!loading && error && (
        <p className="text-center text-red-400 mt-12 text-lg">
          {error}
        </p>
      )}

      {/* RESULTS */}
      {!loading && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {matches.map((user, i) => (
            <MatchCard key={user._id} user={user} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
