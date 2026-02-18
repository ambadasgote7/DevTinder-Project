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
    isActive
      ? "text-white border-b-2 border-blue-400 pb-1"
      : "text-gray-300 hover:text-white";

  return (
    <nav className="bg-gray-900 px-6 py-4 flex justify-between items-center shadow-md">
      {/* LEFT */}
      <div className="flex items-center gap-8">
        <Link
          to="/admin"
          className="text-xl font-bold text-white tracking-wide"
        >
          DevTinder Admin
        </Link>

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

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavBar;
