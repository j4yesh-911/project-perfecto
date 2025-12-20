import { createContext, useContext, useState, useEffect } from "react";
import { getSocket } from "../services/socket";

const UnreadMessagesContext = createContext(null);

export const UnreadMessagesProvider = ({ children }) => {
  const [totalUnread, setTotalUnread] = useState(0);
  const [chatsUnreadCounts, setChatsUnreadCounts] = useState({});

  const socket = getSocket();

  const getMyId = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      return JSON.parse(atob(token.split(".")[1])).id;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  };

  const myId = getMyId();

  useEffect(() => {
    if (!myId) return; // Don't proceed if user is not logged in

    // Load initial unread counts
    const loadUnreadCounts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const chats = await response.json();

        const counts = {};
        let total = 0;
        chats.forEach(chat => {
          const unread = chat.unreadCounts?.[myId] || 0;
          counts[chat._id] = unread;
          total += unread;
        });

        setChatsUnreadCounts(counts);
        setTotalUnread(total);
      } catch (error) {
        console.error('Error loading unread counts:', error);
      }
    };

    loadUnreadCounts();

    // Listen for new messages
    const handleReceive = (message) => {
      if (!message || !message.chatId) return;

      // Check if we're currently in this chat
      const currentPath = window.location.pathname;
      const currentChatId = currentPath.startsWith('/chat/') ? currentPath.split('/chat/')[1] : null;

      // Only increment unread if we're not in the chat
      if (currentChatId !== message.chatId) {
        setChatsUnreadCounts(prev => {
          const newCounts = {
            ...prev,
            [message.chatId]: (prev[message.chatId] || 0) + 1
          };

          // Recalculate total
          const newTotal = Object.values(newCounts).reduce((sum, count) => sum + count, 0);
          setTotalUnread(newTotal);

          return newCounts;
        });
      }
    };

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [socket, myId]);

  // Function to mark chat as read
  const markChatAsRead = (chatId) => {
    setChatsUnreadCounts(prev => {
      const newCounts = { ...prev };
      newCounts[chatId] = 0;

      // Recalculate total
      const newTotal = Object.values(newCounts).reduce((sum, count) => sum + count, 0);
      setTotalUnread(newTotal);

      return newCounts;
    });
  };

  return (
    <UnreadMessagesContext.Provider value={{
      totalUnread,
      chatsUnreadCounts,
      markChatAsRead
    }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error("useUnreadMessages must be used inside UnreadMessagesProvider");
  }
  return context;
};