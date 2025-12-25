import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import { getSocket } from "../services/socket";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = getSocket();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);
  const dropdownRef = useRef(null);

  const login = !!localStorage.getItem("token");

  // ================= CLICK OUTSIDE =================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= SOCKET CHAT NOTIFICATION =================
  useEffect(() => {
    if (!socket || !login) return;

    // when new message arrives
    socket.on("newChatMessage", () => {
      // if user is NOT on chats page, increase count
      if (!location.pathname.startsWith("/chats")) {
        setUnreadChats((prev) => prev + 1);
      }
    });

    return () => {
      socket.off("newChatMessage");
    };
  }, [socket, login, location.pathname]);

  // ================= CLEAR COUNT WHEN CHAT PAGE OPEN =================
  useEffect(() => {
    if (location.pathname.startsWith("/chats")) {
      setUnreadChats(0);
      socket.emit("markChatsRead");
    }
  }, [location.pathname, socket]);

  // ================= ACTIONS =================
  const logoutfun = () => {
    localStorage.removeItem("token");
    navigate("/login");
    alert("logged out");
  };

  const handledashboard = () => (login ? navigate("/dashboard") : navigate("/login"));
  const handlechat = () => (login ? navigate("/chats") : navigate("/login"));
  const handleprofile = () => (login ? navigate("/profile") : navigate("/login"));

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleAbout = () => {
    navigate("/about");
    setIsDropdownOpen(false);
  };

  const handleSettingsProfile = () => {
    handleprofile();
    setIsDropdownOpen(false);
  };

  const handleSettingsLogout = () => {
    logoutfun();
    setIsDropdownOpen(false);
  };

  const match = () => {
    navigate("/match");
    setIsDropdownOpen(false);
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 glass relative">
      <h1 className="text-xl font-bold text-neon">SkillSwap</h1>

      <div className="flex gap-6 items-center">
        <Link to="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>

        <button onClick={handledashboard} className="hover:text-blue-400 transition-colors">
          Dashboard
        </button>

        {/* 🔔 CHAT WITH BADGE */}
        <button
          onClick={handlechat}
          className="relative hover:text-blue-400 transition-colors"
        >
          Chats
          {unreadChats > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadChats}
            </span>
          )}
        </button>

        <button onClick={match} className="hover:text-blue-400 transition-colors">
          Match
        </button>

        <ThemeToggle />

        {/* SETTINGS */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            Settings
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-50">
              <button
                onClick={handleSettingsProfile}
                className="w-full px-4 py-3 text-left hover:bg-gray-700"
              >
                Profile
              </button>

              <button
                onClick={handleAbout}
                className="w-full px-4 py-3 text-left hover:bg-gray-700"
              >
                About Us
              </button>

              <div className="border-t border-gray-600" />

              <button
                onClick={handleSettingsLogout}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-600/20"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
