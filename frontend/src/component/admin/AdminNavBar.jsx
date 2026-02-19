import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeUser } from "../../utils/userSlice";

const AdminNavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(removeUser());
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-[#982598]/30 text-[#E491C9]"
        : "text-[#F1E9E9]/70 hover:text-white hover:bg-[#15173D]"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-[#1E214F]/95 backdrop-blur-lg border-b border-[#982598]/30 shadow-lg">

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LEFT */}
        <div className="flex items-center gap-6">

          <Link
            to="/admin"
            className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#982598] to-[#E491C9] bg-clip-text text-transparent"
          >
            DevTinder Admin
          </Link>

          <div className="hidden sm:flex items-center gap-2">

            <NavLink to="/admin/users" className={navLinkClass}>
              Users
            </NavLink>

            <NavLink to="/admin/connections" className={navLinkClass}>
              Connections
            </NavLink>

            <NavLink to="/admin/stats" className={navLinkClass}>
              Stats
            </NavLink>

          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          <button
            onClick={handleLogout}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md hover:scale-[1.05] transition"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
};

export default AdminNavBar;
