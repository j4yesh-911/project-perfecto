export const startCall = async (videoRef) => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  videoRef.current.srcObject = stream;
};
