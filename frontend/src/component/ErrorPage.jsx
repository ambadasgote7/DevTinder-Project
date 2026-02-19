import { useNavigate } from "react-router-dom";

const ErrorPage = ({
  code = "404",
  title = "Something went wrong",
  message = "The page you are looking for does not exist or an unexpected error occurred.",
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#15173D] px-4">

      <div className="max-w-lg w-full bg-[#1E214F] border border-[#982598]/30 rounded-3xl shadow-2xl p-8 text-center">

        {/* Error Code */}
        <h1 className="text-6xl font-bold bg-gradient-to-r from-[#982598] to-[#E491C9] bg-clip-text text-transparent mb-4">
          {code}
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-[#F1E9E9] mb-3">
          {title}
        </h2>

        {/* Message */}
        <p className="text-[#F1E9E9]/70 mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#982598] to-[#E491C9] text-white font-semibold shadow-lg hover:scale-[1.03] transition"
          >
            Go Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-[#982598]/40 text-[#F1E9E9] hover:bg-[#15173D] transition"
          >
            Go Back
          </button>

        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
