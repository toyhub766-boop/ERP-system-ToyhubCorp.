import { useState } from "react";
import type { ReactNode } from "react";
import {
  FiMenu,
  FiX,
  FiDollarSign,
  FiLogOut,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

const AccountantLayout = ({ children }: Props) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}

      <header className="sticky top-0 z-40 bg-[#17357A] text-white shadow">

        <div className="h-16 px-5 flex items-center justify-between">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setOpen(true)}
              className="text-2xl"
            >
              <FiMenu />
            </button>

            <div>

              <h1 className="text-lg font-bold">
                TOY HUB
              </h1>

              <p className="text-xs text-blue-100">
                Accountant Panel
              </p>

            </div>

          </div>

          <button
            onClick={logout}
            className="
            hidden
            md:flex
            items-center
            gap-2
            rounded-xl
            bg-red-600
            px-4
            py-2
            text-sm
            font-medium
            hover:bg-red-700
            transition
            "
          >
            <FiLogOut />
            Sign Out
          </button>

        </div>

      </header>

      {/* Overlay */}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Drawer */}

      <aside
        className={`
        fixed
        top-0
        left-0
        z-50
        h-screen
        w-72
        bg-white
        shadow-xl
        transition-transform
        duration-300
        ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}
      >

        <div className="h-16 px-5 border-b flex items-center justify-between">

          <div>

            <h2 className="font-bold text-lg text-[#17357A]">
              TOY HUB
            </h2>

            <p className="text-sm text-slate-500">
              Accountant
            </p>

          </div>

          <button
            onClick={() => setOpen(false)}
            className="text-2xl text-slate-700"
          >
            <FiX />
          </button>

        </div>

        <nav className="p-4">

          <NavLink
            to="/accountant"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                isActive
                  ? "bg-[#17357A] text-white"
                  : "hover:bg-slate-100"
              }`
            }
          >
            <FiDollarSign />
            Accounts
          </NavLink>

        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t">

          <button
            onClick={logout}
            className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-red-600
            py-3
            font-medium
            text-white
            hover:bg-red-700
            transition
            "
          >
            <FiLogOut />
            Sign Out
          </button>

        </div>

      </aside>

      {/* Page */}

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {children}

      </main>

    </div>
  );
};

export default AccountantLayout;