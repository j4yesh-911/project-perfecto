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
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <img
        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40"></div>

      <motion.div className="relative z-10 w-full max-w-md p-8 bg-white/15 backdrop-blur-xl rounded-2xl">
        <h1 className="text-3xl text-white text-center font-bold">
          Welcome Back
        </h1>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 rounded"
            onChange={(e) =>
              setData({ ...data, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded"
            onChange={(e) =>
              setData({ ...data, password: e.target.value })
            }
          />
          <button className="w-full py-3 bg-violet-600 text-white rounded">
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-white">
          No account?{" "}
          <Link to="/signup" className="text-cyan-300">
            Signup
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
