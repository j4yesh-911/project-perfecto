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

  useEffect(() => {
    const handleReceive = (msg) => {
      if (!msg || !msg.chatId) return;

      const currentChatId = location.pathname.startsWith('/chat/') ? location.pathname.split('/chat/')[1] : null;
      if (currentChatId !== msg.chatId) {
        // Show notification
        if (Notification.permission === 'granted') {
          new Notification('New message', {
            body: msg.text,
            icon: '/avatar.png', // or something
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('New message', {
                body: msg.text,
              });
            }
          });
        }
      }
    };

    socket.on('receiveMessage', handleReceive);

    return () => socket.off('receiveMessage', handleReceive);
  }, [location.pathname, socket]);

  return (
    <div className={`min-h-screen ${dark ? 'bg-gradient-to-br from-black via-slate-900 to-black text-white' : 'bg-gradient-to-br from-white via-gray-100 to-gray-200 text-black'}`}>
      <Navbar />
      <AppRoutes />
    </div>
  );
}
