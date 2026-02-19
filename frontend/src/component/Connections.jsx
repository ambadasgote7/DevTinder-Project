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

if (connections.length === 0) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#15173D]">
      <div className="bg-[#1E214F] border border-[#982598]/30 rounded-2xl p-8 text-center">
        <h2 className="text-[#F1E9E9] text-xl font-semibold mb-2">
          No Connections Yet
        </h2>
        <p className="text-[#F1E9E9]/60 text-sm">
          Start swiping to build your network 🚀
        </p>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-[#15173D] px-4 sm:px-6 py-10">

    <div className="max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold text-[#F1E9E9] mb-8">
        Your Connections
      </h1>

      <div className="space-y-4">

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
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E214F] border border-[#982598]/30 shadow-lg hover:shadow-xl transition"
            >

              {/* Left */}
              <div className="flex items-center gap-4">

                <div className="relative">
                  <img
                    src={photoUrl}
                    alt=""
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#982598]"
                  />

                  {isOnline && (
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-[#1E214F] rounded-full"></span>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#F1E9E9]">
                    {firstName} {lastName}
                  </h2>

                  {age && gender && (
                    <p className="text-sm text-[#F1E9E9]/60">
                      {age} • {gender}
                    </p>
                  )}

                  <p className="text-sm text-[#F1E9E9]/70 line-clamp-1">
                    {about}
                  </p>

                  <p
                    className={`text-xs mt-1 ${
                      isOnline ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Chat Button */}
              <Link to={"/chat/" + _id}>
                <button className="px-5 py-2 rounded-xl font-medium bg-gradient-to-r from-[#982598] to-[#E491C9] text-white shadow-md hover:scale-[1.05] transition">
                  Chat
                </button>
              </Link>

            </div>
          );
        })}

      </div>
    </div>
  </div>
);
};

export default Connections;
