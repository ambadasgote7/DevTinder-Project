import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const getFeedPage = () => {
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center text-white">

        {/* Brand Section */}
        <div
          className="flex items-center gap-2 text-2xl font-semibold tracking-wide hover:text-cyan-400 transition-colors duration-300"
        >
          <span className="text-cyan-400">🧑‍💻</span>
          <span className="hidden sm:inline"
          onClick={getFeedPage}
          >DevTinder</span>
        </div>

        {/* User Section */}
        {user && (
          <div className=" group">
            <div
              tabIndex={0}
              role="button"
              className="flex items-center gap-3 bg-gray-900/60 px-3 py-2 rounded-xl hover:bg-gray-800 cursor-pointer transition-all duration-300 border border-gray-800 hover:border-cyan-500/40"
            >
              <p className="hidden md:block text-sm font-medium text-gray-300">
                Hey, <span className="font-semibold text-cyan-400">{user.firstName}</span>
              </p>
              <div className="w-10 h-10 rounded-full border-2 border-cyan-500 overflow-hidden shadow-md">
                <img
                  src={user.photoUrl}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Dropdown */}
            <ul
              tabIndex={0}
              className="absolute right-0 mt-3 w-52 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-800 shadow-2xl p-2 text-gray-200 transform scale-95 opacity-0 group-focus-within:opacity-100 group-focus-within:scale-100 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top-right"
            >
              <li>
                <Link
                  to="/profile"
                  className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-800 text-base transition"
                >
                  Profile
                  <span className="bg-cyan-600 text-white text-xs px-2 py-0.5 rounded-md font-semibold">
                    New
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/connections"
                  className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-base transition"
                >
                  Connections
                </Link>
              </li>
              <li>
                <Link
                  to="/requests"
                  className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-base transition"
                >
                  Requests
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-red-400 font-semibold hover:bg-red-900/30 hover:text-red-300 transition"
                >
                  Logout 🚪
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
