import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
// // import Auth from "../pages/Auth";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import LiveSession from "../pages/LiveSession";
import Profile from "../pages/profile"; 
import Chat from "../pages/Chat";
import ChatsList from "../pages/ChatsList";
import CompleteProfile from "../pages/CompleteProfile";
import About from "../pages/About";
import Match from "../pages/Match";
import SwapRequests from "../pages/SwapRequests";
import Swappers from "../pages/Swappers";
import UserProfilePage from "../pages/UserProfilePage";



export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/auth" element={<Auth />} /> */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/live" element={<LiveSession />} />
      <Route path="/chats" element={<ChatsList />} />
      <Route path="/chat/:chatId" element={<Chat />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/about" element ={<About />} />
      <Route path="/match" element={<Match />} />
      <Route path="/swap-requests" element={<SwapRequests />} />
      <Route path="/swappers" element={<Swappers />} />
      <Route path="/users/:id" element={<UserProfilePage />} />
      {/* <Route path="/session/:id" element={<Session />} /> */}
    </Routes>
  );
}