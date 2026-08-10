import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiClipboard,
  FiTruck,
  FiLogOut,
} from "react-icons/fi";
import { FaIndustry } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

import { logoutUser } from "../../../features/auth/services/logout";
const links = [
  {
    name: "Dashboard",
    path: "/production-staff",
    icon: <FiHome />,
  },
  {
    name: "BOM",
    path: "/production-staff/bom",
    icon: <FiClipboard />,
  },
  {
    name: "Production",
    path: "/production-staff/production",
    icon: <FaIndustry />,
  },
  {
    name: "Dispatch",
    path: "/production-staff/dispatch",
    icon: <FiTruck />,
  },
];

const ProductionSidebar = () => {
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
      {/* Floating Mobile Menu */}

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
                  Production Staff
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

              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                      isActive
                        ? "bg-[#172B6B] text-white"
                        : "hover:bg-slate-100 text-slate-700"
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.name}</span>
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
            Production Staff
          </p>

        </div>

        <nav className="flex-1 p-4 space-y-2">

          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  isActive
                    ? "bg-[#172B6B] text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`
              }
            >
              {link.icon}
              <span>{link.name}</span>
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

export default ProductionSidebar;