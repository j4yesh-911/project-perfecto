import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, User2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

export default function Profile() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    username: "",
    address: "",
    skillsToLearn: [],
    skillsToTeach: [],
    profilePic: "",
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = {
          name: res.data.name || "",
          age: res.data.age || "",
          gender: res.data.gender || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          username: res.data.username || "",
          address: res.data.address || "",
          skillsToLearn: res.data.skillsToLearn || [],
          skillsToTeach: res.data.skillsToTeach || [],
          profilePic: res.data.profilePic || "",
        };

        setProfile(data);
        setOriginalProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const ProfileIcon = profile.gender === "Baddie" ? User2 : User;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.put(
        "/users/update-profile",
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOriginalProfile(profile);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-2xl mx-auto p-8 rounded-2xl backdrop-blur
          ${dark ? "bg-white/10 text-white" : "bg-black/5 text-black"}`}
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-neon">
          Profile
        </h1>

        {/* ACTION BUTTONS */}
        <div className="text-center mb-6 flex gap-4 justify-center">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-400
                         rounded-lg font-semibold text-white"
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-500 rounded-lg text-white"
              >
                💾 Save
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-red-500 rounded-lg text-white"
              >
                ❌ Cancel
              </button>
            </>
          )}
        </div>

        {/* PROFILE PIC */}
        <div className="flex justify-center mb-8">
          {profile.profilePic ? (
            <img
              src={profile.profilePic}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-neon"
            />
          ) : (
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center
                ${dark ? "bg-gray-600" : "bg-gray-300"}`}
            >
              <ProfileIcon size={64} />
            </div>
          )}
        </div>

        {/* FIELDS */}
        <div className="space-y-6">
          {[
            ["name", "Name"],
            ["username", "Username"],
            ["age", "Age"],
            ["phone", "Phone"],
            ["address", "Address"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm mb-2">{label}</label>
              <input
                name={key}
                value={profile[key]}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`w-full p-3 rounded-lg border
                  ${dark ? "bg-white/10 border-white/20" : "bg-black/5 border-black/20"}`}
              />
            </div>
          ))}

          {/* EMAIL (READ ONLY) */}
          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              value={profile.email}
              readOnly
              className={`w-full p-3 rounded-lg border
                ${dark ? "bg-white/10 border-white/20" : "bg-black/5 border-black/20"}`}
            />
          </div>

          {/* SKILLS */}
          {[
            ["skillsToLearn", "Skills to Learn"],
            ["skillsToTeach", "Skills to Teach"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm mb-2">{label}</label>
              {isEditing ? (
                <input
                  value={profile[key].join(", ")}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      [key]: e.target.value.split(",").map(s => s.trim()).filter(Boolean),
                    }))
                  }
                  className={`w-full p-3 rounded-lg border
                    ${dark ? "bg-white/10 border-white/20" : "bg-black/5 border-black/20"}`}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile[key].map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm bg-neon/20 text-neon"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
