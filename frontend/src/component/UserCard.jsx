import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";

const UserCard = ({ user }) => {
  const {
    _id,
    firstName,
    lastName,
    photoUrl,
    age,
    gender,
    about,
    skills = [],
  } = user;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const x = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const likeOpacity = useTransform(x, [0, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, 0], [1, 0]);

  const handleRequest = async (status) => {
    try {
      await axios.post(
        BASE_URL + "/request/send/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );

      dispatch(removeUserFromFeed(_id));
    } catch (err) {
      navigate("/error", {
        state: {
          code: err?.response?.status || 500,
          title: "Request Failed",
          message:
            err?.response?.data ||
            "Unable to send request. Please try again later.",
        },
      });
    }
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 140) {
      handleRequest("interested");
    } else if (info.offset.x < -140) {
      handleRequest("ignored");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4">

      <motion.div
        className="relative w-full max-w-sm"
        drag="x"
        style={{ x, rotate }}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.97 }}
      >
        {/* LIKE / NOPE BADGES */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-6 right-6 z-20 px-4 py-2 rounded-xl border-2 border-green-400 text-green-400 font-bold text-lg bg-black/40"
        >
          LIKE
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-6 left-6 z-20 px-4 py-2 rounded-xl border-2 border-red-400 text-red-400 font-bold text-lg bg-black/40"
        >
          NOPE
        </motion.div>

        {/* CARD */}
        <div className="rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-[#982598]/30 bg-[#1E214F]">

          {/* IMAGE */}
          <div className="relative h-[480px]">
            <img
              src={photoUrl}
              alt={firstName}
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* USER INFO OVER IMAGE */}
            <div className="absolute bottom-0 p-5 text-[#F1E9E9]">

              <h2 className="text-3xl font-bold">
                {firstName} {lastName}
              </h2>

              {age && gender && (
                <p className="text-sm opacity-80 mb-2">
                  {age} • {gender}
                </p>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.slice(0, 4).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-full bg-[#15173D]/80 border border-[#982598]/40"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* About */}
              <p className="text-sm opacity-90 line-clamp-2">
                {about}
              </p>
            </div>
          </div>

        </div>

        {/* Swipe Hint */}
        <div className="text-center text-xs text-[#F1E9E9]/50 mt-3">
          Swipe left to ignore • Swipe right to connect
        </div>

      </motion.div>

    </div>
  );
};

export default UserCard;
