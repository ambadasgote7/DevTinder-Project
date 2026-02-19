import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import AdminNavBar from "./AdminNavBar";
import { useNavigate } from "react-router-dom";

const AdminConnectionsList = () => {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/admin/connections`, {
        withCredentials: true,
      });

      setConnections(res.data.requests);

    } catch (err) {
      console.error(err);

      navigate("/error", {
        state: {
          code: err?.response?.status || 500,
          title: "Connections Error",
          message: "Unable to load connection requests.",
        },
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const rejectConnection = async (id) => {
    if (
      !window.confirm(
        "Reject this connection request? This cannot be undone."
      )
    )
      return;

    try {
      await axios.patch(
        `${BASE_URL}/admin/connections/${id}/reject`,
        {},
        { withCredentials: true }
      );

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

  const statusStyle = (req) => {
    if (req.status === "accepted")
      return "bg-green-600/30 text-green-300";

    if (req.status === "rejected" && req.rejectedByAdmin)
      return "bg-red-600/30 text-red-300";

    if (req.status === "rejected")
      return "bg-orange-600/30 text-orange-300";

    return "bg-yellow-600/30 text-yellow-300";
  };

  const statusText = (req) => {
    if (req.status === "accepted") return "Accepted";
    if (req.status === "rejected" && req.rejectedByAdmin)
      return "Rejected by Admin";
    if (req.status === "rejected") return "Rejected by User";
    return "Pending";
  };

  return (
    <>
      <AdminNavBar />

      <div className="min-h-screen bg-[#15173D] p-6">

        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-3">

            <h1 className="text-3xl font-bold text-[#F1E9E9]">
              Connection Requests
            </h1>

            <span className="text-sm text-[#F1E9E9]/60">
              Total: {connections.length}
            </span>
          </div>

          {/* CONTENT */}
          {loading ? (
            <p className="text-[#F1E9E9]/70">
              Loading connections...
            </p>
          ) : connections.length === 0 ? (
            <p className="text-[#F1E9E9]/70">
              No connection requests found
            </p>
          ) : (
            <div className="bg-[#1E214F] border border-[#982598]/30 rounded-2xl shadow-xl overflow-hidden">

              <table className="w-full text-sm">

                <thead className="bg-[#15173D] text-[#F1E9E9]/70">
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
                      className="border-t border-[#982598]/20 hover:bg-[#15173D]/60 transition"
                    >

                      {/* FROM */}
                      <td className="p-4">
                        {req.fromUserId ? (
                          <>
                            <p className="text-[#F1E9E9] font-medium">
                              {req.fromUserId.firstName}
                            </p>
                            <p className="text-xs text-[#F1E9E9]/60">
                              {req.fromUserId.emailId}
                            </p>
                          </>
                        ) : (
                          <span className="text-[#F1E9E9]/40 italic">
                            User deleted
                          </span>
                        )}
                      </td>

                      {/* TO */}
                      <td className="p-4">
                        {req.toUserId ? (
                          <>
                            <p className="text-[#F1E9E9] font-medium">
                              {req.toUserId.firstName}
                            </p>
                            <p className="text-xs text-[#F1E9E9]/60">
                              {req.toUserId.emailId}
                            </p>
                          </>
                        ) : (
                          <span className="text-[#F1E9E9]/40 italic">
                            User deleted
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(
                            req
                          )}`}
                        >
                          {statusText(req)}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="p-4 text-center">
                        {req.status === "ignored" ||
                        req.status === "interested" ? (
                          <button
                            onClick={() => rejectConnection(req._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded transition"
                          >
                            Reject
                          </button>
                        ) : (
                          <span className="text-[#F1E9E9]/40 text-sm">
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
    </>
  );
};

export default AdminConnectionsList;
