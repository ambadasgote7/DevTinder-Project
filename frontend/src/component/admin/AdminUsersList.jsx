import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/constants";
import AdminNavBar from "./AdminNavBar";

const AdminUsersList = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [role, setRole] = useState("");
  const [blocked, setBlocked] = useState("");
  const [email, setEmail] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = {};
      if (role !== "") params.role = role;
      if (blocked !== "") params.blocked = blocked;
      if (email.trim() !== "") params.email = email.trim();

      const res = await axios.get(`${BASE_URL}/admin/users`, {
        params,
        withCredentials: true,
      });

      setUsers(res.data.users);

    } catch (err) {
      console.error(err);

      navigate("/error", {
        state: {
          code: err?.response?.status || 500,
          title: "Users Error",
          message: "Unable to load users.",
        },
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role, blocked, email]);

  const toggleBlock = async (user) => {
    try {
      const endpoint = user.isBlocked
        ? `/admin/unblock/${user._id}`
        : `/admin/block/${user._id}`;

      await axios.patch(`${BASE_URL}${endpoint}`, {}, { withCredentials: true });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const resetFilters = () => {
    setRole("");
    setBlocked("");
    setEmail("");
  };

  return (
    <>
      <AdminNavBar />

      <div className="min-h-screen bg-[#15173D] p-6">

        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-3">
            <h1 className="text-3xl font-bold text-[#F1E9E9]">
              User Management
            </h1>

            <span className="text-sm text-[#F1E9E9]/60">
              Total Users: {users.length}
            </span>
          </div>

          {/* FILTERS */}
          <div className="bg-[#1E214F] border border-[#982598]/30 p-6 rounded-2xl shadow-lg mb-8">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#15173D] border border-[#982598]/30 text-[#F1E9E9]"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={blocked}
                onChange={(e) => setBlocked(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#15173D] border border-[#982598]/30 text-[#F1E9E9]"
              >
                <option value="">All Status</option>
                <option value="false">Active</option>
                <option value="true">Blocked</option>
              </select>

              <input
                type="text"
                placeholder="Search by email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#15173D] border border-[#982598]/30 text-[#F1E9E9]"
              />

              <button
                onClick={resetFilters}
                className="rounded-lg font-medium bg-gradient-to-r from-[#982598] to-[#E491C9] text-white hover:scale-[1.02] transition"
              >
                Reset
              </button>

            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="text-center py-20 text-[#F1E9E9]/70">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-[#F1E9E9]/70">
              No users found
            </div>
          ) : (
            <div className="bg-[#1E214F] border border-[#982598]/30 rounded-2xl shadow-xl overflow-hidden">

              <table className="w-full text-sm">

                <thead className="bg-[#15173D] text-[#F1E9E9]/70">
                  <tr>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-center">Role</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-t border-[#982598]/20 hover:bg-[#15173D]/60 transition"
                    >
                      <td className="p-4 text-[#F1E9E9]">
                        {user.firstName} {user.lastName}
                      </td>

                      <td className="p-4 text-[#F1E9E9]/70">
                        {user.emailId}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-purple-600/30 text-purple-300"
                              : "bg-blue-600/30 text-blue-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isBlocked
                              ? "bg-red-600/30 text-red-300"
                              : "bg-green-600/30 text-green-300"
                          }`}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      <td className="p-4 text-center flex gap-3 justify-center">

                        <Link
                          to={`/admin/users/${user._id}`}
                          className="text-[#E491C9] hover:underline text-sm"
                        >
                          View
                        </Link>

                        <button
                          onClick={() => toggleBlock(user)}
                          className={`px-3 py-1 rounded text-sm text-white transition ${
                            user.isBlocked
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminUsersList;
