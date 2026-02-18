import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { useSelector } from "react-redux";
import AdminNavBar from "./AdminNavBar";

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const loggedInUser = useSelector((state) => state.user);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isSelf = loggedInUser?._id === userId;

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/users/${userId}`, {
        withCredentials: true,
      });
      setUser(res.data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const toggleBlock = async () => {
    if (isSelf) return alert("You cannot block yourself");

    try {
      const endpoint = user.isBlocked
        ? `/admin/unblock/${user._id}`
        : `/admin/block/${user._id}`;

      await axios.patch(`${BASE_URL}${endpoint}`, {}, { withCredentials: true });

      setUser((prev) => ({ ...prev, isBlocked: !prev.isBlocked }));
    } catch (err) {
      alert(err.message);
    }
  };

  const changeRole = async () => {
    if (isSelf) return alert("You cannot change your own role");

    const newRole = user.role === "admin" ? "user" : "admin";
    const confirm = window.confirm(
      `Change role to "${newRole}"?`
    );
    if (!confirm) return;

    try {
      await axios.patch(
        `${BASE_URL}/admin/role/${user._id}`,
        { role: newRole },
        { withCredentials: true }
      );

      setUser((prev) => ({ ...prev, role: newRole }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading user...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div> <AdminNavBar />
      {/* HEADER */}
    <div className="p-8 bg-gray-50 min-h-screen">
       
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          User Details
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-xl shadow p-8 max-w-3xl">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Info label="First Name" value={user.firstName} />
          <Info label="Last Name" value={user.lastName} />
          <Info label="Email" value={user.emailId} />
          <Info label="Role" value={user.role} />
          <Info
            label="Status"
            value={user.isBlocked ? "Blocked" : "Active"}
            badge
            color={user.isBlocked ? "red" : "green"}
          />
          <Info
            label="Joined"
            value={new Date(user.createdAt).toLocaleDateString()}
          />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            onClick={toggleBlock}
            disabled={isSelf}
            className={`px-5 py-2 rounded text-white transition ${
              user.isBlocked
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } ${isSelf ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {user.isBlocked ? "Unblock User" : "Block User"}
          </button>

          <button
            onClick={changeRole}
            disabled={isSelf}
            className={`px-5 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition ${
              isSelf ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Change Role
          </button>
        </div>

        {isSelf && (
          <p className="text-sm text-gray-500 mt-4">
            You cannot modify your own account.
          </p>
        )}
      </div>
    </div>
      </div>
  );
};

const Info = ({ label, value, badge, color }) => (
  <div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    {badge ? (
      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
          color === "red"
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {value}
      </span>
    ) : (
      <p className="text-lg font-medium text-gray-800">{value}</p>
    )}
  </div>

);

export default AdminUserDetails;
 