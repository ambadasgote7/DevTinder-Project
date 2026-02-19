import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavBar from "./AdminNavBar";
import { BASE_URL } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    blockedUsers: 0,
    totalConnections: 0,
    rejectedConnections: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, connectionsRes] = await Promise.all([
        axios.get(`${BASE_URL}/admin/users`, { withCredentials: true }),
        axios.get(`${BASE_URL}/admin/connections`, { withCredentials: true }),
      ]);

      const users = usersRes.data.users;
      const connections = connectionsRes.data.requests;

      setStats({
        totalUsers: users.length,
        admins: users.filter((u) => u.role === "admin").length,
        blockedUsers: users.filter((u) => u.isBlocked).length,
        totalConnections: connections.length,
        rejectedConnections: connections.filter(
          (c) => c.status === "rejected"
        ).length,
      });
    } catch (err) {
      console.error("Failed to load dashboard", err);

      navigate("/error", {
        state: {
          code: err?.response?.status || 500,
          title: "Dashboard Error",
          message: "Unable to load admin dashboard.",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <>
      <AdminNavBar />

      <div className="min-h-screen bg-[#15173D] p-6">

        <div className="max-w-7xl mx-auto">

          <h1 className="text-3xl font-bold text-[#F1E9E9] mb-8">
            Admin Dashboard
          </h1>

          {loading ? (
            <p className="text-[#F1E9E9]/70">Loading dashboard...</p>
          ) : (
            <>
              {/* KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">

                <DashboardCard
                  title="Total Users"
                  value={stats.totalUsers}
                />

                <DashboardCard
                  title="Admins"
                  value={stats.admins}
                />

                <DashboardCard
                  title="Blocked Users"
                  value={stats.blockedUsers}
                  danger
                />

                <DashboardCard
                  title="Connections"
                  value={stats.totalConnections}
                />

                <DashboardCard
                  title="Rejected Requests"
                  value={stats.rejectedConnections}
                  danger
                />

              </div>

              {/* INFO PANEL */}
              <div className="bg-[#1E214F] border border-[#982598]/30 rounded-2xl p-6 shadow-xl">

                <h2 className="text-lg font-semibold text-[#F1E9E9] mb-3">
                  System Health
                </h2>

                <ul className="text-[#F1E9E9]/80 space-y-2">
                  <li>✔ Admin access control active</li>
                  <li>✔ Role-based routing enforced</li>
                  <li>✔ Manual moderation enabled</li>
                </ul>

              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const DashboardCard = ({ title, value, danger }) => {
  return (
    <div
      className={`rounded-2xl p-6 text-center shadow-lg transition hover:scale-[1.03]
      ${
        danger
          ? "bg-gradient-to-br from-red-600 to-pink-600"
          : "bg-gradient-to-br from-[#982598] to-[#E491C9]"
      }`}
    >
      <p className="text-sm text-white/80">{title}</p>

      <p className="text-3xl font-bold text-white mt-2">
        {value}
      </p>
    </div>
  );
};

export default AdminDashboard;
