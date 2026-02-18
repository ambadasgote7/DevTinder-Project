import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
    const {_id, firstName, lastName, photoUrl, age, gender, about, skills } = user;
    const dispatch = useDispatch();

    const handleRequest = async (status, userId) => {
        try {
            const res = await axios.post(BASE_URL + "/request/send/" + status + "/" + userId, 
                {},
                { withCredentials : true },
            );
            dispatch(removeUserFromFeed(userId));
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="flex items-center justify-center p-4">
            <div className="card bg-base-100 w-96 shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-hidden">
                <figure className="relative h-80 overflow-hidden">
                    <img
                        src={photoUrl}
                        alt={`${firstName} ${lastName}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </figure>
                <div className="card-body bg-gradient-to-b from-base-100 to-base-200">
                    <h2 className="card-title text-3xl font-bold text-primary mb-2">
                        {firstName + " " + lastName}
                    </h2>
                    {age && gender && (
                        <p className="text-sm font-medium text-base-content/70 mb-3 flex items-center gap-2">
                            <span className="badge badge-outline">{age}</span>
                            <span className="badge badge-outline">{gender}</span>
                        </p>
                    )}
                    <p>
                        {skills.length > 0 && (
                            <span className="badge badge-outline">
                                {skills.join(", ")}
                            </span>
                        )}
                    </p>
                    <p className="text-base text-base-content/80 leading-relaxed mb-4 line-clamp-3">
                        {about}
                    </p>
                    <div className="card-actions justify-center gap-4 mt-4">
                        <button className="btn btn-primary btn-lg flex-1 hover:scale-105 transition-transform" onClick={() => handleRequest ("interested",_id)}>
                            ❤️ Interested
                        </button>
                        <button className="btn btn-ghost btn-lg flex-1 hover:scale-105 transition-transform" onClick={() => handleRequest ("ignored",_id)}>
                            ✕ Ignore
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCard;