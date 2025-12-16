import { useRef, useEffect } from "react";
import { startCall } from "../services/webrtc";

export default function VideoRoom() {
  const videoRef = useRef();

  useEffect(() => {
    startCall(videoRef);
  }, []);

  return <video ref={videoRef} autoPlay className="rounded-xl w-full" />;
}
