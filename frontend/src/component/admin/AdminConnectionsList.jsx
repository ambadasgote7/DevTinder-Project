import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import AdminNavBar from "./AdminNavBar";

const AdminConnectionsList = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/connections`, {
        withCredentials: true,
      });
      setConnections(res.data.requests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const rejectConnection = async (id) => {
    const confirm = window.confirm(
      "Reject this connection request? This cannot be undone."
    );
    if (!confirm) return;

    try {
      await axios.patch(
        `${BASE_URL}/admin/connections/${id}/reject`,
        {},
        { withCredentials: true }
      );

      // optimistic update
      setConnections((prev) =>
        prev.map((req) =>
          req._id === id
            ? { ...req, status: "rejected", rejectedByAdmin: true }
            : req
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const statusBadge = (req) => {
    if (req.status === "accepted")
      return "bg-green-100 text-green-700";
    if (req.status === "rejected" && req.rejectedByAdmin)
      return "bg-red-100 text-red-700";
    if (req.status === "rejected")
      return "bg-orange-100 text-orange-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const statusText = (req) => {
    if (req.status === "accepted") return "Accepted";
    if (req.status === "rejected" && req.rejectedByAdmin)
      return "Rejected by Admin";
    if (req.status === "rejected") return "Rejected by User";
    return "Pending";
  };

  return (
    <div> <AdminNavBar />
    <div className="p-8 bg-gray-50 min-h-screen">
       
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Connection Requests
        </h1>
        <span className="text-sm text-gray-500">
          Total: {connections.length}
        </span>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-gray-500">Loading connections...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : connections.length === 0 ? (
        <p className="text-gray-500">No connection requests found</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="p-4 text-left">From</th>
                <th className="p-4 text-left">To</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {connections.map((req) => (
                <tr
                  key={req._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4">
  {req.fromUserId ? (
    <>
      <p className="font-medium">{req.fromUserId.firstName}</p>
      <p className="text-sm text-gray-500">
        {req.fromUserId.emailId}
      </p>
    </>
  ) : (
    <span className="text-gray-400 italic">User deleted</span>
  )}
</td>

<td className="p-4">
  {req.toUserId ? (
    <>
      <p className="font-medium">{req.toUserId.firstName}</p>
      <p className="text-sm text-gray-500">
        {req.toUserId.emailId}
      </p>
    </>
  ) : (
    <span className="text-gray-400 italic">User deleted</span>
  )}
</td>


                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(
                        req
                      )}`}
                    >
                      {statusText(req)}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {req.status === "ignored" ||
                    req.status === "interested" ? (
                      <button
                        onClick={() => rejectConnection(req._id)}
                        className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        —
                      </span>
                    )}
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

export default AdminConnectionsList;
