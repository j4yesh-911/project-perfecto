import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";


export default function Home() {

  const login = !!window.localStorage.getItem("token");
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

const handleChange = () => {
  if (login) {
    navigate("/dashboard");
  } else {
    setIsAnimating(true);
    // Navigate after animation completes
    setTimeout(() => {
      navigate("/login");
    }, 1000); // Match animation duration
  }
}


  return (
    <section className="flex flex-col items-center justify-center h-[80vh] text-center relative overflow-hidden">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-6xl font-extrabold mb-6"
      >
        Exchange Skills.<br />
        <span className="text-neon">Learn Anything.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-gray-400 max-w-xl mb-12"
      >
        Teach what you know. Learn what you don't. Online or offline.
      </motion.p>

      <AnimatePresence>
        {!isAnimating ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={handleChange}
            className="px-12 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm"
            whileHover={{
              boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
              scale: 1.05
            }}
            whileTap={{ scale: 0.95 }}
          >
            Enter SkillSwap
          </motion.button>
        ) : (
          <motion.div
            initial={{ y: 0, scale: 1 }}
            animate={{
              y: windowHeight - 100,
              scale: 0.8,
              rotate: 5
            }}
            transition={{
              duration: 1,
              ease: "easeInOut"
            }}
            className="fixed left-1/2 transform -translate-x-1/2 z-50"
          >
            <motion.button
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                  "0 0 40px rgba(147, 51, 234, 0.7)",
                  "0 0 20px rgba(59, 130, 246, 0.5)"
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="px-12 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-xl rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm"
            >
               Entering...
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: windowHeight + 100,
              scale: 0
            }}
            animate={{
              y: -100,
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              width: '8px',
              height: '8px'
            }}
          />
        ))}
      </div>
    </section>
  );
}
