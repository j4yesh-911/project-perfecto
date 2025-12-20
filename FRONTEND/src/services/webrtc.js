// let peerConnection = null;
// let localStream = null;
// let pendingCandidates = [];

// const config = {
//   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
// };

// export const startLocalStream = async (videoRef) => {
//   const stream = await navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true,
//   });

//   localStream = stream;
//   videoRef.current.srcObject = stream;
//   videoRef.current.muted = true;
//   await videoRef.current.play();
// };

// export const createPeerConnection = (socket, chatId, remoteVideoRef) => {
//   peerConnection = new RTCPeerConnection(config);

//   localStream.getTracks().forEach((track) =>
//     peerConnection.addTrack(track, localStream)
//   );

//   peerConnection.ontrack = (event) => {
//     remoteVideoRef.current.srcObject = event.streams[0];
//     remoteVideoRef.current.play();
//   };

//   peerConnection.onicecandidate = (event) => {
//     if (event.candidate) {
//       socket.emit("iceCandidate", { chatId, candidate: event.candidate });
//     }
//   };

//   pendingCandidates.forEach((c) => peerConnection.addIceCandidate(c));
//   pendingCandidates = [];
// };

// export const createOffer = async (socket, chatId) => {
//   const offer = await peerConnection.createOffer();
//   await peerConnection.setLocalDescription(offer);
//   socket.emit("webrtcOffer", { chatId, offer });
// };

// export const handleOffer = async (socket, chatId, offer) => {
//   await peerConnection.setRemoteDescription(offer);
//   const answer = await peerConnection.createAnswer();
//   await peerConnection.setLocalDescription(answer);
//   socket.emit("webrtcAnswer", { chatId, answer });
// };

// export const handleAnswer = async (answer) => {
//   await peerConnection.setRemoteDescription(answer);
// };

// export const addIceCandidate = async (candidate) => {
//   if (!peerConnection || !peerConnection.remoteDescription) {
//     pendingCandidates.push(candidate);
//   } else {
//     await peerConnection.addIceCandidate(candidate);
//   }
// };

// export const endCall = () => {
//   peerConnection?.close();
//   peerConnection = null;
//   localStream?.getTracks().forEach((t) => t.stop());
//   localStream = null;
// };



let peerConnection = null;
let localStream = null;
let pendingCandidates = [];

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export const startLocalStream = async (videoRef) => {
  if (localStream) return localStream;

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  videoRef.current.srcObject = localStream;
  videoRef.current.muted = true;
  await videoRef.current.play();

  return localStream;
};

export const createPeerConnection = async (socket, chatId, remoteVideoRef) => {
  if (peerConnection) return peerConnection;
  if (!localStream) throw new Error("Local stream not started");

  peerConnection = new RTCPeerConnection(config);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    console.log("🎥 Remote stream received");
    remoteVideoRef.current.srcObject = event.streams[0];
    remoteVideoRef.current.play().catch(console.error);
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("iceCandidate", { chatId, candidate: event.candidate });
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    console.log("ICE state:", peerConnection.iceConnectionState);
  };

  pendingCandidates.forEach((c) =>
    peerConnection.addIceCandidate(new RTCIceCandidate(c))
  );
  pendingCandidates = [];

  return peerConnection;
};

export const createOffer = async (socket, chatId) => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("webrtcOffer", { chatId, offer });
};

export const handleOffer = async (socket, chatId, offer) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("webrtcAnswer", { chatId, answer });
};

export const handleAnswer = async (answer) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(answer)
  );
};

export const addIceCandidate = async (candidate) => {
  if (!peerConnection || !peerConnection.remoteDescription) {
    pendingCandidates.push(candidate);
    return;
  }
  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
};

export const endCall = () => {
  peerConnection?.close();
  peerConnection = null;

  localStream?.getTracks().forEach((t) => t.stop());
  localStream = null;

  pendingCandidates = [];
};
