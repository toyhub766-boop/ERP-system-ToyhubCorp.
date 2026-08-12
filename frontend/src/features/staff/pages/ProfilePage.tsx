import { useNavigate } from "react-router-dom";

import BottomNavigation from "../components/BottomNavigation";
import { logoutUser } from "../../../features/auth/services/logout";

const ProfilePage = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const handleLogout = async () => {
    await logoutUser();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div
      className="
        min-h-screen
        bg-slate-100
        pb-24
        sm:pb-24
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          bg-[#17357A]
          px-4
          pb-8
          pt-7
          shadow-sm
          sm:px-6
          sm:pt-8
        "
      >
        <div className="mx-auto w-full max-w-lg">
          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-white
              sm:text-3xl
            "
          >
            Profile
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-blue-100
            "
          >
            Manage your account
          </p>
        </div>
      </div>

      {/* =====================================================
          PROFILE CONTENT
      ===================================================== */}

      <div
        className="
          mx-auto
          -mt-6
          w-full
          max-w-lg
          px-4
          sm:px-6
        "
      >
        {/* PROFILE CARD */}

        <div
          className="
            mb-6
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            sm:mb-8
            sm:rounded-3xl
          "
        >
          {/* Identity */}

          <div
            className="
              flex
              flex-col
              items-center
              px-5
              pb-6
              pt-7
              sm:px-6
              sm:pt-8
            "
          >
            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                bg-orange-500
                text-3xl
                font-bold
                text-white
                shadow-sm
                sm:h-24
                sm:w-24
                sm:text-4xl
              "
            >
              {user.name?.charAt(0) || "U"}
            </div>

            <h2
              className="
                mt-4
                max-w-full
                truncate
                px-2
                text-xl
                font-bold
                text-slate-900
                sm:mt-5
                sm:text-2xl
              "
            >
              {user.name || "User"}
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              {user.employeeId || "-"}
            </p>

            <span
              className="
                mt-3
                rounded-full
                bg-[#17357A]/10
                px-3.5
                py-1.5
                text-[11px]
                font-semibold
                text-[#17357A]
                sm:mt-4
                sm:px-4
                sm:text-xs
              "
            >
              {user.role || "Staff"}
            </span>
          </div>

          {/* Details */}

          <div
            className="
              border-t
              border-slate-100
            "
          >
            {/* Employee ID */}

            <div
              className="
                px-5
                py-4
                sm:px-6
                sm:py-5
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-400
                  sm:text-xs
                "
              >
                Employee ID
              </p>

              <p
                className="
                  mt-1
                  break-all
                  text-sm
                  font-semibold
                  text-slate-800
                  sm:text-base
                "
              >
                {user.employeeId || "-"}
              </p>
            </div>

            <div className="border-t border-slate-100" />

            {/* Department */}

            <div
              className="
                px-5
                py-4
                sm:px-6
                sm:py-5
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-400
                  sm:text-xs
                "
              >
                Department
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  capitalize
                  text-slate-800
                  sm:text-base
                "
              >
                {user.role || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            LOGOUT
        ===================================================== */}

        <button
          type="button"
          onClick={handleLogout}
          className="
            mb-5
            h-12
            w-full
            rounded-xl
            bg-red-500
            px-4
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-red-600
            active:scale-[0.98]
            sm:h-13
            sm:rounded-2xl
            sm:text-base
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