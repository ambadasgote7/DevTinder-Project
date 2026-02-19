import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user);

  const fetchUser = async () => {
    if (userData) return;

    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
      }
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#15173D] text-[#F1E9E9]">
      
      {/* Navbar */}
      <div className="border-b border-[#982598]/30">
        <NavBar />
      </div>

      {/* Page Content */}
      <main className="flex-grow px-4 sm:px-6 md:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <div className="border-t border-[#982598]/30 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Body;
