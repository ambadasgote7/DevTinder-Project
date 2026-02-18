import io from "socket.io-client";

let socket;

export const createSocketConnection = () => {
  if (!socket) {

    socket = io("http://localhost:7777", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

   

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });
  }
  return socket;
};
