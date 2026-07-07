import { useNavigate } from "react-router-dom";

import BottomNavigation from "../components/BottomNavigation";

const ProfilePage = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}

      <div className="bg-[#17357A] text-white px-4 py-4">
        <h1 className="text-lg font-semibold">
          Profile
        </h1>
      </div>

      <div className="p-6 flex flex-col items-center">

        <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold">
          {user.name?.charAt(0)}
        </div>

        <h2 className="mt-4 text-xl font-bold">
          {user.name}
        </h2>

        <p className="text-slate-500">
          {user.employeeId}
        </p>

        <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
          {user.role}
        </span>

        <button
          onClick={logout}
          className="mt-10 w-full bg-red-500 text-white py-3 rounded-xl font-semibold"
        >
          Sign Out
        </button>

      </div>
    <BottomNavigation />
    </div>
  );
};

export default ProfilePage;