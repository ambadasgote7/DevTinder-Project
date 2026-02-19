import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";
import { getSocket } from "../utils/socket";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const [onlineUsers, setOnlineUsers] = useState(new Set());

  /* =========================
     FETCH CONNECTIONS
  ========================= */
  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });

      dispatch(addConnections(res.data?.data));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  /* =========================
     SOCKET PRESENCE LISTENERS
  ========================= */
  useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  const handleOnlineList = (users) => {
    setOnlineUsers(new Set(users));
  };

  const handleUserOnline = (userId) => {
    setOnlineUsers((prev) => new Set(prev).add(userId));
  };

  const handleUserOffline = (userId) => {
    setOnlineUsers((prev) => {
      const updated = new Set(prev);
      updated.delete(userId);
      return updated;
    });
  };

  socket.on("onlineUsersList", handleOnlineList);
  socket.on("userOnline", handleUserOnline);
  socket.on("userOffline", handleUserOffline);

  // ⭐ REQUEST CURRENT ONLINE USERS (IMPORTANT)
  socket.emit("getOnlineUsers");

  return () => {
    socket.off("onlineUsersList", handleOnlineList);
    socket.off("userOnline", handleUserOnline);
    socket.off("userOffline", handleUserOffline);
  };
}, []);


  if (!connections) return null;

  if (connections.length === 0) return <h1>No Connections Found</h1>;

  return (
    <div className="justify-items-center my-10">
      <h1 className="text-bold text-white text-3xl">Connections</h1>

      {connections.map((connection) => {
        const {
          _id,
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          about,
        } = connection;

        const isOnline = onlineUsers.has(_id);

        return (
          <div
            key={_id}
            className="flex m-4 p-4 rounded-lg bg-base-300 w-1/2 items-center justify-between"
          >
            <div className="flex items-center">
              <div className="relative">
                <img
                  alt=""
                  className="w-20 h-20 rounded-full"
                  src={photoUrl}
                />

                {/* ONLINE DOT */}
                {isOnline && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              <div className="text-left mx-4">
                <h2 className="font-bold text-xl">
                  {firstName + " " + lastName}
                </h2>

                {age && gender && <p>{age + " | " + gender}</p>}

                <p>{about}</p>

                {/* STATUS TEXT */}
                <p
                  className={`text-sm ${
                    isOnline ? "text-green-400" : "text-gray-400"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            <Link to={"/chat/" + _id}>
              <button className="btn btn-primary">Chat</button>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Connections;
