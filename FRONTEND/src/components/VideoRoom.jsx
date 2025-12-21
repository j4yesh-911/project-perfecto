import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../services/socket";
import { useIncomingCall } from "../context/IncomingCallContext";
import {
  startLocalStream,
  createPeerConnection,
  createOffer,
  handleOffer,
  handleAnswer,
  addIceCandidate,
} from "../services/webrtc";

export default function VideoRoom({ isCaller }) {
  const localVideo = useRef();
  const remoteVideo = useRef();
  // const ringtone = useRef(); // REMOVED: using fallback beep instead
  const socket = getSocket();
  const { chatId } = useParams();
  const { clearIncomingCall } = useIncomingCall();

  // Use onEnd if provided, otherwise use onClose as fallback
  const handleEnd = onEnd || onClose || (() => {});

  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting', 'incoming', 'active', 'ended', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingOffer, setPendingOffer] = useState(null); // Store pending offer for receiver

  useEffect(() => {
    // Clear any incoming call notification when VideoRoom mounts
    clearIncomingCall();
    
    // Set initial call status
    if (!isCaller) {
      setCallStatus('incoming');
    } else {
      setCallStatus('connecting');
    }

    const init = async () => {
      console.log("🎥 Starting video call, isCaller:", isCaller);
      try {
        // 1️⃣ Start camera FIRST
        await startLocalStream(localVideo);

        // 2️⃣ Create peer AFTER stream exists
        await createPeerConnection(socket, chatId, remoteVideo);

        // 3️⃣ Caller creates offer
        if (isCaller) {
          console.log("📞 Creating offer");
          await createOffer(socket, chatId);
        }

        // 4️⃣ Socket signaling (after peer connection is ready)
        socket.on("webrtcOffer", async (offer) => {
          console.log("📨 Received offer");
          if (!isCaller) {
            // Store the offer for later handling
            setPendingOffer(offer);
            
            // Play ringtone
            console.log("🎵 Attempting to play ringtone");
            playFallbackRingtone();
            
            // Show browser notification
            console.log("🔔 Attempting to show notification, permission:", Notification.permission);
            if ('Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('Incoming Call', {
                  body: 'Someone is calling you!',
                  requireInteraction: true
                });
                console.log("✅ Notification shown");
              } else if (Notification.permission !== 'denied') {
                console.log("🔄 Requesting notification permission");
                Notification.requestPermission().then(permission => {
                  console.log("Permission result:", permission);
                  if (permission === 'granted') {
                    new Notification('Incoming Call', {
                      body: 'Someone is calling you!',
                      requireInteraction: true
                    });
                      console.log("✅ Notification shown after permission");
                  }
                });
              } else {
                console.log("❌ Notification permission denied");
              }
            } else {
              console.log("❌ Notification API not supported");
            }
          } else {
            // If somehow caller receives offer, handle it normally
            await handleOffer(socket, chatId, offer);
          }
        });

        socket.on("webrtcAnswer", async (answer) => {
          console.log("📨 Received answer");
          await handleAnswer(answer);
          
          // For caller, call is now active after receiving answer
          if (isCaller) {
            setCallStatus('active');
          }
        });

        socket.on("iceCandidate", async (candidate) => {
          console.log("🧊 Received ICE candidate");
          await addIceCandidate(candidate);
        });

        socket.on("callEnd", () => {
          console.log("📞 Call ended by other user");
          // Ringtone is handled by fallback beep which is short
          setCallStatus('ended');
          endWebRTCCall();
          handleEnd();
        });

        socket.on("callDeclined", () => {
          console.log("📞 Call declined by receiver");
          // Ringtone is handled by fallback beep which is short
          setCallStatus('ended');
          endWebRTCCall();
          handleEnd();
        });
      } catch (error) {
        console.error("Error initializing video call:", error);
        setCallStatus('error');
        setErrorMessage(error.message || "Failed to start video call. Please try again.");
      }
    };

    init();

    return () => {
      socket.off("webrtcOffer");
      socket.off("webrtcAnswer");
      socket.off("iceCandidate");
      socket.off("callEnd");
      socket.off("callDeclined");
    };
  }, [isCaller]);

  return (
    <div className="flex gap-4 p-4 bg-black">
      <video
        ref={localVideo}
        autoPlay
        playsInline
        muted
        className="w-1/2 rounded-lg border"
      />
      <video
        ref={remoteVideo}
        autoPlay
        playsInline
        className="w-1/2 rounded-lg border"
      />
    </div>
  );
}
