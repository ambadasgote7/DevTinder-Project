import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/constants";

const AdminLogin = () => {
  const [emailId, setEmailId] = useState("admin@devtinder.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );

      const user = res.data.user;

      // 🔒 HARD CHECK: admin only
      if (user.role !== "admin") {
        setError("You are not authorized as admin");
        return;
      }

      dispatch(addUser(user));
      navigate("/admin");

    } catch (err) {
      setError(err?.response?.data || "Admin login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E]">
      <div className="w-full max-w-md bg-[#0A0F1E]/80 border border-red-500/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
        <h2 className="text-center text-3xl font-bold text-red-500 mb-8">
          Admin Login 🔐
        </h2>

        <div className="space-y-5">
          <input
            type="email"
            placeholder="Admin Email"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            className="w-full bg-[#0A0F1E] border border-red-500/40 rounded-xl px-4 py-3 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0A0F1E] border border-red-500/40 rounded-xl px-4 py-3 text-white outline-none"
          />

          <button
            onClick={handleAdminLogin}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-semibold transition"
          >
            Login as Admin
          </button>

          {error && (
            <p className="text-red-400 text-center text-sm">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
