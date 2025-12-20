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

  // Test notification on app load
  useEffect(() => {
    console.log("🚀 App loaded, testing notification support");
    if ('Notification' in window) {
      console.log("✅ Notification API available, permission:", Notification.permission);
    } else {
      console.log("❌ Notification API not available");
    }
  }, []);

  useEffect(() => {
    const handleReceive = (msg) => {
      console.log('Received message:', msg);
      if (!msg || !msg.chatId) return;

      const currentChatId = location.pathname.startsWith('/chat/') ? location.pathname.split('/chat/')[1] : null;
      console.log('Current chat ID:', currentChatId, 'Message chat ID:', msg.chatId);
      if (currentChatId !== msg.chatId) {
        // Show notification
        console.log('🔔 Showing message notification, permission:', Notification.permission);
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('New message', {
              body: msg.text,
            });
            console.log('✅ Message notification shown');
          } else if (Notification.permission !== 'denied') {
            console.log('🔄 Requesting message notification permission');
            Notification.requestPermission().then(permission => {
              console.log('Message notification permission result:', permission);
              if (permission === 'granted') {
                new Notification('New message', {
                  body: msg.text,
                });
                console.log('✅ Message notification shown after permission');
              }
            });
          } else {
            console.log('❌ Message notification permission denied');
          }
        } else {
          console.log('❌ Notification API not supported');
        }
      } else {
        console.log('📱 User is in chat, no notification needed');
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
