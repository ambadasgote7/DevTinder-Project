import { io } from "socket.io-client";

let socket = null;

/* =========================
   CONNECT SOCKET
========================= */
export const connectSocket = () => {
  // If already connected → reuse
  if (socket && socket.connected) return socket;

  // If exists but not connected → connect again
  if (socket && !socket.connected) {
    socket.connect();
    return socket;
  }

  // Create new socket
  socket = io("http://localhost:7777", {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    if (socket.id) {
      //console.log("🟢 Socket connected:", socket.id);
    }
  });

  socket.on("disconnect", (reason) => {
  //  console.log("🔴 Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    //console.error("❌ Socket error:", err.message);
  });

  return socket;
};

/* =========================
   GET SOCKET INSTANCE
   (Always Safe)
========================= */
export const getSocket = () => {
  if (!socket) {
    return connectSocket();
  }
  return socket;
};

/* =========================
   DISCONNECT SOCKET
========================= */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔴 Socket manually disconnected");
  }
};
