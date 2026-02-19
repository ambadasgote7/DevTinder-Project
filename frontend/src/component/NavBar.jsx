import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { disconnectSocket } from "../utils/socket";
import { useState, useRef, useEffect } from "react";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });

      disconnectSocket();
      dispatch(removeUser());
      navigate("/login");
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#15173D]/95 backdrop-blur-xl border-b border-[#982598]/30 shadow-lg">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center text-[#F1E9E9]">

        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center gap-2"
        >
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#982598] to-[#E491C9] bg-clip-text text-transparent">
            DevTinder
          </span>
        </div>

        {/* User */}
        {user && (
          <div className="relative" ref={dropdownRef}>

            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 bg-[#1E214F] px-3 py-2 rounded-xl cursor-pointer border border-[#982598]/30 hover:border-[#E491C9]/60 transition"
            >
              <p className="hidden md:block text-sm">
                Hey,{" "}
                <span className="font-semibold text-[#E491C9]">
                  {user.firstName}
                </span>
              </p>

              <div className="w-10 h-10 rounded-full border-2 border-[#982598] overflow-hidden">
                <img
                  src={user.photoUrl}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-3 w-52 bg-[#1E214F] rounded-xl border border-[#982598]/30 shadow-2xl p-2">

                <button
                  onClick={() => handleNavigate("/profile")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#15173D] transition"
                >
                  Profile
                </button>

                <button
                  onClick={() => handleNavigate("/connections")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#15173D] transition"
                >
                  Connections
                </button>

                <button
                  onClick={() => handleNavigate("/requests")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#15173D] transition"
                >
                  Requests
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/30 transition"
                >
                  Logout
                </button>

              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
