// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { User, User2 } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import API from "../services/api";
// import { useTheme } from "../context/ThemeContext";

// export default function Profile() {
//   const navigate = useNavigate();
//   const { dark } = useTheme();

//   const [profile, setProfile] = useState({
//     name: "",
//     age: "",
//     gender: "",
//     email: "",
//     phone: "",
//     username: "",
//     address: "",
//     skillsToLearn: [],
//     skillsToTeach: [],
//     profilePic: "",
//   });

//   const [loading, setLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [originalProfile, setOriginalProfile] = useState(null);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           navigate("/login");
//           return;
//         }

//         const res = await API.get("/auth/me", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const data = {
//           name: res.data.name || "",
//           age: res.data.age || "",
//           gender: res.data.gender || "",
//           email: res.data.email || "",
//           phone: res.data.phone || "",
//           username: res.data.username || "",
//           address: res.data.address || "",
//           skillsToLearn: res.data.skillsToLearn || [],
//           skillsToTeach: res.data.skillsToTeach || [],
//           profilePic: res.data.profilePic || "",
//         };

//         setProfile(data);
//         setOriginalProfile(data);
//       } catch (error) {
//         console.error("Failed to fetch profile:", error);
//         navigate("/login");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [navigate]);

//   const ProfileIcon = profile.gender === "Baddie" ? User2 : User;

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setProfile((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSave = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       await API.put(
//         "/users/update-profile",
//         profile,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setOriginalProfile(profile);
//       setIsEditing(false);
//       alert("Profile updated successfully!");
//     } catch (error) {
//       console.error("Update failed:", error);
//       alert("Failed to update profile");
//     }
//   };

//   const handleCancel = () => {
//     setProfile(originalProfile);
//     setIsEditing(false);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-xl">Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-8">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className={`max-w-2xl mx-auto p-8 rounded-2xl backdrop-blur
//           ${dark ? "bg-white/10 text-white" : "bg-black/5 text-black"}`}
//       >
//         <h1 className="text-3xl font-bold text-center mb-8 text-neon">
//           Profile
//         </h1>

//         {/* ACTION BUTTONS */}
//         <div className="text-center mb-6 flex gap-4 justify-center">
//           {!isEditing ? (
//             <button
//               onClick={() => setIsEditing(true)}
//               className="px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-400
//                          rounded-lg font-semibold text-white"
//             >
//                Edit Profile
//             </button>
//           ) : (
//             <>
//               <button
//                 onClick={handleSave}
//                 className="px-6 py-2 bg-green-500 rounded-lg text-white"
//               >
//                  Save
//               </button>
//               <button
//                 onClick={handleCancel}
//                 className="px-6 py-2 bg-red-500 rounded-lg text-white"
//               >
//                  Cancel
//               </button>
//             </>
//           )}
//         </div>

//         {/* PROFILE PIC */}
//         <div className="flex justify-center mb-8">
//           {profile.profilePic ? (
//             <img
//               src={profile.profilePic}
//               alt="Profile"
//               className="w-32 h-32 rounded-full object-cover border-4 border-neon"
//             />
//           ) : (
//             <div
//               className={`w-32 h-32 rounded-full flex items-center justify-center
//                 ${dark ? "bg-gray-600" : "bg-gray-300"}`}
//             >
//               <ProfileIcon size={64} />
//             </div>
//           )}
//         </div>

//         {/* FIELDS */}
//         <div className="space-y-6">
//           {[
//             ["name", "Name"],
//             ["username", "Username"],
//             ["age", "Age"],
//             ["phone", "Phone"],
//             ["address", "Address"],
//           ].map(([key, label]) => (
//             <div key={key}>
//               <label className="block text-sm mb-2">{label}</label>
//               <input
//                 name={key}
//                 value={profile[key]}
//                 onChange={handleInputChange}
//                 readOnly={!isEditing}
//                 className={`w-full p-3 rounded-lg border
//                   ${dark ? "bg-white/10 border-white/20" : "bg-black/5 border-black/20"}`}
//               />
//             </div>
//           ))}

//           {/* EMAIL (READ ONLY) */}
//           <div>
//             <label className="block text-sm mb-2">Email</label>
//             <input
//               value={profile.email}
//               readOnly
//               className={`w-full p-3 rounded-lg border
//                 ${dark ? "bg-white/10 border-white/20" : "bg-black/5 border-black/20"}`}
//             />
//           </div>

//           {/* SKILLS */}
//           {[
//             ["skillsToLearn", "Skills to Learn"],
//             ["skillsToTeach", "Skills to Teach"],
//           ].map(([key, label]) => (
//             <div key={key}>
//               <label className="block text-sm mb-2">{label}</label>
//               {isEditing ? (
//                 <input
//                   value={profile[key].join(", ")}
//                   onChange={(e) =>
//                     setProfile((prev) => ({
//                       ...prev,
//                       [key]: e.target.value.split(",").map(s => s.trim()).filter(Boolean),
//                     }))
//                   }
//                   className={`w-full p-3 rounded-lg border
//                     ${dark ? "bg-white/10 border-white/20" : "bg-black/5 border-black/20"}`}
//                 />
//               ) : (
//                 <div className="flex flex-wrap gap-2">
//                   {profile[key].map((skill, i) => (
//                     <span
//                       key={i}
//                       className="px-3 py-1 rounded-full text-sm bg-neon/20 text-neon"
//                     >
//                       {skill}
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// }




// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { MapPin, Edit3, Save, X, User } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import API from "../services/api";
// import { useTheme } from "../context/ThemeContext";

// export default function Profile() {
//   const navigate = useNavigate();
//   const { dark } = useTheme();

//   const [profile, setProfile] = useState({
//     name: "",
//     username: "",
//     phone: "",
//     email: "",
//     location: "",
//     city: "",
//     state: "",
//     skillsToTeach: [],
//     skillsToLearn: [],
//     profilePic: "",
//   });

//   const [teachInput, setTeachInput] = useState("");
//   const [learnInput, setLearnInput] = useState("");

//   const [originalProfile, setOriginalProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [locating, setLocating] = useState(false);

//   // ================= FETCH PROFILE =================
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const res = await API.get("/auth/me");

//         const data = {
//           name: res.data.name || "",
//           username: res.data.username || "",
//           phone: res.data.phone || "",
//           email: res.data.email || "",
//           location: res.data.location || "",
//           city: res.data.city || "",
//           state: res.data.state || "",
//           skillsToTeach: res.data.skillsToTeach || [],
//           skillsToLearn: res.data.skillsToLearn || [],
//           profilePic: res.data.profilePic || "",
//         };

//         setProfile(data);
//         setOriginalProfile(data);
//       } catch {
//         navigate("/login");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [navigate]);

//   // ================= GPS LOCATION =================
//   const detectLocation = () => {
//     if (!navigator.geolocation) {
//       alert("Geolocation not supported");
//       return;
//     }

//     setLocating(true);

//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         try {
//           const { latitude, longitude } = pos.coords;

//           const res = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
//             {
//               headers: { "User-Agent": "SkillSwapApp/1.0" },
//             }
//           );

//           const data = await res.json();

//           setProfile((p) => ({
//             ...p,
//             location: data.display_name || "",
//             city:
//               data.address.city ||
//               data.address.town ||
//               data.address.village ||
//               "",
//             state: data.address.state || "",
//           }));
//         } catch {
//           alert("Failed to fetch location");
//         } finally {
//           setLocating(false);
//         }
//       },
//       () => {
//         alert("Location permission denied");
//         setLocating(false);
//       }
//     );
//   };

//   // ================= SKILL HANDLERS =================
//   const addSkill = (key, value, clearInput) => {
//     if (!value.trim()) return;

//     setProfile((p) => {
//       if (p[key].includes(value.trim())) return p;
//       return { ...p, [key]: [...p[key], value.trim()] };
//     });

//     clearInput("");
//   };

//   const removeSkill = (key, skill) => {
//     setProfile((p) => ({
//       ...p,
//       [key]: p[key].filter((s) => s !== skill),
//     }));
//   };

//   // ================= SAVE / CANCEL =================
//   const handleSave = async () => {
//     try {
//       await API.put("/users/update-profile", profile);
//       setOriginalProfile(profile);
//       setIsEditing(false);
//       alert("Profile updated successfully");
//     } catch {
//       alert("Profile update failed");
//     }
//   };

//   const handleCancel = () => {
//     setProfile(originalProfile);
//     setIsEditing(false);
//   };

//   if (loading) return <p className="text-center mt-20">Loading...</p>;

//   // ================= UI =================
//   return (
//     <div
//       className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
//       style={{
//         backgroundImage:
//           "url(https://i.pinimg.com/1200x/7c/88/56/7c8856e15121993790413dcfb670e1b4.jpg)",
//       }}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-4xl rounded-3xl bg-white/70 dark:bg-white/10
//         backdrop-blur-2xl border border-white/30 shadow-2xl p-8 pointer-events-auto"
//       >
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-8">
//           <div className="flex items-center gap-5">
//             <div className="w-24 h-24 rounded-full bg-gray-400 flex items-center justify-center">
//               <User size={48} />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold">{profile.name}</h1>
//               <p className="text-gray-500">{profile.email}</p>
//             </div>
//           </div>

//           {!isEditing ? (
//             <button
//               onClick={() => setIsEditing(true)}
//               className="px-5 py-2 rounded-xl bg-black text-white"
//             >
//               <Edit3 size={16} /> Edit
//             </button>
//           ) : (
//             <div className="flex gap-3">
//               <button
//                 onClick={handleSave}
//                 className="px-4 py-2 rounded-xl bg-green-500 text-white"
//               >
//                 <Save size={16} /> Save
//               </button>
//               <button
//                 onClick={handleCancel}
//                 className="px-4 py-2 rounded-xl bg-red-500 text-white"
//               >
//                 <X size={16} /> Cancel
//               </button>
//             </div>
//           )}
//         </div>

//         {/* LOCATION */}
//         {isEditing && (
//           <button
//             onClick={detectLocation}
//             disabled={locating}
//             className="mb-6 px-4 py-2 rounded-xl bg-cyan-500/20 flex items-center gap-2"
//           >
//             <MapPin size={16} />
//             {locating ? "Detecting..." : "Detect Location"}
//           </button>
//         )}

//         {/* SKILLS TO TEACH */}
//         <div className="mb-6">
//           <h3 className="font-semibold mb-2">Skills I Teach</h3>
//           {isEditing && (
//             <div className="flex gap-2 mb-2">
//               <input
//                 value={teachInput}
//                 onChange={(e) => setTeachInput(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     e.preventDefault();
//                     addSkill("skillsToTeach", teachInput, setTeachInput);
//                   }
//                 }}
//                 placeholder="Type skill & press Enter"
//                 className="flex-1 p-3 rounded-xl bg-white/60"
//               />
//               <button
//                 onClick={() =>
//                   addSkill("skillsToTeach", teachInput, setTeachInput)
//                 }
//                 className="px-4 rounded-xl bg-black text-white"
//               >
//                 Add
//               </button>
//             </div>
//           )}

//           <div className="flex flex-wrap gap-2">
//             {profile.skillsToTeach.map((s, i) => (
//               <span
//                 key={i}
//                 className="px-3 py-1 rounded-full bg-black/10 text-sm flex items-center gap-2"
//               >
//                 {s}
//                 {isEditing && (
//                   <button
//                     onClick={() => removeSkill("skillsToTeach", s)}
//                     className="text-red-500"
//                   >
//                     ×
//                   </button>
//                 )}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* SKILLS TO LEARN */}
//         <div>
//           <h3 className="font-semibold mb-2">Skills I Want</h3>
//           {isEditing && (
//             <div className="flex gap-2 mb-2">
//               <input
//                 value={learnInput}
//                 onChange={(e) => setLearnInput(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     e.preventDefault();
//                     addSkill("skillsToLearn", learnInput, setLearnInput);
//                   }
//                 }}
//                 placeholder="Type skill & press Enter"
//                 className="flex-1 p-3 rounded-xl bg-white/60"
//               />
//               <button
//                 onClick={() =>
//                   addSkill("skillsToLearn", learnInput, setLearnInput)
//                 }
//                 className="px-4 rounded-xl bg-black text-white"
//               >
//                 Add
//               </button>
//             </div>
//           )}

//           <div className="flex flex-wrap gap-2">
//             {profile.skillsToLearn.map((s, i) => (
//               <span
//                 key={i}
//                 className="px-3 py-1 rounded-full bg-black/10 text-sm flex items-center gap-2"
//               >
//                 {s}
//                 {isEditing && (
//                   <button
//                     onClick={() => removeSkill("skillsToLearn", s)}
//                     className="text-red-500"
//                   >
//                     ×
//                   </button>
//                 )}
//               </span>
//             ))}
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Edit3,
  Save,
  X,
  User,
  Phone,
  AtSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

export default function Profile() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [profile, setProfile] = useState({
    name: "",
    username: "",
    phone: "",
    email: "",
    location: "",
    city: "",
    state: "",
    skillsToTeach: [],
    skillsToLearn: [],
    profilePic: "",
  });

  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [locating, setLocating] = useState(false);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/me");

        const data = {
          name: res.data.name || "",
          username: res.data.username || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
          location: res.data.location || "",
          city: res.data.city || "",
          state: res.data.state || "",
          skillsToTeach: res.data.skillsToTeach || [],
          skillsToLearn: res.data.skillsToLearn || [],
          profilePic: res.data.profilePic || "",
        };

        setProfile(data);
        setOriginalProfile(data);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  /* ================= GPS ================= */
  const detectLocation = () => {
    if (!navigator.geolocation) return alert("GPS not supported");

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "User-Agent": "SkillSwapApp/1.0" } }
          );
          const data = await res.json();

          setProfile((p) => ({
            ...p,
            location: data.display_name || "",
            city:
              data.address.city ||
              data.address.town ||
              data.address.village ||
              "",
            state: data.address.state || "",
          }));
        } catch {
          alert("Failed to detect location");
        } finally {
          setLocating(false);
        }
      },
      () => {
        alert("Permission denied");
        setLocating(false);
      }
    );
  };

  /* ================= SKILLS ================= */
  const addSkill = (key, value, clear) => {
    if (!value.trim()) return;
    setProfile((p) =>
      p[key].includes(value.trim())
        ? p
        : { ...p, [key]: [...p[key], value.trim()] }
    );
    clear("");
  };

  const removeSkill = (key, skill) => {
    setProfile((p) => ({
      ...p,
      [key]: p[key].filter((s) => s !== skill),
    }));
  };

  /* ================= SAVE / CANCEL ================= */
  const handleSave = async () => {
    try {
      await API.put("/users/update-profile", profile);
      setOriginalProfile(profile);
      setIsEditing(false);
    } catch {
      alert("Update failed");
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "url(https://i.pinimg.com/1200x/7c/88/56/7c8856e15121993790413dcfb670e1b4.jpg)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl rounded-3xl 
        bg-white/60 dark:bg-black/30 
        backdrop-blur-2xl border border-white/30 
        shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white">
              <User size={44} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-sm opacity-70">{profile.email}</p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 rounded-xl 
              bg-white/20 backdrop-blur-md 
              hover:bg-white/30 transition flex items-center gap-2"
            >
              <Edit3 size={16} /> Edit
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl 
                bg-green-500/30 hover:bg-green-500/50 
                backdrop-blur-md transition flex items-center gap-2"
              >
                <Save size={16} /> Save
              </button>
              <button
                onClick={handleCancel}
                className="px-5 py-2 rounded-xl 
                bg-red-500/30 hover:bg-red-500/50 
                backdrop-blur-md transition flex items-center gap-2"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* INFO GRID */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Info label="Username" icon={<AtSign />} value={profile.username} />
          <Info label="Phone" icon={<Phone />} value={profile.phone} />
          <Info label="City" value={profile.city} />
          <Info label="State" value={profile.state} />
        </div>

        {/* LOCATION */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin size={16} /> Location
            </h3>
            {isEditing && (
              <button
                onClick={detectLocation}
                disabled={locating}
                className="text-sm px-4 py-1 rounded-lg 
                bg-cyan-500/20 hover:bg-cyan-500/40 transition"
              >
                {locating ? "Detecting..." : "Detect GPS"}
              </button>
            )}
          </div>
          <p className="text-sm opacity-80">{profile.location || "Not set"}</p>
        </div>

        {/* SKILLS */}
        {["skillsToTeach", "skillsToLearn"].map((key, idx) => (
          <div key={key} className="mb-6">
            <h3 className="font-semibold mb-2">
              {idx === 0 ? "Skills I Teach" : "Skills I Want"}
            </h3>

            {isEditing && (
              <input
                className="w-full p-3 mb-3 rounded-xl bg-white/60"
                placeholder="Type & press Enter"
                value={idx === 0 ? teachInput : learnInput}
                onChange={(e) =>
                  idx === 0
                    ? setTeachInput(e.target.value)
                    : setLearnInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(
                      key,
                      idx === 0 ? teachInput : learnInput,
                      idx === 0 ? setTeachInput : setLearnInput
                    );
                  }
                }}
              />
            )}

            <div className="flex flex-wrap gap-2">
              {profile[key].map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full 
                  bg-black/10 text-sm flex items-center gap-2"
                >
                  {s}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(key, s)}
                      className="text-red-500"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ================= SMALL INFO COMPONENT ================= */
function Info({ label, value, icon }) {
  return (
    <div className="p-4 rounded-xl bg-white/40 backdrop-blur-md">
      <p className="text-xs opacity-60 mb-1 flex items-center gap-2">
        {icon} {label}
      </p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

