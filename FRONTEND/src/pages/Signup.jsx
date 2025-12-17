import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";   // ✅ DEFAULT IMPORT

export default function Signup() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await API.post("/auth/register", data); // ✅ correct route
      alert("Signup successful");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-slate-900 to-black px-4">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-900/10 via-violet-900/20 to-indigo-900/10 blur-3xl opacity-60 rounded-2xl" />

        <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 sm:p-10 text-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
              <p className="text-sm text-slate-300 mt-1">Join and start collaborating</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 shadow-md flex items-center justify-center">
              <span className="font-bold text-white">P</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <label className="block">
              <span className="sr-only">Name</span>
              <input
                placeholder="Name"
                required
                className="w-full bg-white/3 border border-white/10 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition"
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="sr-only">Email</span>
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full bg-white/3 border border-white/10 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition"
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="sr-only">Password</span>
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full bg-white/3 border border-white/10 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition"
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
            </label>

            <button
              type="submit"
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-400 text-white font-semibold rounded-lg py-3 px-4 hover:scale-[1.02] transform transition shadow-lg"
            >
              Create Account
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-300">
            Already have an account? <Link to="/login" className="text-white font-medium underline-offset-2 hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
