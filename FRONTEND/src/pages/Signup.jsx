// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import API from "../services/api";

// export default function Signup() {
//   const [data, setData] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const navigate = useNavigate();

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     try {
//       // 🔥 FIXED API ROUTE
//       const res = await API.post("/auth/signup", data);

//       alert(res.data.msg || "Signup successful");
//       navigate("/login");
//     } catch (err) {
//       alert(err.response?.data?.msg || "Signup failed");
//     }
//   };

//   return (
//     <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

//       {/* 🌌 BACKGROUND IMAGE */}
//       <div
//         className="absolute inset-0 bg-cover bg-center scale-110"
//         style={{
//           backgroundImage:
//             "url(https://images.unsplash.com/photo-1519389950473-47ba0277781c)",
//         }}
//       />

//       {/* 🎨 Animated Gradient Overlay */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 2 }}
//         className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/80 to-black/90"
//       />

//       {/* 💎 Glass Card */}
//       <motion.div
//         initial={{ opacity: 0, y: 80, scale: 0.95 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.9, ease: "easeOut" }}
//         className="relative z-10 w-full max-w-md p-8 rounded-3xl 
//         bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_80px_rgba(139,92,246,0.25)]"
//       >

//         {/* ✨ Heading */}
//         <motion.h1
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="text-3xl font-bold text-white text-center"
//         >
//           Create Your Account
//         </motion.h1>

//         <p className="text-center text-slate-300 mt-2">
//           Enter the future of collaboration 🚀
//         </p>

//         {/* 📝 Form */}
//         <form onSubmit={handleSignup} className="mt-6 space-y-4">

//           {["name", "email", "password"].map((field, i) => (
//             <motion.input
//               key={field}
//               initial={{ opacity: 0, x: -30 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.3 + i * 0.1 }}
//               type={field === "password" ? "password" : "text"}
//               placeholder={field.toUpperCase()}
//               required
//               className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 
//               text-white placeholder-slate-400 focus:outline-none 
//               focus:ring-2 focus:ring-violet-500/50 transition-all"
//               onChange={(e) =>
//                 setData({ ...data, [field]: e.target.value })
//               }
//             />
//           ))}

//           {/* 🚀 CTA Button */}
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="w-full mt-4 py-3 rounded-xl font-semibold text-white 
//             bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 
//             shadow-[0_0_30px_rgba(139,92,246,0.6)]"
//           >
//             Create Account
//           </motion.button>
//         </form>

//         {/* 🔗 Login */}
//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.8 }}
//           className="mt-6 text-center text-slate-300"
//         >
//           Already have an account?{" "}
//           <Link
//             to="/login"
//             className="text-violet-400 font-semibold hover:text-cyan-400 transition"
//           >
//             Log in
//           </Link>
//         </motion.p>
//       </motion.div>
//     </div>
//   );
// }



import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function Signup() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/signup", data);

      // 🔐 save token
      localStorage.setItem("token", res.data.token);

      // ➡️ go to complete profile
      navigate("/complete-profile");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1519389950473-47ba0277781c)",
        }}
      />

      <div className="absolute inset-0 bg-black/80" />

      <motion.div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center">
          Create Account
        </h1>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          {["name", "email", "password"].map((field) => (
            <input
              key={field}
              id={field}
              name={field}
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              placeholder={field.toUpperCase()}
              required
              className="w-full p-3 rounded bg-black/40 border border-white/20 text-white"
              onChange={(e) =>
                setData({ ...data, [field]: e.target.value })
              }
            />
          ))}

          <button className="w-full py-3 bg-violet-600 rounded text-white font-semibold">
            Signup
          </button>
        </form>

        <p className="mt-4 text-center text-gray-300">
          Already have account?{" "}
          <Link to="/login" className="text-violet-400">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
