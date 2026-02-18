import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BASE_URL } from "../../utils/constants";
import AdminNavBar from "./AdminNavBar";

const AdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // filters
  const [role, setRole] = useState("");
  const [blocked, setBlocked] = useState("");
  const [email, setEmail] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 AUTO REFRESH ON FILTER CHANGE
  useEffect(() => {
    fetchUsers();
  }, [role, blocked, email]);

  const toggleBlock = async (user) => {
    try {
      const endpoint = user.isBlocked
        ? `/admin/unblock/${user._id}`
        : `/admin/block/${user._id}`;

      await axios.patch(`${BASE_URL}${endpoint}`, {}, { withCredentials: true });

      // optimistic refresh
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
    <div>
      <AdminNavBar />
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          User Management
        </h1>
        <span className="text-sm text-gray-500">
          Total Users: {users.length}
        </span>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={blocked}
            onChange={(e) => setBlocked(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={resetFilters}
            className="bg-gray-200 hover:bg-gray-300 rounded px-4 py-2 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading users...
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-600">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No users found
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 text-gray-700 text-sm">
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
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-4 text-gray-600">
                    {user.emailId}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isBlocked
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="p-4 text-center flex gap-3 justify-center">
                    <Link
                      to={`/admin/users/${user._id}`}
                      className="text-blue-600 hover:underline text-sm"
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
  );
};

export default AdminUsersList;
