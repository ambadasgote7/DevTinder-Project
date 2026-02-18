import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { addUser, removeUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";

const AuthLoader = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/me`, {
          withCredentials: true
        });
        dispatch(addUser(res.data.user));
      } catch {
        dispatch(removeUser());
      }
    };

    loadUser();
  }, [dispatch]);

  return children;
};

export default AuthLoader;
