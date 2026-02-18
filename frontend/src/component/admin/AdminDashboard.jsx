import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavBar from "./AdminNavBar";
import { BASE_URL } from "../../utils/constants";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    blockedUsers: 0,
    totalConnections: 0,
    rejectedConnections: 0
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, connectionsRes] = await Promise.all([
        axios.get(`${BASE_URL}/admin/users`, { withCredentials: true }),
        axios.get(`${BASE_URL}/admin/connections`, { withCredentials: true })
      ]);

      const users = usersRes.data.users;
      const connections = connectionsRes.data.requests;

      setStats({
        totalUsers: users.length,
        admins: users.filter(u => u.role === "admin").length,
        blockedUsers: users.filter(u => u.isBlocked).length,
        totalConnections: connections.length,
        rejectedConnections: connections.filter(
          c => c.status === "rejected"
        ).length
      });
    } catch (err) {
      console.error("Failed to load dashboard", err);
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

      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {loading ? (
          <p>Loading dashboard...</p>
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">
                System Health
              </h2>
              <ul className="text-gray-700 space-y-2">
                <li>✔ Admin access control active</li>
                <li>✔ Role-based routing enforced</li>
                <li>✔ Manual moderation enabled</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const DashboardCard = ({ title, value, danger }) => {
  return (
    <div
      className={`rounded-lg p-6 shadow text-center ${
        danger ? "bg-red-50" : "bg-white"
      }`}
    >
      <p className="text-gray-500 text-sm">{title}</p>
      <p
        className={`text-3xl font-bold mt-2 ${
          danger ? "text-red-600" : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default AdminDashboard;
