import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { getSocket } from "../utils/socket";

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();

  const auth = useSelector((store) => store.user);
  const user = auth?.user;
  const userId = user?._id;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [targetOnline, setTargetOnline] = useState(false);
  const [typing, setTyping] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const messagesEndRef = useRef(null);
  const isWindowFocused = useRef(true);

  /* ======================
     WINDOW FOCUS TRACK
  ====================== */
  useEffect(() => {
    const onFocus = () => (isWindowFocused.current = true);
    const onBlur = () => (isWindowFocused.current = false);

    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  /* ======================
     FETCH CHAT
  ====================== */
  useEffect(() => {
    if (!targetUserId) return;

    const fetchChat = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/chat/${targetUserId}`,
          { withCredentials: true }
        );

        setTargetUser(res.data.targetUser);

        const normalized = res.data.messages.map((msg) => ({
          _id: msg._id,
          senderId: msg.senderId?._id,
          receiverId: msg.receiverId?._id,
          text: msg.text,
          status: msg.status,
          createdAt: msg.createdAt,
        }));

        setMessages(normalized);

      } catch (err) {
        console.error(err);

        navigate("/error", {
          state: {
            code: err?.response?.status || 500,
            title: "Chat Error",
            message:
              err?.response?.data ||
              "Unable to load chat. Please try again later.",
          },
        });
      }
    };

    fetchChat();
  }, [targetUserId, navigate]);

  /* ======================
     SOCKET EVENTS
  ====================== */
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !userId || !targetUserId) return;

    if (!socket.connected) socket.connect();

    const start = () => {
      socket.emit("joinChat", { targetUserId });
      socket.emit("getOnlineUsers");
    };

    if (socket.connected) start();
    else socket.once("connect", start);

    const handleOnlineList = (users) => {
      setTargetOnline(users.includes(targetUserId));
    };

    const handleMessage = (msg) => {
      setMessages((prev) => {
        const filtered = prev.filter(
          (m) =>
            !(
              m.optimistic &&
              m.text === msg.text &&
              m.senderId === msg.senderId
            )
        );
        return [...filtered, msg];
      });

      if (isWindowFocused.current) {
        socket.emit("markSeen", { targetUserId });
      }
    };

    const handleDelivered = ({ deliveredTo }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.receiverId === deliveredTo && m.status === "sent"
            ? { ...m, status: "delivered" }
            : m
        )
      );
    };

    const handleSeen = ({ seenBy }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === userId && m.receiverId === seenBy
            ? { ...m, status: "seen" }
            : m
        )
      );
    };

    const handleUserOnline = (id) => {
      if (id === targetUserId) setTargetOnline(true);
    };

    const handleUserOffline = (id) => {
      if (id === targetUserId) setTargetOnline(false);
    };

    const handleTyping = ({ userId: id }) => {
      if (id === targetUserId) setTyping(true);
    };

    const handleStopTyping = ({ userId: id }) => {
      if (id === targetUserId) setTyping(false);
    };

    socket.on("onlineUsersList", handleOnlineList);
    socket.on("messageReceived", handleMessage);
    socket.on("messagesDelivered", handleDelivered);
    socket.on("messagesSeen", handleSeen);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("onlineUsersList", handleOnlineList);
      socket.off("messageReceived", handleMessage);
      socket.off("messagesDelivered", handleDelivered);
      socket.off("messagesSeen", handleSeen);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [userId, targetUserId]);

  /* ======================
     MARK SEEN ON FOCUS
  ====================== */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onFocus = () => {
      socket.emit("markSeen", { targetUserId });
    };

    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, [targetUserId]);

  /* ======================
     AUTO SCROLL
  ====================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* ======================
     SEND MESSAGE
  ====================== */
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const socket = getSocket();
    if (!socket) return;

    const tempId = Date.now().toString();

    const optimisticMessage = {
      _id: tempId,
      senderId: userId,
      receiverId: targetUserId,
      text: newMessage,
      status: "sent",
      createdAt: new Date(),
      optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit("sendMessage", {
      targetUserId,
      text: newMessage,
    });

    socket.emit("stopTyping", { targetUserId });

    setNewMessage("");
  };

  /* ======================
     TYPING INPUT
  ====================== */
  const handleTypingChange = (e) => {
    setNewMessage(e.target.value);

    const socket = getSocket();
    if (!socket) return;

    socket.emit("typing", { targetUserId });

    clearTimeout(window.typingTimeout);

    window.typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", { targetUserId });
    }, 1000);
  };

  /* ======================
     DATE GROUPING
  ====================== */
  const formatDateLabel = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const label = formatDateLabel(msg.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(msg);
    return groups;
  }, {});

  /* ======================
     TICKS
  ====================== */
  const renderTicks = (msg) => {
    if (msg.senderId !== userId) return null;

    if (msg.status === "seen") {
      return <span className="text-[#E491C9] ml-1">✓✓</span>;
    }

    if (msg.status === "delivered") {
      return <span className="text-white/80 ml-1">✓✓</span>;
    }

    return <span className="text-white/80 ml-1">✓</span>;
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  /* ======================
     UI
  ====================== */
  return (
    <div className="max-w-4xl mx-auto border border-[#982598]/30 m-4 h-[80vh] flex flex-col bg-[#1E214F] rounded-2xl shadow-2xl">

      {/* HEADER */}
      <div className="p-4 border-b border-[#982598]/30 flex items-center gap-3">

        <div className="relative">
          <img
            src={targetUser?.photoUrl}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />

          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-[#1E214F] ${
              targetOnline ? "bg-green-500" : "bg-gray-500"
            }`}
          ></span>
        </div>

        <div>
          <h2 className="font-semibold text-[#F1E9E9]">
            {targetUser?.firstName} {targetUser?.lastName}
          </h2>

          <p className="text-xs text-[#F1E9E9]/60">
            {targetOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#15173D]">

        {Object.keys(groupedMessages).map((dateLabel) => (
          <div key={dateLabel} className="space-y-2">

            <div className="text-center text-xs text-[#F1E9E9]/60 my-2">
              {dateLabel}
            </div>

            {groupedMessages[dateLabel].map((msg) => (
              <div
                key={msg._id}
                className={`flex my-2 ${
                  msg.senderId === userId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl shadow ${
                    msg.senderId === userId
                      ? "bg-gradient-to-r from-[#982598] to-[#E491C9] text-white"
                      : "bg-[#1E214F] border border-[#982598]/30 text-[#F1E9E9]"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>

                  <div className="flex justify-end items-center mt-1 text-xs opacity-90">
                    <span>{formatTime(msg.createdAt)}</span>
                    {renderTicks(msg)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {typing && (
          <div className="text-sm text-[#F1E9E9]/60 italic">
            Typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-[#982598]/30 flex gap-2 bg-[#1E214F]">
        <input
          value={newMessage}
          onChange={handleTypingChange}
          className="flex-1 px-3 py-2 rounded-lg bg-[#15173D] text-[#F1E9E9] border border-[#982598]/30 focus:outline-none focus:ring-2 focus:ring-[#E491C9]"
          placeholder="Type a message..."
        />

        <button
          onClick={sendMessage}
          className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#982598] to-[#E491C9] text-white hover:scale-[1.05] transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
