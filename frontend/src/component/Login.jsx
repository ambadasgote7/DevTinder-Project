import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  };

  const handleSignUp = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data?.data));
      navigate("/profile");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] relative overflow-hidden font-inter">
   
  {/* ✅ Admin button */}
  <button
    onClick={() => navigate("/admin/login")}
    className="absolute top-6 right-6 z-50 border border-[#06B6D4] text-[#06B6D4] text-xs px-3 py-1.5 rounded-lg hover:bg-[#06B6D4]/10 transition"
  >
    Admin
  </button>

    
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] relative overflow-hidden font-inter">
      {/* Neon gradient orbs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#06B6D4]/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-[#F43F5E]/20 rounded-full blur-3xl animate-pulse"></div>

      {/* Futuristic grid overlay */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Main glass card */}
      <div className="relative z-10 w-full max-w-md bg-[#0A0F1E]/70 backdrop-blur-xl border border-[#06B6D4]/20 rounded-3xl shadow-[0_0_25px_rgba(6,182,212,0.25)] px-8 py-10 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(244,63,94,0.3)]">
        <h2 className="text-center text-4xl font-bold text-white mb-10 tracking-wide drop-shadow-[0_0_8px_#06B6D4]">
          {isLoginForm ? "Welcome Back 👾" : "Create Your DevTinder Profile 🚀"}
        </h2>

        <div className="space-y-6">
          {!isLoginForm && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#0A0F1E]/80 border border-[#06B6D4]/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#F43F5E]/70 focus:border-transparent outline-none transition"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#0A0F1E]/80 border border-[#06B6D4]/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#F43F5E]/70 focus:border-transparent outline-none transition"
                  placeholder="Enter your last name"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-[#0A0F1E]/80 border border-[#06B6D4]/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#06B6D4]/70 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-[#0A0F1E]/80 border border-[#06B6D4]/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#06B6D4]/70 focus:border-transparent outline-none transition"
            />
            {isLoginForm && (
              <div className="flex justify-end mt-2">
                <a
                  href="#"
                  className="text-xs text-[#06B6D4] hover:text-[#F43F5E] transition"
                >
                  Forgot password?
                </a>
              </div>
            )}
          </div>

          <button
            onClick={isLoginForm ? handleLogin : handleSignUp}
            className="w-full bg-gradient-to-r from-[#06B6D4] via-[#F43F5E] to-[#F43F5E] text-white font-semibold rounded-xl py-3.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] transition-transform transform hover:scale-[1.03]"
          >
            {isLoginForm ? "Login" : "Sign Up"}
          </button>

          {error && (
            <p className="text-[#F43F5E] text-center text-sm mt-2">
              {typeof error === "string" ? error : JSON.stringify(error)}
            </p>
          )}

          <div className="text-center mt-10">
  <p className="text-sm text-gray-300">
    {isLoginForm ? (
      <>
        New here?{" "}
        <span
          onClick={() => setIsLoginForm(false)}
          className="text-[#F43F5E] hover:text-[#06B6D4] font-semibold cursor-pointer transition-colors"
        >
          Create an account
        </span>
      </>
    ) : (
      <>
        Already have an account?{" "}
        <span
          onClick={() => setIsLoginForm(true)}
          className="text-[#06B6D4] hover:text-[#F43F5E] font-semibold cursor-pointer transition-colors"
        >
          Login here
        </span>
      </>
    )}
  </p>
</div>

        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
