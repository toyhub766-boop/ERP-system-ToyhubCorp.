import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiLogOut,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";

import { logoutUser } from "../../auth/services/logout";

const menuItems = [
  {
    label: "Dashboard",
    icon: <FiHome />,
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
      {/* Mobile Header */}

      {/* Floating Mobile Menu Button */}

<button
  onClick={() => setOpen(true)}
  className="
    lg:hidden
    fixed
    top-4
    right-4
    z-50
    h-11
    w-11
    rounded-xl
    bg-[#172B6B]
    text-white
    shadow-lg
    flex
    items-center
    justify-center
  "
>
  <FiMenu size={22} />
</button>

      {/* Mobile Drawer */}

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">

            <div className="flex items-center justify-between px-6 py-5 border-b">

              <div>

                <h2 className="text-xl font-bold text-[#172B6B]">
                  TOY HUB
                </h2>

                <p className="text-sm text-slate-500">
                  HR Staff
                </p>

              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-xl"
              >
                <FiX />
              </button>

            </div>

            <nav className="flex-1 p-4 space-y-2">

              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                      isActive
                        ? "bg-[#172B6B] text-white"
                        : "hover:bg-slate-100 text-slate-700"
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}

            </nav>

            <div className="border-t p-4">

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-white font-medium hover:bg-red-700 transition"
              >
                <FiLogOut />
                Sign Out
              </button>

            </div>

          </aside>

        </div>
      )}

      {/* Desktop Sidebar */}

      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col">

        <div className="px-6 py-8 border-b">

          <h1 className="text-2xl font-bold text-[#172B6B]">
            TOY HUB
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            HR Staff
          </p>

        </div>

        <nav className="flex-1 p-4 space-y-2">

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  isActive
                    ? "bg-[#172B6B] text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

        </nav>

        <div className="border-t p-4">

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-white font-medium hover:bg-red-700 transition"
          >
            <FiLogOut />
            Sign Out
          </button>

        </div>

      </aside>
    </>
  );
};

export default HRSidebar;