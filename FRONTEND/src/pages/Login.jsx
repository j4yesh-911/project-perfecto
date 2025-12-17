import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", data);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      }
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">

      {/* ✅ BACKGROUND IMAGE (CLEAR & VISIBLE) */}
      <img
        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* ✅ LIGHT OVERLAY (does NOT hide image) */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* 🔥 GLASS LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl
        bg-white/15 backdrop-blur-xl border border-white/30
        shadow-2xl"
      >
        {/* TITLE */}
        <h1 className="text-3xl font-bold text-white text-center">
          Welcome Back
        </h1>
        <p className="text-center text-slate-200 mt-2">
          Login to continue 🚀
        </p>

        {/* FORM */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 rounded-lg bg-white/80 text-black
            placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onChange={(e) =>
              setData({ ...data, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-lg bg-white/80 text-black
            placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            onChange={(e) =>
              setData({ ...data, password: e.target.value })
            }
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 rounded-lg font-semibold text-white
            bg-gradient-to-r from-violet-500 to-cyan-400 shadow-lg"
          >
            Login
          </motion.button>
        </form>

        {/* SIGNUP */}
        <p className="mt-5 text-center text-slate-200">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-cyan-300 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
