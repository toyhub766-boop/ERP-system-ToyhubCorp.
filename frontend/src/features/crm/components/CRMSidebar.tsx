import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiLogOut,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";

const links = [
  {
    name: "Dashboard",
    path: "/crm-staff",
    icon: <FiHome />,
  },
];

const CRMSidebar = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <>
      {/* Floating Mobile/Desktop Menu */}

      <button
        onClick={() => setOpen(true)}
        className="
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

      {/* Drawer */}

      {open && (
        <div className="fixed inset-0 z-50">

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
                  CRM Staff
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
    </>
  );
};

export default CRMSidebar;