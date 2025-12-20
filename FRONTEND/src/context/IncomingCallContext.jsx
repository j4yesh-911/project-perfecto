import { createContext, useContext, useState, useEffect } from "react";
import { getSocket } from "../services/socket";

const IncomingCallContext = createContext(null);

export const IncomingCallProvider = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState(null); // { chatId, callerName, callerId }
  const socket = getSocket();

  const myId = JSON.parse(
    atob(localStorage.getItem("token").split(".")[1])
  ).id;

  useEffect(() => {
    const handleIncomingCall = (offer) => {
      console.log("📞 Incoming call detected");
      // Extract caller info from the offer or chat context
      // For now, we'll show a generic notification
      setIncomingCall({
        chatId: offer.chatId || 'unknown',
        callerName: 'Someone',
        callerId: 'unknown',
        timestamp: Date.now()
      });
    };

    socket.on("webrtcOffer", handleIncomingCall);

    return () => {
      socket.off("webrtcOffer", handleIncomingCall);
    };
  }, [socket]);

  const clearIncomingCall = () => {
    setIncomingCall(null);
  };

  const acceptCall = () => {
    // This will be handled by the VideoRoom component
    clearIncomingCall();
  };

  const declineCall = () => {
    // This will be handled by the VideoRoom component
    clearIncomingCall();
  };

  return (
    <IncomingCallContext.Provider value={{
      incomingCall,
      clearIncomingCall,
      acceptCall,
      declineCall
    }}>
      {children}
    </IncomingCallContext.Provider>
  );
};

export const useIncomingCall = () => {
  const context = useContext(IncomingCallContext);
  if (!context) {
    throw new Error("useIncomingCall must be used inside IncomingCallProvider");
  }
  return context;
};