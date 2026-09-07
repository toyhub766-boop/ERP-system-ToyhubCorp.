import {
  Package,
  ArrowLeftRight,
  User,
  CheckSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

import { logoutUser } from "../../auth/services/logout";

const navigationItems = [
  {
    to: "/staff/inventory",
    label: "Inventory",
    description: "Stock & products",
    icon: Package,
  },
  {
    to: "/staff/transactions",
    label: "Transactions",
    description: "Stock movements",
    icon: ArrowLeftRight,
  },
  {
    to: "/staff/profile",
    label: "Profile",
    description: "Your account",
    icon: User,
  },
  {
    to: "/staff/my-tasks",
    label: "My Tasks",
    description: "Assigned work",
    icon: CheckSquare,
  },
];

const BottomNavigation = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] =
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
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-40
          hidden
          w-[250px]
          flex-col
          border-r
          border-slate-200
          bg-white
          lg:flex
        "
      >
        {/* ---------------------------------------------------
            BRAND
        --------------------------------------------------- */}

        <div className="border-b border-slate-100 px-5 py-6">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-[#17357A]
                text-white
                shadow-sm
              "
            >
              <Package size={19} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-slate-900">
                TOY HUB
              </p>

              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                Inventory Staff
              </p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------
            NAVIGATION
        --------------------------------------------------- */}

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p
            className="
              mb-3
              px-3
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-slate-400
            "
          >
            Workspace
          </p>

          <div className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `
                      group
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? "bg-[#17357A] text-white shadow-[0_5px_16px_rgba(23,53,122,0.16)]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          transition-colors
                          ${
                            isActive
                              ? "bg-white/10 text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-[#17357A]/10 group-hover:text-[#17357A]"
                          }
                        `}
                      >
                        <Icon size={18} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`
                            block
                            text-sm
                            font-semibold
                            ${
                              isActive
                                ? "text-white"
                                : "text-slate-700"
                            }
                          `}
                        >
                          {item.label}
                        </span>

                        <span
                          className={`
                            mt-0.5
                            block
                            truncate
                            text-[10px]
                            ${
                              isActive
                                ? "text-white/60"
                                : "text-slate-400"
                            }
                          `}
                        >
                          {item.description}
                        </span>
                      </span>

                      <span
                        className={`
                          h-1.5
                          w-1.5
                          shrink-0
                          rounded-full
                          transition
                          ${
                            isActive
                              ? "bg-white"
                              : "bg-transparent group-hover:bg-slate-300"
                          }
                        `}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* ---------------------------------------------------
            STAFF FOOTER
        --------------------------------------------------- */}

        <div className="border-t border-slate-100 p-4">
          <div
            className="
              mb-3
              rounded-xl
              bg-slate-50
              px-3
              py-3
              ring-1
              ring-slate-100
            "
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Staff Workspace
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              Inventory Operations
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              text-sm
              font-semibold
              text-slate-600
              transition-all
              duration-200
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <LogOut size={16} />

            {loggingOut
              ? "Signing out..."
              : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* =====================================================
          MOBILE TOP MENU
      ===================================================== */}

      <button
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open inventory navigation"
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
          text-[#17357A]
          shadow-sm
          transition
          hover:shadow-md
          active:scale-95
          lg:hidden
        "
      >
        <Menu size={20} />
      </button>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="
              absolute
              inset-0
              cursor-default
              bg-slate-950/40
              backdrop-blur-[2px]
            "
          />

          <aside
            className="
              absolute
              inset-y-0
              left-0
              flex
              w-[280px]
              flex-col
              border-r
              border-slate-200
              bg-white
              shadow-2xl
            "
          >
            {/* Mobile header */}

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
                    bg-[#17357A]
                    text-white
                  "
                >
                  <Package size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    TOY HUB
                  </p>

                  <p className="text-[11px] uppercase tracking-[0.1em] text-slate-400">
                    Inventory Staff
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                aria-label="Close navigation"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <X size={19} />
              </button>
            </div>

            {/* Mobile navigation */}

            <nav className="flex-1 overflow-y-auto px-3 py-5">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Workspace
              </p>

              <div className="space-y-1.5">
                {navigationItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() =>
                        setMobileMenuOpen(false)
                      }
                      className={({ isActive }) =>
                        `
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-3
                          text-sm
                          font-semibold
                          ${
                            isActive
                              ? "bg-[#17357A] text-white"
                              : "text-slate-600 hover:bg-slate-50"
                          }
                        `
                      }
                    >
                      <span
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          bg-slate-100
                        "
                      >
                        <Icon size={18} />
                      </span>

                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </nav>

            {/* Mobile logout */}

            <div className="border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  text-sm
                  font-semibold
                  text-red-600
                "
              >
                <LogOut size={16} />

                {loggingOut
                  ? "Signing out..."
                  : "Sign Out"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <nav
        className="
          fixed
          inset-x-0
          bottom-0
          z-50
          border-t
          border-slate-200
          bg-white/95
          shadow-[0_-4px_20px_rgba(15,23,42,0.06)]
          backdrop-blur-md
          lg:hidden
        "
        style={{
          paddingBottom:
            "env(safe-area-inset-bottom)",
        }}
      >
        <div
          className="
            mx-auto
            flex
            h-16
            w-full
            max-w-md
            items-stretch
            justify-around
            px-1
          "
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `
                    relative
                    flex
                    min-w-0
                    flex-1
                    flex-col
                    items-center
                    justify-center
                    gap-1
                    rounded-xl
                    text-[10px]
                    font-medium
                    transition-colors
                    duration-150
                    sm:text-xs
                    ${
                      isActive
                        ? "text-[#17357A]"
                        : "text-slate-400"
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`
                        flex
                        h-7
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        transition-colors
                        ${
                          isActive
                            ? "bg-[#17357A]/[0.07]"
                            : ""
                        }
                      `}
                    >
                      <Icon size={20} />
                    </span>

                    <span className="truncate px-1">
                      {item.label}
                    </span>

                    {isActive && (
                      <span
                        className="
                          absolute
                          bottom-0
                          h-0.5
                          w-8
                          rounded-full
                          bg-[#17357A]
                        "
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNavigation;