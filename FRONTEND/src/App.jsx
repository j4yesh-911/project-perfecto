import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { getSocket } from "./services/socket";
import { useTheme } from "./context/ThemeContext";

export default function App() {
  const location = useLocation();
  const socket = getSocket();
  const { dark } = useTheme();

  // ❌ pages where navbar should NOT show
  const hideNavbarRoutes = ["/", "/login", "/signup"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  useEffect(() => {
    const handleReceive = (msg) => {
      if (!msg || !msg.chatId) return;

      const currentChatId = location.pathname.startsWith("/chat/")
        ? location.pathname.split("/chat/")[1]
        : null;

      if (currentChatId !== msg.chatId) {
        if (Notification.permission === "granted") {
          new Notification("New message", { body: msg.text });
        }
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [location.pathname, socket]);

  return (
    <div
      className={`min-h-screen ${
        dark
          ? "bg-gradient-to-br from-black via-slate-900 to-black text-white"
          : "bg-gradient-to-br from-white via-gray-100 to-gray-200 text-black"
      }`}
    >
      {/* ✅ Navbar controlled here */}
      {!hideNavbar && <Navbar />}

      {/* ✅ BOTH route groups are fine now */}
      <AppRoutes />
    </div>
  );
}
