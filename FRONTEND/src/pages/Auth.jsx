import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid place-items-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass p-10 w-[360px] text-center"
      >
        <h1 className="text-3xl font-bold">SkillSwap</h1>
        <p className="text-gray-300 mt-2">
          Exchange skills. Learn smarter.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400"
        >
          Enter
        </button>
      </motion.div>
    </div>
  );
}
