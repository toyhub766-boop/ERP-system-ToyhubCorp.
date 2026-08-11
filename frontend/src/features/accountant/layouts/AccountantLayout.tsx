import { useState } from "react";
import type { ReactNode } from "react";
import {
  Menu,
  X,
  WalletCards,
  LogOut,
  ChevronRight,
} from "lucide-react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import logo from "../../../assets/images/logo.png";
import { logoutUser } from "../../../features/auth/services/logout";

interface Props {
  children: ReactNode;
}

const AccountantLayout = ({
  children,
}: Props) => {
  const navigate = useNavigate();

  const [open, setOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await logoutUser();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );

      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC]">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <header className="sticky top-0 z-40 h-16 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_8px_rgba(15,23,42,0.04)] backdrop-blur">

        <div className="flex h-full items-center justify-between px-4 sm:px-6">

          {/* Left */}

          <div className="flex min-w-0 items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setOpen(true)
              }
              aria-label="Open navigation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
            >
              <Menu size={20} />
            </button>

            <div className="flex min-w-0 items-center gap-3">

              <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200/70 sm:flex">

                <img
                  src={logo}
                  alt="Toy Hub Corporation"
                  className="h-6 w-auto object-contain"
                />

              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-bold tracking-tight text-slate-900">
                  TOY HUB
                </p>

                <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                  Accountant Panel
                </p>

              </div>

            </div>

          </div>

          {/* Desktop logout */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 md:flex"
          >

            <LogOut size={16} />

            {loggingOut
              ? "Signing out..."
              : "Sign Out"}

          </button>

        </div>

      </header>

      {/* =================================================
          OVERLAY
      ================================================= */}

      <div
        onClick={() =>
          setOpen(false)
        }
        className={`fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* =================================================
          DRAWER
      ================================================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-slate-200 bg-white shadow-[12px_0_40px_rgba(15,23,42,0.10)] transition-transform duration-300 ease-out ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* Drawer Header */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200/70">

              <img
                src={logo}
                alt="Toy Hub Corporation"
                className="h-6 w-auto object-contain"
              />

            </div>

            <div>

              <p className="text-sm font-bold tracking-tight text-slate-900">
                TOY HUB
              </p>

              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                Accountant
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              setOpen(false)
            }
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95"
          >
            <X size={19} />
          </button>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Workspace
          </p>

          <NavLink
            to="/accountant"
            onClick={() =>
              setOpen(false)
            }
            className={({ isActive }) =>
              `group flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#17357A] text-white shadow-[0_5px_14px_rgba(23,53,122,0.16)]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >

            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-[#17357A]/10 group-hover:text-[#17357A]"
                  }`}
                >
                  <WalletCards
                    size={17}
                  />
                </span>

                <span className="flex-1">
                  Accounts
                </span>

                <ChevronRight
                  size={15}
                  className={`transition-transform ${
                    isActive
                      ? "translate-x-0.5 opacity-100"
                      : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-70"
                  }`}
                />
              </>
            )}

          </NavLink>

        </nav>

        {/* =================================================
            DRAWER FOOTER
        ================================================= */}

        <div className="shrink-0 border-t border-slate-100 p-4">

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <LogOut size={16} />

            {loggingOut
              ? "Signing out..."
              : "Sign Out"}

          </button>

        </div>

      </aside>

      {/* =================================================
          PAGE
      ================================================= */}

      <main className="min-w-0">

        <div className="mx-auto w-full max-w-[1440px] px-3 py-5 sm:px-5 sm:py-6 lg:px-8">

          {children}

        </div>

      </main>

    </div>
  );
};

export default AccountantLayout;