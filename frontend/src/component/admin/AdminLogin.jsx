import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/constants";

const AdminLogin = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );

      const user = res.data.user;

      if (user.role !== "admin") {
        setError("You are not authorized as admin");
        return;
      }

      dispatch(addUser(user));
      navigate("/admin");

    } catch (err) {
      setError(err?.response?.data || "Admin login failed");

      navigate("/error", {
        state: {
          code: err?.response?.status || 500,
          title: "Admin Login Error",
          message:
            err?.response?.data ||
            "Unable to login as admin. Please try again.",
        },
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#15173D] px-4">

      <div className="w-full max-w-md bg-[#1E214F] border border-red-500/30 rounded-3xl p-8 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#F1E9E9]">
            Admin Panel
          </h2>
          <p className="text-sm text-red-400 mt-1">
            Authorized access only
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-5">

          <input
            type="email"
            placeholder="Admin Email"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#15173D] border border-[#982598]/30 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#15173D] border border-[#982598]/30 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          {/* Button */}
          <button
            onClick={handleAdminLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg hover:scale-[1.02] transition"
          >
            {loading ? "Logging in..." : "Login as Admin"}
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
