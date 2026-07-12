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
  <div className="min-h-screen bg-slate-100 pb-24">

    {/* Header */}

    <div className="bg-[#17357A] px-5 pt-8 pb-8 shadow-sm">

      <h1 className="text-2xl font-bold text-white">
        Profile
      </h1>

      <p className="mt-1 text-blue-100 text-sm">
        Manage your account
      </p>

    </div>

    {/* Profile Card */}

    <div className="px-5 -mt-6">

      <div className="rounded-xl mb-9 bg-white shadow-sm border border-slate-200 overflow-hidden">

        <div className="flex flex-col items-center px-6 pt-8 pb-6">

          <div className="h-24 w-24 rounded-full bg-orange-500 flex items-center justify-center text-4xl font-bold text-white">

            {user.name?.charAt(0)}

          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            {user.name}
          </h2>

          <p className="mt-1 text-slate-500">
            {user.employeeId}
          </p>

          <span className="mt-4 rounded-full bg-[#17357A]/10 px-4 py-1.5 text-xs font-semibold text-[#17357A]">
            {user.role}
          </span>

        </div>

        <div className="border-t border-slate-100">

          <div className="flex items-center justify-between px-6 py-5">

            <div>
              <p className="text-xs uppercase text-slate-400">
                Employee ID
              </p>

              <p className="font-semibold">
                {user.employeeId}
              </p>

            </div>

          </div>

          <div className="border-t border-slate-100" />

          <div className="flex items-center justify-between px-6 py-5">

            <div>
              <p className="text-xs uppercase text-slate-400">
                Department
              </p>

              <p className="font-semibold capitalize">
                {user.role}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Logout */}

      <button
        onClick={logout}
        className="
          mt-6
          w-full
          rounded-2xl
          bg-red-500
          py-4
          text-white
          font-semibold
          shadow-sm
          transition
          hover:bg-red-600
        "
      >
        Sign Out
      </button>

    </div>

    <BottomNavigation />

  </div>
);
};

export default ProfilePage;