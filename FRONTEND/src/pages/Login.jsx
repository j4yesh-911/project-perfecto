import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";   // ✅ ONLY THIS IMPORT

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async () => {
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
    <div className="auth-box">
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={(e) =>
          setData({ ...data, email: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setData({ ...data, password: e.target.value })
        }
      />

      <button onClick={handleLogin}>Login</button>

      <p>
        Don’t have an account? <a href="/signup">Signup</a>
      </p>
    </div>
  );
}
