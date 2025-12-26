// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import API from "../services/api";

// export default function CompleteProfile() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     username: "",
//     age: "",
//     gender: "",
//     phone: "",
//     location: "",
//     city: "",
//     state: "",
//     skillsToTeach: "",
//     skillsToLearn: "",
//     profilePic: "",
//   });

//   const [showCamera, setShowCamera] = useState(false);
//   const [stream, setStream] = useState(null);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [checkedAuth, setCheckedAuth] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const fetchMe = async () => {
//       try {
//         const res = await API.get("/auth/me", {
//   headers: {
//     Authorization: `Bearer ${token}`,
//   },
// });


//         setForm((prev) => ({
//           ...prev,
//           name: res.data.name,
//           email: res.data.email,
//         }));

//         setCheckedAuth(true);
//       } catch {
//         navigate("/login");
//       }
//     };

//     fetchMe();
//   }, [navigate]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         setForm((prev) => ({ ...prev, profilePic: reader.result }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const openCamera = async () => {
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: 'environment' } // Back camera
//       });
//       setStream(mediaStream);
//       setShowCamera(true);
//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//       }
//     } catch (error) {
//       console.error('Error accessing camera:', error);
//       alert('Unable to access camera. Please check permissions.');
//     }
//   };

//   const capturePhoto = () => {
//     if (videoRef.current && canvasRef.current) {
//       const canvas = canvasRef.current;
//       const video = videoRef.current;
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext('2d');
//       ctx.drawImage(video, 0, 0);
//       const imageData = canvas.toDataURL('image/jpeg');
//       setForm((prev) => ({ ...prev, profilePic: imageData }));
//       closeCamera();
//     }
//   };

//   const closeCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//       setStream(null);
//     }
//     setShowCamera(false);
//   };

//   const detectLocation = () => {
//     if (!navigator.geolocation) {
//       alert('Geolocation is not supported by this browser.');
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
        
//         try {
//           // Use reverse geocoding to get location name
//           const response = await fetch(
//             `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
//           );
//           const data = await response.json();
          
//           const locationString = `${data.city || data.locality || ''}, ${data.principalSubdivision || data.countryCode || ''}`.trim();
//           setForm(prev => ({ ...prev, location: locationString || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
//         } catch (error) {
//           console.error('Error getting location name:', error);
//           // Fallback to coordinates
//           setForm(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
//         }
//       },
//       (error) => {
//         console.error('Error getting location:', error);
//         alert('Unable to retrieve your location. Please enter it manually.');
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 300000 // 5 minutes
//       }
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       await API.post(
//         "/users/complete-profile",
//         {
//           ...form,
//           skillsToTeach: form.skillsToTeach.split(","),
//           skillsToLearn: form.skillsToLearn.split(","),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       navigate("/dashboard");
//     } catch {
//       alert("Profile update failed");
//     }
//   };

//   // ⛔ prevent redirect flash
//   if (!checkedAuth) return null;

//   return (
//     <div className="min-h-screen p-8 bg-gradient-to-br from-black via-slate-900 to-black text-white">
//       <motion.form
//         onSubmit={handleSubmit}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-2xl mx-auto glass p-8 rounded-2xl max-h-[90vh] overflow-y-auto"
//       >
//         <h2 className="text-3xl font-bold text-center mb-8 text-neon">Complete Profile</h2>

//         {/* Profile Picture */}
//         <div className="flex flex-col items-center mb-8">
//           {form.profilePic ? (
//             <img
//               src={form.profilePic}
//               alt="Profile Preview"
//               className="w-32 h-32 rounded-full object-cover border-4 border-neon mb-4"
//             />
//           ) : (
//             <div className="w-32 h-32 rounded-full bg-gray-600 border-4 border-neon flex items-center justify-center mb-4">
//               <span className="text-white text-4xl">👤</span>
//             </div>
//           )}
//           <div className="flex gap-4">
//             <label className="px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-lg cursor-pointer hover:opacity-90 transition text-white font-medium">
//               📁 Choose from Device
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="hidden"
//               />
//             </label>
//             <button
//               type="button"
//               onClick={openCamera}
//               className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg hover:opacity-90 transition text-white font-medium"
//             >
//               📷 Click Photo
//             </button>
//           </div>
//         </div>

//         <input value={form.name} readOnly className="w-full p-3 rounded-lg bg-white/10 border border-white/20 mb-4" />
//         <input value={form.email} readOnly className="w-full p-3 rounded-lg bg-white/10 border border-white/20 mb-4" />

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <label className="block text-sm font-medium mb-2 text-neon">Username</label>
//             <input
//               name="username"
//               placeholder="Enter username"
//               value={form.username}
//               onChange={handleChange}
//               className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-2 text-neon">Age</label>
//             <input
//               name="age"
//               type="number"
//               placeholder="Enter age"
//               value={form.age}
//               onChange={handleChange}
//               className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
//             />
//           </div>
//         </div>

//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-2 text-neon">Gender</label>
//           <select
//             name="gender"
//             value={form.gender}
//             onChange={handleChange}
//             className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition text-white"
//           >
//             <option value="" className="bg-slate-800">Select Gender</option>
//             <option value="Male" className="bg-slate-800">Male</option>
//             <option value="Female" className="bg-slate-800">Female</option>
//             <option value="Other" className="bg-slate-800">Other</option>
//           </select>
//         </div>

//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-2 text-neon">Phone</label>
//           <input
//             name="phone"
//             placeholder="Enter phone number"
//             value={form.phone}
//             onChange={handleChange}
//             className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
//           />
//         </div>

//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-2 text-neon">Address</label>
//           <div className="flex gap-2">
//             <input
//               name="location"
//               placeholder="Enter your location"
//               value={form.location}
//               onChange={handleChange}
//               className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
//             />
//             <button
//               type="button"
//               onClick={detectLocation}
//               className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:opacity-90 transition text-white font-medium whitespace-nowrap"
//             >
//               📍 Detect Location
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <label className="block text-sm font-medium mb-2 text-neon">City</label>
//             <input
//               name="city"
//               placeholder="Enter your city"
//               value={form.city}
//               onChange={handleChange}
//               className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-2 text-neon">State</label>
//             <input
//               name="state"
//               placeholder="Enter your state"
//               value={form.state}
//               onChange={handleChange}
//               className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
//             />
//           </div>
//         </div>

//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-2 text-neon">Skills to Teach (comma-separated)</label>
//           <input
//             name="skillsToTeach"
//             placeholder="e.g., React, Node.js, Python"
//             value={form.skillsToTeach}
//             onChange={handleChange}
//             className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
//           />
//         </div>

//         <div className="mb-8">
//           <label className="block text-sm font-medium mb-2 text-neon">Skills to Learn (comma-separated)</label>
//           <input
//             name="skillsToLearn"
//             placeholder="e.g., JavaScript, Design, Marketing"
//             value={form.skillsToLearn}
//             onChange={handleChange}
//             className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-neon focus:outline-none transition"
//           />
//         </div>

//         <button className="w-full py-3 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-lg font-semibold hover:opacity-90 transition text-white">
//           Save Profile
//         </button>
//       </motion.form>

//       {/* Camera Modal */}
//       {showCamera && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
//           <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl max-w-md w-full mx-4">
//             <h3 className="text-xl font-bold text-center mb-4 text-neon">Take Photo</h3>
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               className="w-full rounded-lg mb-4"
//             />
//             <canvas ref={canvasRef} className="hidden" />
//             <div className="flex gap-4">
//               <button
//                 onClick={capturePhoto}
//                 className="flex-1 py-2 bg-green-500 rounded-lg font-medium hover:opacity-90 transition"
//               >
//                 📸 Capture
//               </button>
//               <button
//                 onClick={closeCamera}
//                 className="flex-1 py-2 bg-red-500 rounded-lg font-medium hover:opacity-90 transition"
//               >
//                 ❌ Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [checkedAuth, setCheckedAuth] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    age: "",
    gender: "",
    phone: "",
    location: "",
    city: "",
    state: "",
    skillsToTeach: "",
    skillsToLearn: "",
    profilePic: "",
  });

  /* ================= AUTH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    API.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setForm((p) => ({
          ...p,
          name: res.data.name,
          email: res.data.email,
        }));
        setCheckedAuth(true);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  if (!checkedAuth) return null;

  /* ================= HANDLERS ================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setForm((p) => ({ ...p, profilePic: reader.result }));
    reader.readAsDataURL(file);
  };

  /* ================= CAMERA (FIXED) ================= */
  const openCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      setStream(media);
      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      alert("Camera permission denied");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/jpeg", 0.9);
    setForm((p) => ({ ...p, profilePic: img }));
    closeCamera();
  };

  const closeCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setShowCamera(false);
  };

  /* ================= LOCATION (IMPROVED) ================= */
  const detectLocation = () => {
    if (!navigator.geolocation) return alert("GPS not supported");

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await res.json();

        setForm((p) => ({
          ...p,
          location: `${data.city || ""}, ${data.principalSubdivision || ""}`,
          city: data.city || "",
          state: data.principalSubdivision || "",
        }));

        setLocating(false);
      },
      () => {
        alert("Unable to fetch location");
        setLocating(false);
      }
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    await API.post(
      "/users/complete-profile",
      {
        ...form,
        skillsToTeach: form.skillsToTeach.split(","),
        skillsToLearn: form.skillsToLearn.split(","),
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "url(https://i.pinimg.com/1200x/7c/88/56/7c8856e15121993790413dcfb670e1b4.jpg)",
      }}
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/30 p-10 max-h-[90vh] overflow-y-auto"
      >
        <h1 className="text-3xl font-semibold text-center mb-10">
          Complete your profile
        </h1>

        {/* ================= PROFILE PIC ================= */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            {form.profilePic ? (
              <img
                src={form.profilePic}
                className="w-32 h-32 rounded-full object-cover border border-white/40"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/60" />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <label className="px-4 py-2 rounded-xl bg-white/30 cursor-pointer">
              Upload
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </label>
            <button
              type="button"
              onClick={openCamera}
              className="px-4 py-2 rounded-xl bg-white/30"
            >
              Camera
            </button>
          </div>
        </div>

        <Field value={form.name} readOnly />
        <Field value={form.email} readOnly />

        <Grid>
          <Field name="username" placeholder="Username" value={form.username} onChange={handleChange} />
          <Field name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} />
        </Grid>

        <Select name="gender" value={form.gender} onChange={handleChange} />

        <Field name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />

        <div className="flex gap-3 mb-4">
          <Field name="location" placeholder="Address" value={form.location} onChange={handleChange} />
          <button
            type="button"
            onClick={detectLocation}
            disabled={locating}
            className="px-4 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center min-w-[100px]"
          >
            {locating ? (
              <span className="animate-spin h-4 w-4 border-2 border-black/30 border-t-black rounded-full" />
            ) : (
              "📍 Detect"
            )}
          </button>
        </div>

        <Grid>
          <Field name="city" placeholder="City" value={form.city} onChange={handleChange} />
          <Field name="state" placeholder="State" value={form.state} onChange={handleChange} />
        </Grid>

        <Field
          name="skillsToTeach"
          placeholder="Skills you can teach"
          value={form.skillsToTeach}
          onChange={handleChange}
        />

        <Field
          name="skillsToLearn"
          placeholder="Skills you want to learn"
          value={form.skillsToLearn}
          onChange={handleChange}
        />

        <button className="w-full mt-8 py-3 rounded-xl bg-black text-white">
          Save Profile
        </button>
      </motion.form>

      {/* ================= CAMERA MODAL ================= */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <video ref={videoRef} autoPlay className="rounded-lg mb-4 w-full" />
            <canvas ref={canvasRef} hidden />
            <div className="flex gap-3">
              <button onClick={capturePhoto} className="flex-1 py-2 bg-black text-white rounded-xl">
                Capture
              </button>
              <button onClick={closeCamera} className="flex-1 py-2 bg-gray-200 rounded-xl">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= UI HELPERS ================= */
const Field = ({ readOnly, ...props }) => (
  <input
    {...props}
    readOnly={readOnly}
    className={`w-full p-3 rounded-xl mb-4 border border-white/30 ${
      readOnly ? "bg-white/20" : "bg-white/40"
    }`}
  />
);

const Grid = ({ children }) => (
  <div className="grid md:grid-cols-2 gap-4">{children}</div>
);

const Select = (props) => (
  <select {...props} className="w-full p-3 rounded-xl mb-4 bg-white/40">
    <option value="">Select gender</option>
    <option>Male</option>
    <option>Female</option>
    <option>Other</option>
  </select>
);
