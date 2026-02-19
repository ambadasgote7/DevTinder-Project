import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { useEffect } from "react";

const Requests = () => {

    const requests = useSelector((store) => store.requests);
    const dispatch = useDispatch();

    const reviewRequest = async (status, _id) => {
         try {

            const res = await axios.post(BASE_URL + "/request/review/" + status + "/" + _id , 
                {}, 
                { withCredentials : true,
            });
            dispatch(removeRequest(_id));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRequests = async () => {
        try {

            const res = await axios.get(BASE_URL + "/user/requests/received" , {
                withCredentials : true,
            });
            dispatch(addRequests(res.data?.data));

        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchRequests();
    }, []);

   if (!requests) return null;

if (requests.length === 0) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#15173D]">
      <div className="bg-[#1E214F] border border-[#982598]/30 rounded-2xl p-8 text-center">
        <h2 className="text-[#F1E9E9] text-xl font-semibold mb-2">
          No Requests Found
        </h2>
        <p className="text-[#F1E9E9]/60 text-sm">
          When someone is interested in you, it will appear here.
        </p>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-[#15173D] px-4 sm:px-6 py-10">

    <div className="max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold text-[#F1E9E9] mb-8">
        Connection Requests
      </h1>

      <div className="space-y-4">

        {requests.map((request) => {
          const {
            _id,
            firstName,
            lastName,
            photoUrl,
            age,
            gender,
            about,
          } = request.fromUserId;

          return (
            <div
              key={request._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E214F] border border-[#982598]/30 shadow-lg hover:shadow-xl transition"
            >

              {/* Left */}
              <div className="flex items-center gap-4">

                <img
                  src={photoUrl}
                  alt=""
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#982598]"
                />

                <div>
                  <h2 className="text-lg font-semibold text-[#F1E9E9]">
                    {firstName} {lastName}
                  </h2>

                  {age && gender && (
                    <p className="text-sm text-[#F1E9E9]/60">
                      {age} • {gender}
                    </p>
                  )}

                  <p className="text-sm text-[#F1E9E9]/70 line-clamp-1">
                    {about}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">

                <button
                  onClick={() =>
                    reviewRequest("accepted", request._id)
                  }
                  className="px-5 py-2 rounded-xl font-medium bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-md hover:scale-[1.05] transition"
                >
                  Accept
                </button>

                <button
                  onClick={() =>
                    reviewRequest("rejected", request._id)
                  }
                  className="px-5 py-2 rounded-xl font-medium border border-red-400 text-red-400 hover:bg-red-900/30 transition"
                >
                  Reject
                </button>

              </div>

            </div>
          );
        })}

      </div>
    </div>
  </div>
);
};

export default Requests;