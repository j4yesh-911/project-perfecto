import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useUnreadMessages } from "../context/UnreadMessagesContext";
import { useIncomingCall } from "../context/IncomingCallContext";

export default function Navbar() {
  const { totalUnread } = useUnreadMessages();
  const { incomingCall, clearIncomingCall } = useIncomingCall();
  const navigate = useNavigate();

  const handleAcceptCall = () => {
    if (incomingCall) {
      // Navigate to the chat and the VideoRoom will handle the rest
      navigate(`/chat/${incomingCall.chatId}`);
      clearIncomingCall();
    }
  };

  const handleDeclineCall = () => {
    // Emit decline event and clear notification
    if (incomingCall) {
      const socket = new (require("../services/socket")).getSocket();
      socket.emit("callDeclined", { chatId: incomingCall.chatId });
      clearIncomingCall();
    }
  };

  return (
    <>
      <nav className="flex justify-between items-center px-8 py-4 glass">
        <h1 className="text-xl font-bold text-neon">SkillSwap</h1>
        <div className="flex gap-6">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/chats" className="relative">
            Chats
            {totalUnread > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </Link>
          <Link to="/profile">Profile</Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Incoming Call Notification */}
      {incomingCall && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg">
          <div className="text-center text-white">
            <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              📞
            </div>
            <h3 className="font-semibold mb-1">Incoming Call</h3>
            <p className="text-sm text-gray-300 mb-3">Someone is calling you</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDeclineCall}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptCall}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
