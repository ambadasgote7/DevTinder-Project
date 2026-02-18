import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import UserCard from "./UserCard";

const EditProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.user);

  // ===== Profile fields =====
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [about, setAbout] = useState("");

  // ===== Skills (IMPORTANT) =====
  const [skills, setSkills] = useState([]);        // array → backend
  const [skillsInput, setSkillsInput] = useState(""); // string → input

  // ===== UI state =====
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  // ===== Sync redux user → local state =====
  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setPhotoUrl(user.photoUrl || "");
    setAge(user.age || "");
    setGender(user.gender || "");
    setAbout(user.about || "");

    const userSkills = Array.isArray(user.skills) ? user.skills : [];
    setSkills(userSkills);
    setSkillsInput(userSkills.join(", "));
  }, [user]);

  // ===== Save profile =====
  const saveProfile = async () => {
    try {
      setError("");
      setSaving(true);

      const res = await axios.patch(
        `${BASE_URL}/profile/edit`,
        {
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          about,
          skills, // ✅ array
        },
        { withCredentials: true }
      );

      dispatch(addUser(res.data.data));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ===== Guard =====
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ================= FORM ================= */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 space-y-5">
          <h2 className="text-2xl font-bold text-white">
            Edit Profile
          </h2>

          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="input input-bordered w-full"
          />

          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="input input-bordered w-full"
          />

          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="Photo URL"
            className="input input-bordered w-full"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age"
              className="input input-bordered w-full"
            />

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="About you"
            className="textarea textarea-bordered w-full min-h-[120px]"
          />

          {/* ===== SKILLS INPUT (FIXED UX) ===== */}
          <input
            value={skillsInput}
            onChange={(e) => {
              const value = e.target.value;
              setSkillsInput(value);

              setSkills(
                value
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0)
              );
            }}
            placeholder="Skills (comma separated)"
            className="input input-bordered w-full"
          />

          {/* ===== Skill Chips ===== */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-sm bg-blue-600/20 text-blue-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={saveProfile}
            disabled={saving}
            className="btn btn-primary w-full mt-4"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        {/* ================= PREVIEW ================= */}
        <div className="flex justify-center">
          <UserCard
            user={{
              firstName,
              lastName,
              photoUrl,
              age,
              gender,
              about,
              skills,
            }}
          />
        </div>
      </div>

      {/* ================= TOAST ================= */}
      {showToast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success shadow-lg">
            Profile updated successfully 🚀
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
