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

  const isSelf = loggedInUser?._id === userId;

  const fetchUser = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/admin/users/${userId}`,
        { withCredentials: true }
      );

      setUser(res.data.user);

    } catch (err) {
      console.error(err);

      navigate("/error", {
        state: {
          code: err?.response?.status || 500,
          title: "User Error",
          message: "Unable to load user details.",
        },
      });

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

    if (!window.confirm(`Change role to "${newRole}"?`)) return;

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
    return (
      <>
        <AdminNavBar />
        <div className="min-h-screen bg-[#15173D] flex items-center justify-center text-[#F1E9E9]/70">
          Loading user...
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavBar />

      <div className="min-h-screen bg-[#15173D] p-6">

        <div className="max-w-4xl mx-auto">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#F1E9E9]">
              User Details
            </h1>

            <button
              onClick={() => navigate(-1)}
              className="text-[#E491C9] hover:underline"
            >
              ← Back
            </button>
          </div>

          {/* PROFILE CARD */}
          <div className="bg-[#1E214F] border border-[#982598]/30 rounded-2xl shadow-2xl p-8">

            {/* Avatar + Name */}
            <div className="flex items-center gap-6 mb-8">

              <img
                src={user.photoUrl}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-2 border-[#982598]"
              />

              <div>
                <h2 className="text-2xl font-bold text-[#F1E9E9]">
                  {user.firstName} {user.lastName}
                </h2>

                <p className="text-[#F1E9E9]/60 text-sm">
                  {user.emailId}
                </p>

                <div className="flex gap-3 mt-2">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-purple-600/30 text-purple-300"
                        : "bg-blue-600/30 text-blue-300"
                    }`}
                  >
                    {user.role}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.isBlocked
                        ? "bg-red-600/30 text-red-300"
                        : "bg-green-600/30 text-green-300"
                    }`}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>

                </div>
              </div>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">

              <Info label="First Name" value={user.firstName} />
              <Info label="Last Name" value={user.lastName} />
              <Info label="Email" value={user.emailId} />
              <Info label="Role" value={user.role} />
              <Info
                label="Joined"
                value={new Date(user.createdAt).toLocaleDateString()}
              />

            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-[#982598]/30">

              <button
                onClick={toggleBlock}
                disabled={isSelf}
                className={`px-5 py-2 rounded-lg text-white transition ${
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
                className={`px-5 py-2 rounded-lg bg-gradient-to-r from-[#982598] to-[#E491C9] text-white hover:scale-[1.03] transition ${
                  isSelf ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Change Role
              </button>

            </div>

            {isSelf && (
              <p className="text-sm text-[#F1E9E9]/60 mt-4">
                You cannot modify your own account.
              </p>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-sm text-[#F1E9E9]/60 mb-1">{label}</p>
    <p className="text-lg font-medium text-[#F1E9E9]">{value}</p>
  </div>
);

export default AdminUserDetails;
