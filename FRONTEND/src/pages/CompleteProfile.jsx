import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function CompleteProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    skillsToTeach: "",
    skillsToLearn: "",
  });

  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await API.get("/auth/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});


        setForm((prev) => ({
          ...prev,
          name: res.data.name,
          email: res.data.email,
        }));

        setCheckedAuth(true);
      } catch {
        navigate("/login");
      }
    };

    fetchMe();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post(
        "/users/complete-profile",
        {
          ...form,
          skillsToTeach: form.skillsToTeach.split(","),
          skillsToLearn: form.skillsToLearn.split(","),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      navigate("/dashboard");
    } catch {
      alert("Profile update failed");
    }
  };

  // ⛔ prevent redirect flash
  if (!checkedAuth) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="w-[420px] p-6 bg-white/10 rounded-xl"
      >
        <h2 className="text-2xl mb-4 text-center">Complete Profile</h2>

        <input value={form.name} readOnly className="w-full p-2 mb-2 bg-black/40" />
        <input value={form.email} readOnly className="w-full p-2 mb-2 bg-black/40" />

        {["username", "age", "phone", "address", "skillsToTeach", "skillsToLearn"].map(
          (f) => (
            <input
              key={f}
              name={f}
              placeholder={f}
              onChange={handleChange}
              className="w-full p-2 mb-2 bg-black/40"
            />
          )
        )}

        <select
          name="gender"
          onChange={handleChange}
          className="w-full p-2 mb-4 bg-black/40"
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <button className="w-full py-2 bg-violet-600 rounded">
          Save Profile
        </button>
      </form>
    </div>
  );
}
