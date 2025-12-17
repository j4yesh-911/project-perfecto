import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";   // ✅ ONLY THIS IMPORT

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await API.post("/auth/login", data); // ✅ API use karo

      alert(res.data.msg);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-slate-900 to-black px-4">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-900/20 via-cyan-800/10 to-indigo-900/20 blur-3xl opacity-70 rounded-2xl" />

        <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 sm:p-10 text-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Welcome Back</h1>
              <p className="text-sm text-slate-300 mt-1">Sign in to continue to your dashboard</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-400 shadow-md flex items-center justify-center">
              <span className="font-bold text-black">P</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block">
              <span className="sr-only">Email</span>
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full bg-white/3 border border-white/10 rounded-lg px-4 py-3 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition"
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="sr-only">Password</span>
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full bg-white/3 border border-white/10 rounded-lg px-4 py-3 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition"
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
            </label>

            <button
              type="submit"
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-400 text-white font-semibold rounded-lg py-3 px-4 hover:scale-[1.02] transform transition shadow-lg"
            >
              Login
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-300">
            Don’t have an account? <Link to="/signup" className="text-black font-medium underline-offset-2 hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
