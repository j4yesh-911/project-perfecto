import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, User2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
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
        setProfile({
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
        });
        setOriginalProfile({
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
        });
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.put("/users/update-profile", {
        ...profile,
        skillsToTeach: profile.skillsToTeach,
        skillsToLearn: profile.skillsToLearn,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOriginalProfile({ ...profile });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setProfile({ ...originalProfile });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-black via-slate-900 to-black text-white">
      <style>{`
        select option {
          color: white;
          background: rgba(0, 0, 0, 0.8);
        }
      `}</style>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto glass p-8 rounded-2xl"
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-neon">Profile</h1>

        {!isEditing && (
          <div className="text-center mb-6">
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-lg font-semibold hover:opacity-90 transition text-white"
            >
               Edit Profile
            </button>
          </div>
        )}

        {isEditing && (
          <div className="text-center mb-6 flex gap-4 justify-center">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-500 rounded-lg font-semibold hover:opacity-90 transition text-white"
            >
               Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-red-500 rounded-lg font-semibold hover:opacity-90 transition text-white"
            >
              ❌ Cancel
            </button>
          </div>
        )}

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {profile.profilePic ? (
              <img
                src={profile.profilePic}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-neon"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-600 border-4 border-neon flex items-center justify-center">
                <ProfileIcon size={64} className="text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={profile.name}
              readOnly={!isEditing}
              onChange={handleInputChange}
              name="name"
              className={`w-full p-3 rounded-lg bg-white/10 border border-white/20 ${isEditing ? 'focus:border-neon focus:outline-none transition' : ''}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={profile.username}
                readOnly={!isEditing}
                onChange={handleInputChange}
                name="username"
                className={`w-full p-3 rounded-lg bg-white/10 border border-white/20 ${isEditing ? 'focus:border-neon focus:outline-none transition' : ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input
                type="number"
                value={profile.age}
                readOnly={!isEditing}
                onChange={handleInputChange}
                name="age"
                className={`w-full p-3 rounded-lg bg-white/10 border border-white/20 ${isEditing ? 'focus:border-neon focus:outline-none transition' : ''}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            {isEditing ? (
              <select
                value={profile.gender}
                onChange={handleInputChange}
                name="gender"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition text-white"
              >
                <option value="" className="bg-slate-800">Select Gender</option>
                <option value="Male" className="bg-slate-800">Male</option>
                <option value="Female" className="bg-slate-800">Female</option>
                <option value="Other" className="bg-slate-800">Other</option>
              </select>
            ) : (
              <input
                type="text"
                value={profile.gender}
                readOnly
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="text"
              value={profile.phone}
              readOnly={!isEditing}
              onChange={handleInputChange}
              name="phone"
              className={`w-full p-3 rounded-lg bg-white/10 border border-white/20 ${isEditing ? 'focus:border-neon focus:outline-none transition' : ''}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <input
              type="text"
              value={profile.address}
              readOnly={!isEditing}
              onChange={handleInputChange}
              name="address"
              className={`w-full p-3 rounded-lg bg-white/10 border border-white/20 ${isEditing ? 'focus:border-neon focus:outline-none transition' : ''}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skills to Learn</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.skillsToLearn.join(", ")}
                onChange={(e) => setProfile(prev => ({ ...prev, skillsToLearn: e.target.value.split(", ").filter(s => s.trim()) }))}
                placeholder="e.g., React, Node.js, Python"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skillsToLearn.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-neon/20 text-neon rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skills to Teach</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.skillsToTeach.join(", ")}
                onChange={(e) => setProfile(prev => ({ ...prev, skillsToTeach: e.target.value.split(", ").filter(s => s.trim()) }))}
                placeholder="e.g., JavaScript, Design, Marketing"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skillsToTeach.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )}
    </div>
  );
}