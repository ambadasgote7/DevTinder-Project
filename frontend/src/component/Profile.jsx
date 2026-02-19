import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";

const Profile = () => {
  const user = useSelector((store) => store.user);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#15173D] text-[#F1E9E9]/70">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="bg-[#15173D]">
      <EditProfile />
    </div>
  );
};

export default Profile;
