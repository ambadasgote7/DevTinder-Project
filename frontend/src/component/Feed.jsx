import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, clearFeed } from "../utils/feedSlice";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";
import { useNavigate } from "react-router-dom";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const getFeed = async () => {
    try {
      setLoading(true);

      const res = await axios.get(BASE_URL + "/user/feed", {
        withCredentials: true,
      });

      dispatch(clearFeed());
      dispatch(addFeed(res.data.data));
    } catch (err) {
      console.error(err);

      navigate("/error", {
        state: {
          code: err?.response?.status || 500,
          title: "Feed Error",
          message:
            err?.response?.data ||
            "Unable to load users. Please try again.",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  // ===== Loading =====
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#15173D]">
        <div className="animate-pulse text-[#F1E9E9]/70">
          Loading users...
        </div>
      </div>
    );
  }

  // ===== No Users =====
  if (!feed || feed.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#15173D] text-center px-4">
        
        <div className="bg-[#1E214F] border border-[#982598]/30 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-[#F1E9E9] mb-2">
            No new users found
          </h2>

          <p className="text-[#F1E9E9]/60 text-sm">
            Please check back later for new connections.
          </p>
        </div>
      </div>
    );
  }

  // ===== Feed =====
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#15173D] px-4">

      {/* Card Stack Feel */}
      <div className="relative">

        {feed.length > 1 && (
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-[#1E214F] rounded-3xl border border-[#982598]/20" />
        )}

        <UserCard user={feed[0]} />

      </div>
    </div>
  );
};

export default Feed;
