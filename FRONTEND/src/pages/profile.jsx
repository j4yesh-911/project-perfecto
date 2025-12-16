import { useState } from "react";
import { motion } from "framer-motion";
import { User, User2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "Haridrumad",
    age: 20,
    gender: "Walmart bag",
    email: "HDSJ29@gamil.com",
    phone: "+91 7340452164",
    skills: ["React", "Node.js"],
    profilePic: null,
  });

  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
  
    setTimeout(() => {
      navigate("/");
    }, 1500); 
  };

  const ProfileIcon = profile.gender === "Baddie" ? User2 : User;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfile((prev) => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-black via-slate-900 to-black text-white">
      <style>{`
        select option {
          color: white;
          background: rgba(0, 0, 0, 0.8);
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto glass p-8 rounded-2xl"
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-neon">Profile</h1>

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
            <label className="absolute bottom-0 right-0 bg-neon text-black p-2 rounded-full cursor-pointer hover:bg-neon/80 transition">
              📷
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="mt-2 text-gray-400">Click the camera to upload a new picture</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={profile.age}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-black/20 border border-white/20 focus:border-neon focus:outline-none transition text-white"
              > 


                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>              
                <option value="Banna">Banna</option>
                <option value="Chikna">Chikna</option>
                <option value="KawaChudiNinja">KawachudiNinja</option>
                <option value="Waah shampy waah">Waah shampy waah</option>
                <option value="Baddie">Baddie</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-neon text-black px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(index)}
                    className="hover:text-red-500 transition"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a new skill"
                className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
              />
              <button
                onClick={addSkill}
                className="px-4 py-3 bg-neon text-black rounded-lg hover:bg-neon/80 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <motion.button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            animate={saving ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: saving ? Infinity : 0 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}