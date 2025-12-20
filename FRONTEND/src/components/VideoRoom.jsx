import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../services/socket";
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
  const socket = getSocket();
  const { chatId } = useParams();

  useEffect(() => {
    const init = async () => {
      // 1️⃣ Start camera FIRST
      await startLocalStream(localVideo);

      // 2️⃣ Create peer AFTER stream exists
      createPeerConnection(socket, chatId, remoteVideo);

      // 3️⃣ Caller creates offer
      if (isCaller) {
        await createOffer(socket, chatId);
      }
    };

    init();

    // 4️⃣ Socket signaling
    socket.on("webrtcOffer", async (offer) => {
      await handleOffer(socket, chatId, offer);
    });

    socket.on("webrtcAnswer", async (answer) => {
      await handleAnswer(answer);
    });

    socket.on("iceCandidate", async (candidate) => {
      await addIceCandidate(candidate);
    });

    return () => {
      socket.off("webrtcOffer");
      socket.off("webrtcAnswer");
      socket.off("iceCandidate");
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
