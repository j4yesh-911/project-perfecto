import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Incoming-call related hooks were removed; keep placeholder handlers
  const handleAcceptCall = () => {};
  const handleDeclineCall = () => {};

const login = !!window.localStorage.getItem("token");

const logoutfun = () =>{
  localStorage.removeItem("token")
  navigate("/login")
  alert("logged out")
}

const handledashboard = ()=>{
  if(login){
    navigate("/dashboard");
  }else{
    navigate("/login");
  }
}


const handlechat = ()=>{
  if(login){
    navigate("/chats");
  }else{
    navigate("/login");
  }
}


const handleprofile = ()=>{
  if(login){
    navigate("/profile");
  }else{
    navigate("/login");
  }
}

const toggleDropdown = () => {
  setIsDropdownOpen(!isDropdownOpen);
};

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



  return (
    <>
      {/* Incoming-call UI removed: handled in VideoRoom or global provider */}

      <nav className="flex justify-between items-center px-8 py-4 glass relative">
        <h1 className="text-xl font-bold text-neon">SkillSwap</h1>
        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <button onClick={handledashboard} className="hover:text-blue-400 transition-colors">Dashboard</button>
          <button onClick={handlechat} className="hover:text-blue-400 transition-colors">Chats</button>

          <ThemeToggle />

          {/* Settings Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Settings
              <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 dark:bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-50">
                <div className="py-1">
                  <button
                    onClick={handleSettingsProfile}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Profile
                  </button>
                  <button
                    onClick={handleAbout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    About Us
                  </button>
                  <div className="border-t border-gray-600 my-1"></div>
                  <button
                    onClick={handleSettingsLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-red-600 hover:bg-opacity-20 transition-colors text-red-400"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
