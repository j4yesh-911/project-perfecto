import { motion } from "framer-motion";

export default function Auth() {
  return (
    <div className="min-h-screen grid place-items-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass p-10 w-[360px] text-center"
      >
        <h1 className="text-3xl font-bold">SkillSwap</h1>
        <p className="text-gray-300 mt-2">Exchange skills. Learn smarter.</p>
        <button className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400">
          Enter
        </button>
      </motion.div>
    </div>
  );
}
