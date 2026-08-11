import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiLogOut,
  FiUsers,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";

import { logoutUser } from "../../../features/auth/services/logout";

const links = [
  {
    name: "Dashboard",
    path: "/crm-staff",
    icon: <FiHome size={18} />,
  },
];

const CRMSidebar = () => {
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
      {/* =====================================================
          MENU BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open CRM navigation"
        className="
          fixed
          right-4
          top-4
          z-40
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          bg-white
          text-[#172B6B]
          shadow-sm
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:shadow-md
          active:scale-95
        "
      >
        <FiMenu size={20} />
      </button>


      {/* =====================================================
          DRAWER
      ===================================================== */}

      {open && (
        <div className="fixed inset-0 z-[100]">

          {/* Overlay */}

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="
              absolute
              inset-0
              cursor-default
              bg-slate-950/40
              backdrop-blur-[2px]
              animate-in
              fade-in
              duration-200
            "
          />


          {/* Sidebar */}

          <aside
            className="
              absolute
              left-0
              top-0
              flex
              h-full
              w-[280px]
              flex-col
              border-r
              border-slate-200
              bg-white
              shadow-2xl
              animate-in
              slide-in-from-left
              duration-300
            "
          >

            {/* =================================================
                HEADER
            ================================================= */}

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
                    bg-blue-50
                    text-[#172B6B]
                  "
                >
                  <FiUsers size={19} />
                </div>

                <div>
                  <h2
                    className="
                      text-sm
                      font-bold
                      tracking-wide
                      text-slate-900
                    "
                  >
                    TOY HUB
                  </h2>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      font-medium
                      text-slate-400
                    "
                  >
                    CRM Staff Workspace
                  </p>
                </div>

              </div>


              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close CRM navigation"
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


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav className="flex-1 overflow-y-auto px-3 py-5">

              <p
                className="
                  mb-3
                  px-3
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-slate-400
                "
              >
                Workspace
              </p>

              <div className="space-y-1">

                {links.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `
                        group
                        flex
                        h-11
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        text-sm
                        font-medium
                        transition-all
                        duration-200
                        ${
                          isActive
                            ? `
                              bg-[#172B6B]
                              text-white
                              shadow-sm
                            `
                            : `
                              text-slate-600
                              hover:bg-slate-50
                              hover:text-slate-900
                            `
                        }
                      `
                    }
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        transition
                        group-hover:scale-105
                      "
                    >
                      {link.icon}
                    </span>

                    <span>{link.name}</span>
                  </NavLink>
                ))}

              </div>

            </nav>


            {/* =================================================
                USER / LOGOUT
            ================================================= */}

            <div
              className="
                border-t
                border-slate-100
                bg-slate-50/70
                p-4
              "
            >

              <div
                className="
                  mb-3
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-3
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
                    bg-blue-50
                    text-[#172B6B]
                  "
                >
                  <FiUsers size={17} />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-slate-800
                    "
                  >
                    CRM Staff
                  </p>

                  <p
                    className="
                      text-xs
                      text-slate-400
                    "
                  >
                    Workspace access
                  </p>
                </div>

              </div>


              <button
                type="button"
                onClick={handleLogout}
                className="
                  group
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-red-100
                  bg-white
                  text-sm
                  font-semibold
                  text-red-600
                  transition-all
                  duration-200
                  hover:border-red-200
                  hover:bg-red-50
                  active:scale-[0.98]
                "
              >
                <FiLogOut
                  size={17}
                  className="transition-transform group-hover:-translate-x-0.5"
                />

                Sign Out
              </button>

            </div>

          </aside>
        </div>
      )}
    </>
  );
};

export default CRMSidebar;