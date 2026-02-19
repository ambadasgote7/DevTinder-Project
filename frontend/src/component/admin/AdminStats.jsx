import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavBar from "./AdminNavBar";
import { BASE_URL } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const AdminStats = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/stats`, {
        withCredentials: true,
      });

      setStats(res.data.stats);

    } catch (err) {
      console.error("Failed to fetch stats", err);

      navigate("/error", {
        state: {
          code: err?.response?.status || 500,
          title: "Analytics Error",
          message: "Unable to load analytics.",
        },
      });

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
        <div className="min-h-screen bg-[#15173D] flex items-center justify-center text-[#F1E9E9]/70">
          Loading analytics...
        </div>
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
        stats.connections.rejectedByAdmin,
    },
  ];

  return (
    <>
      <AdminNavBar />

      <div className="min-h-screen bg-[#15173D] p-6">

        <div className="max-w-7xl mx-auto">

          <h1 className="text-3xl font-bold text-[#F1E9E9] mb-8">
            System Analytics
          </h1>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">

            <StatCard label="Total Users" value={stats.users.totalUsers} />

            <StatCard label="Admins" value={stats.users.totalAdmins} />

            <StatCard
              label="Blocked Users"
              value={stats.users.blockedUsers}
              danger
            />

            <StatCard
              label="Total Requests"
              value={stats.connections.totalRequests}
            />

            <StatCard
              label="Rejected Requests"
              value={
                stats.connections.rejectedByUsers +
                stats.connections.rejectedByAdmin
              }
              danger
            />

          </div>

          {/* CHART PANEL */}
          <div className="bg-[#1E214F] border border-[#982598]/30 rounded-2xl shadow-xl p-6">

            <h2 className="text-lg font-semibold text-[#F1E9E9] mb-4">
              Platform Overview
            </h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>

                  <XAxis
                    dataKey="name"
                    stroke="#F1E9E9"
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#F1E9E9"
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E214F",
                      border: "1px solid #982598",
                      color: "#F1E9E9",
                    }}
                  />

                  <Bar
                    dataKey="value"
                    fill="#E491C9"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ label, value, danger }) => {
  return (
    <div
      className={`rounded-2xl p-6 text-center shadow-lg transition hover:scale-[1.03]
      ${
        danger
          ? "bg-gradient-to-br from-red-600 to-pink-600"
          : "bg-gradient-to-br from-[#982598] to-[#E491C9]"
      }`}
    >
      <p className="text-sm text-white/80">{label}</p>

      <p className="text-3xl font-bold text-white mt-2">
        {value}
      </p>
    </div>
  );
};

export default AdminStats;
