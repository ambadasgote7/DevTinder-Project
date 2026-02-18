import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { createSocketConnection } from "../utils/socket";

const Chat = () => {
  const { targetUserId } = useParams();

  // ✅ Redux user (single source of truth)
  const auth = useSelector((store) => store.user);
  const user = auth?.user;
  const userId = user?._id;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketReady, setSocketReady] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  /* ======================
     Fetch chat history
  ====================== */
  useEffect(() => {
    if (!targetUserId) return;

    const fetchChat = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/chat/${targetUserId}`,
          { withCredentials: true }
        );

        const normalizedMessages = res.data.messages.map((msg) => ({
          senderId: msg.senderId?._id,
          firstName: msg.senderId?.firstName,
          lastName: msg.senderId?.lastName,
          text: msg.text,
        }));

        setMessages(normalizedMessages);
      } catch (err) {
        console.error("❌ Failed to fetch chat:", err);
      }
    };

    fetchChat();
  }, [targetUserId]);

  /* ======================
     Socket setup (ONCE)
  ====================== */
  useEffect(() => {

    if (!userId || !targetUserId) return;

    socketRef.current = createSocketConnection();

    socketRef.current.on("connect", () => {
      setSocketReady(true);
      socketRef.current.emit("joinChat", { targetUserId });
    });

    socketRef.current.on("messageReceived", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current?.off("messageReceived");
    };
  }, [userId, targetUserId]);

  /* ======================
     Auto scroll
  ====================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ======================
     Send message
  ====================== */
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    if (!socketRef.current || !socketReady) return;

    socketRef.current.emit("sendMessage", {
      targetUserId,
      text: newMessage,
    });

    setNewMessage("");
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="w-3/4 mx-auto border border-gray-600 m-5 h-[70vh] flex flex-col">
      <h1 className="p-5 border-b border-gray-600">Chat</h1>

      <div className="flex-1 overflow-scroll p-5">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${
              msg.senderId === userId ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-header">
              {msg.firstName} {msg.lastName}
            </div>
            <div className="chat-bubble">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-5 border-t border-gray-600 flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border border-gray-500 text-white px-2"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="btn btn-secondary"
          disabled={!socketReady}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
