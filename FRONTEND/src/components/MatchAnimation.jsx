import { motion } from "framer-motion";

export default function MatchAnimation() {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-40 h-40 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
        animate={{
          scale: [1, 1.4, 1],
          rotate: [0, 360],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      <motion.p
        className="mt-8 text-xl text-cyan-300"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        Finding perfect skill swaps...
      </motion.p>
    </motion.div>
  );
}
