import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiLogOut,
  FiUsers,
  FiChevronRight,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";

import { logoutUser } from "../../auth/services/logout";

const menuItems = [
  {
    label: "Dashboard",
    icon: <FiHome size={18} />,
    path: "",
  },
];

const HRSidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <>
      {/* =========================================================
          MOBILE MENU BUTTON
      ========================================================= */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="
          fixed
          right-4
          top-4
          z-50
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-[#172B6B]
          text-white
          shadow-lg
          shadow-[#172B6B]/20
          transition-all
          duration-200
          hover:bg-[#20398F]
          hover:shadow-xl
          active:scale-95
          lg:hidden
        "
      >
        <FiMenu size={21} />
      </button>

      {/* =========================================================
          MOBILE DRAWER
      ========================================================= */}

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Overlay */}
          <div
            className="
              absolute
              inset-0
              bg-slate-950/50
              backdrop-blur-sm
            "
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <aside
            className="
              absolute
              left-0
              top-0
              flex
              h-full
              w-[290px]
              flex-col
              bg-white
              shadow-2xl
            "
          >
            {/* Brand */}
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                px-5
                py-5
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#172B6B]
                    text-white
                    shadow-sm
                  "
                >
                  <FiUsers size={19} />
                </div>

                <div>
                  <h2 className="text-base font-bold tracking-tight text-slate-900">
                    TOY HUB
                  </h2>

                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    HR Staff
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <FiX size={19} />
              </button>
            </div>

            {/* Section label */}
            <div className="px-5 pb-2 pt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Workspace
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `
                      group
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-semibold
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? "bg-[#172B6B] text-white shadow-md shadow-[#172B6B]/15"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `
                    }
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>

                    <FiChevronRight
                      size={15}
                      className="
                        opacity-0
                        transition
                        group-hover:translate-x-0.5
                        group-hover:opacity-60
                      "
                    />
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* Logout */}
            <div className="border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  py-3
                  text-sm
                  font-semibold
                  text-red-600
                  transition-all
                  duration-200
                  hover:border-red-200
                  hover:bg-red-100
                  active:scale-[0.98]
                "
              >
                <FiLogOut size={17} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* =========================================================
          DESKTOP SIDEBAR
      ========================================================= */}

      <aside
        className="
          hidden
          h-screen
          w-[250px]
          shrink-0
          flex-col
          bg-[#101F4D]
          text-white
          lg:flex
        "
      >
        {/* Brand */}
        <div
          className="
            border-b
            border-white/10
            px-5
            py-6
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-white
                text-[#172B6B]
                shadow-lg
              "
            >
              <FiUsers size={20} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                TOY HUB
              </h1>

              <p className="mt-0.5 text-xs font-medium text-blue-200">
                HR Staff
              </p>
            </div>
          </div>
        </div>

        {/* Workspace label */}
        <div className="px-5 pb-2 pt-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/60">
            Workspace
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `
                  group
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-semibold
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? `
                        bg-white
                        text-[#172B6B]
                        shadow-lg
                        shadow-black/10
                      `
                      : `
                        text-blue-100/75
                        hover:bg-white/10
                        hover:text-white
                      `
                  }
                `
                }
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>

                <FiChevronRight
                  size={15}
                  className="
                    opacity-0
                    transition
                    group-hover:translate-x-0.5
                    group-hover:opacity-70
                  "
                />
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom user area */}
        <div className="border-t border-white/10 p-4">
          <div
            className="
              mb-3
              flex
              items-center
              gap-3
              rounded-xl
              bg-white/5
              px-3
              py-3
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-blue-400/15
                text-sm
                font-bold
                text-blue-200
              "
            >
              HR
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                HR Staff
              </p>

              <p className="text-[11px] text-blue-200/60">
                Human Resources
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-red-400/15
              bg-red-500/10
              py-3
              text-sm
              font-semibold
              text-red-200
              transition-all
              duration-200
              hover:border-red-400/25
              hover:bg-red-500/15
              hover:text-red-100
              active:scale-[0.98]
            "
          >
            <FiLogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default HRSidebar;