import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavBar from "./AdminNavBar";
import { BASE_URL } from "../../utils/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/stats`, {
        withCredentials: true
      });
      setStats(res.data.stats);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <>
        <AdminNavBar />
        <p className="p-6">Loading stats...</p>
      </>
    );
  }

const chartData = [
  { name: "Users", value: stats.users.totalUsers },
  { name: "Admins", value: stats.users.totalAdmins },
  { name: "Blocked", value: stats.users.blockedUsers },
  { name: "Requests", value: stats.connections.totalRequests },
  {
    name: "Rejected",
    value:
      stats.connections.rejectedByUsers +
      stats.connections.rejectedByAdmin
  }
];


  return (
    <>
      <AdminNavBar />

      <div className="p-6 bg-gray-100 min-h-screen">
        
        <h1 className="text-2xl font-bold mb-6">System Analytics</h1>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          <StatCard label="Total Users" value={stats.users.totalUsers} />
          <StatCard label="Admins" value={stats.users.totalAdmins} />
          <StatCard label="Blocked Users" value={stats.users.blockedUsers} danger />
          <StatCard label="Total Requests" value={stats.connections.totalRequests} />
          <StatCard
            label="Rejected Requests"
            value={stats.connections.rejectedByUsers +
      stats.connections.rejectedByAdmin}
            danger
          />
        </div>

        {/* BAR CHART */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Platform Overview
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ label, value, danger }) => (
  <div
    className={`rounded-lg shadow p-6 text-center ${
      danger ? "bg-red-50" : "bg-white"
    }`}
  >
    <p className="text-gray-500 text-sm">{label}</p>
    <p
      className={`text-3xl font-bold mt-2 ${
        danger ? "text-red-600" : "text-gray-800"
      }`}
    >
      {value}
    </p>
  </div>
);

export default AdminStats;
