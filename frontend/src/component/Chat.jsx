import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { getSocket } from "../utils/socket";

const Chat = () => {
  const { targetUserId } = useParams();

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
      }
    };

    fetchChat();
  }, [targetUserId]);

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

    /* ONLINE */
    const handleOnlineList = (users) => {
      setTargetOnline(users.includes(targetUserId));
    };

    /* MESSAGE RECEIVED */
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

      // mark seen ONLY if window focused
      if (isWindowFocused.current) {
        socket.emit("markSeen", { targetUserId });
      }
    };

    /* DELIVERED */
    const handleDelivered = ({ deliveredTo }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.receiverId === deliveredTo && m.status === "sent"
            ? { ...m, status: "delivered" }
            : m
        )
      );
    };

    /* SEEN */
    const handleSeen = ({ seenBy }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === userId && m.receiverId === seenBy
            ? { ...m, status: "seen" }
            : m
        )
      );
    };

    /* ONLINE/OFFLINE */
    const handleUserOnline = (id) => {
      if (id === targetUserId) setTargetOnline(true);
    };

    const handleUserOffline = (id) => {
      if (id === targetUserId) setTargetOnline(false);
    };

    /* TYPING */
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
     TICKS
  ====================== */
  const renderTicks = (msg) => {
    if (msg.senderId !== userId) return null;

    if (msg.status === "seen") {
      return <span className="text-blue-300 ml-1">✓✓</span>;
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
    <div className="w-3/4 mx-auto border border-gray-700 m-5 h-[75vh] flex flex-col bg-gray-900 rounded-xl shadow-lg">

      {/* HEADER */}
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">

        <div className="relative">
          <img
            src={targetUser?.photoUrl}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />

          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-900 ${
              targetOnline ? "bg-green-500" : "bg-gray-500"
            }`}
          ></span>
        </div>

        <div>
          <h2 className="font-semibold">
            {targetUser?.firstName} {targetUser?.lastName}
          </h2>

          <p className="text-xs text-gray-400">
            {targetOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.senderId === userId
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl shadow ${
                msg.senderId === userId
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-200"
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

        {typing && (
          <div className="text-sm text-gray-400 italic">
            Typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-gray-700 flex gap-2">
        <input
          value={newMessage}
          onChange={handleTypingChange}
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none"
          placeholder="Type a message..."
        />

        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
