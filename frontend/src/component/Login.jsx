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
    <div className="min-h-screen flex items-center justify-center bg-[#15173D] px-4">

      {/* Card */}
      <div className="w-full max-w-md bg-[#1E214F] border border-[#982598]/30 rounded-3xl shadow-2xl p-6 sm:p-8">

        <h2 className="text-center text-2xl sm:text-3xl font-bold text-[#F1E9E9] mb-6">
          {isLoginForm ? "Welcome Back" : "Create Account"}
        </h2>

        <div className="space-y-4">

          {!isLoginForm && (
            <>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full px-4 py-3 rounded-xl bg-[#15173D] border border-[#982598]/40 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-[#E491C9]"
              />

              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full px-4 py-3 rounded-xl bg-[#15173D] border border-[#982598]/40 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-[#E491C9]"
              />
            </>
          )}

          <input
            type="email"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl bg-[#15173D] border border-[#982598]/40 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-[#E491C9]"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-[#15173D] border border-[#982598]/40 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-[#E491C9]"
          />

          <button
            onClick={isLoginForm ? handleLogin : handleSignUp}
            className="w-full bg-gradient-to-r from-[#982598] to-[#E491C9] text-white font-semibold py-3 rounded-xl shadow-lg hover:scale-[1.02] transition"
          >
            {isLoginForm ? "Login" : "Sign Up"}
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center">
              {typeof error === "string" ? error : JSON.stringify(error)}
            </p>
          )}

          <p className="text-center text-sm text-[#F1E9E9]/80 pt-2">
            {isLoginForm ? (
              <>
                New here?{" "}
                <span
                  onClick={() => setIsLoginForm(false)}
                  className="font-semibold cursor-pointer text-[#E491C9]"
                >
                  Create account
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => setIsLoginForm(true)}
                  className="font-semibold cursor-pointer text-[#E491C9]"
                >
                  Login
                </span>
              </>
            )}
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
