import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";   // ✅ DEFAULT IMPORT

export default function Signup() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await API.post("/auth/register", data); // ✅ correct route
      alert("Signup successful");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="auth-box">
      <h2>Signup</h2>

      <input
        placeholder="Name"
        onChange={(e) =>
          setData({ ...data, name: e.target.value })
        }
      />

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

      <button onClick={handleSignup}>
        Create Account
      </button>
    </div>
  );
}
