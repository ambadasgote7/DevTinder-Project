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
  <div className="min-h-screen bg-[#15173D] px-4 sm:px-6 py-10">

    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

      {/* ================= FORM ================= */}
      <div className="bg-[#1E214F] border border-[#982598]/30 rounded-3xl shadow-2xl p-8 space-y-6">

        <h2 className="text-2xl font-bold text-[#F1E9E9]">
          Edit Profile
        </h2>

        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="w-full px-4 py-3 rounded-xl bg-[#15173D] border border-[#982598]/30 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-[#E491C9]"
          />

          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="w-full px-4 py-3 rounded-xl bg-[#15173D] border border-[#982598]/30 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-[#E491C9]"
          />
        </div>

        {/* Photo */}
        <input
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="Photo URL"
          className="w-full px-4 py-3 rounded-xl bg-[#15173D] border border-[#982598]/30 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-[#E491C9]"
        />

        {/* Age + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <input
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            className="w-full px-4 py-3 rounded-xl bg-[#15173D] border border-[#982598]/30 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-[#E491C9]"
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#15173D] border border-[#982598]/30 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-[#E491C9]"
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* About */}
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="About you"
          className="w-full px-4 py-3 rounded-xl min-h-[120px] bg-[#15173D] border border-[#982598]/30 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-[#E491C9]"
        />

        {/* Skills */}
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
          className="w-full px-4 py-3 rounded-xl bg-[#15173D] border border-[#982598]/30 text-[#F1E9E9] focus:outline-none focus:ring-2 focus:ring-[#E491C9]"
        />

        {/* Skill Chips */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 text-sm rounded-full bg-[#15173D] border border-[#982598]/40 text-[#E491C9]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={saveProfile}
          disabled={saving}
          className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-[#982598] to-[#E491C9] text-white shadow-lg hover:scale-[1.02] transition"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>

      {/* ================= PREVIEW ================= */}
      <div className="flex flex-col items-center justify-center gap-4">

        <p className="text-[#F1E9E9]/60 text-sm">
          Live Preview
        </p>

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
      <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#1E214F] border border-[#982598]/40 px-6 py-3 rounded-xl shadow-2xl text-[#F1E9E9]">
        Profile updated successfully 🚀
      </div>
    )}
  </div>
);
};

export default EditProfile;
