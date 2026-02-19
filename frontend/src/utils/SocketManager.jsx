import { useEffect } from "react";
import { connectSocket } from "./socket";
import { useSelector } from "react-redux";

const SocketManager = () => {
  const user = useSelector((store) => store.user);

  useEffect(() => {
    if (user) {
      connectSocket();
    }
  }, [user]);

  return null;
};

export default SocketManager;
