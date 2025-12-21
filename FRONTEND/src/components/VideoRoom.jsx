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
  endCall as endWebRTCCall,
  endCall,
} from "../services/webrtc";

export default function VideoRoom({ isCaller, onEnd, onClose }) {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const ringtone = useRef();
  const socket = getSocket();
  const { chatId } = useParams();
  const { clearIncomingCall } = useIncomingCall();

  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting', 'incoming', 'active', 'ended'
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
            if (ringtone.current) {
              ringtone.current.play().catch(err => {
                console.error("Ringtone play failed:", err);
                // Fallback: create a simple beep sound
                playFallbackRingtone();
              });
            } else {
              playFallbackRingtone();
            }
            
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
          // Stop ringtone if playing
          if (ringtone.current) {
            ringtone.current.pause();
            ringtone.current.currentTime = 0;
          }
          setCallStatus('ended');
          endWebRTCCall();
          onEnd();
        });

        socket.on("callDeclined", () => {
          console.log("📞 Call declined by receiver");
          // Stop ringtone if playing
          if (ringtone.current) {
            ringtone.current.pause();
            ringtone.current.currentTime = 0;
          }
          setCallStatus('ended');
          endWebRTCCall();
          onEnd();
        });
      } catch (error) {
        console.error("Error initializing video call:", error);
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
  }, [isCaller, socket, chatId]);

  const playFallbackRingtone = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log("🔊 Playing fallback beep sound");
    } catch (error) {
      console.error("Fallback ringtone failed:", error);
    }
  };

  const endCall = () => {
    // Notify other user that call has ended
    socket.emit("callEnd", { chatId });
    
    // Stop streams and close connection
    endWebRTCCall();
    onEnd();
  };

  const answerCall = async () => {
    console.log("📞 Answering call");
    // Stop ringtone
    if (ringtone.current) {
      ringtone.current.pause();
      ringtone.current.currentTime = 0;
    }
    
    // Clear incoming call notification
    clearIncomingCall();
    
    // Handle the pending offer
    if (pendingOffer) {
      await handleOffer(socket, chatId, pendingOffer);
      setPendingOffer(null);
      setCallStatus('active');
    }
  };

  const declineCall = () => {
    console.log("📞 Declining call");
    // Stop ringtone
    if (ringtone.current) {
      ringtone.current.pause();
      ringtone.current.currentTime = 0;
    }
    // Clear incoming call notification
    clearIncomingCall();
    // Clear any pending offer
    setPendingOffer(null);
    // Notify caller that call was declined
    socket.emit("callDeclined", { chatId });
    setCallStatus('ended');
    onEnd();
  };

  const handleEndCall = () => {
    endCall();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Incoming Call Screen */}
      {callStatus === 'incoming' && (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Incoming Call</h2>
            <p className="text-gray-300">Someone is calling you...</p>
          </div>
          
          <div className="flex space-x-6">
            <button 
              onClick={declineCall}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L10 8.94l6.72-6.72a.75.75 0 1 1 1.06 1.06L11.06 10l6.72 6.72a.75.75 0 0 1-1.06 1.06L10 11.06l-6.72 6.72a.75.75 0 0 1-1.06-1.06L8.94 10 2.22 3.28a.75.75 0 0 0-1.06-1.06z" />
              </svg>
            </button>
            
            <button 
              onClick={async () => {
                try {
                  await answerCall();
                } catch (error) {
                  console.error("Error answering call:", error);
                }
              }}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L10 8.94l6.72-6.72a.75.75 0 0 1 1.06 1.06L11.06 10l6.72 6.72a.75.75 0 0 1-1.06 1.06L10 11.06l-6.72 6.72a.75.75 0 0 1-1.06-1.06L8.94 10 2.22 3.28a.75.75 0 0 0-1.06-1.06z" transform="rotate(45 10 10)" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Connecting Screen */}
      {callStatus === 'connecting' && (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Connecting...</h2>
            <p className="text-gray-300 mt-2">Setting up your call</p>
          </div>
          <button onClick={endCall} className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full text-lg font-semibold">
            End Call
          </button>
        </div>
      )}

      {/* Active Call Screen */}
      {callStatus === 'active' && (
        <>
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <video
            ref={localVideo}
            autoPlay
            playsInline
            muted
            className="absolute top-4 right-4 w-32 h-24 rounded-lg border-2 border-white"
          />
          <button onClick={endCall} className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full text-lg font-semibold">
            End Call
          </button>
        </>
      )}

      {/* Call Ended Screen */}
      {callStatus === 'ended' && (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L10 8.94l6.72-6.72a.75.75 0 0 1 1.06 1.06L11.06 10l6.72 6.72a.75.75 0 0 1-1.06 1.06L10 11.06l-6.72 6.72a.75.75 0 0 1-1.06-1.06L8.94 10 2.22 3.28a.75.75 0 0 0-1.06-1.06z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Call Ended</h2>
            <p className="text-gray-300 mt-2">The call has been disconnected</p>
          </div>
        </div>
      )}

      {/* Hidden audio element for ringtone */}
      <audio 
        ref={ringtone} 
        src="http://localhost:5000/ringtone.mp3" 
        loop 
        preload="auto"
        onError={(e) => console.error("Audio load error:", e)}
        onLoadStart={() => console.log("Audio loading started")}
        onCanPlay={() => console.log("Audio can play")}
        onLoadedData={() => console.log("Audio loaded")}
      />
    </div>
  );
}
