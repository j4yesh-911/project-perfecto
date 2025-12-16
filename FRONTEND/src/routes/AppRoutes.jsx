import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import LiveSession from "../pages/Livesession";
import Profile from "../pages/profile";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/live" element={<LiveSession />} />
      <Route path="/profile" element={<Profile />} />
      {/* <Route path="/session/:id" element={<Session />} /> */}
    </Routes>
  );
}
