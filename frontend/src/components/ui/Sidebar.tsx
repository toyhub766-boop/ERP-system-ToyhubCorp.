import { NavLink, useNavigate } from "react-router-dom";

import { useEffect, useRef } from "react";

import {
  FiHome,
  FiBell,
  FiLayers,
  FiBox,
  FiGitBranch,
  FiTool,
  FiGrid,
  FiSend,
  FiUsers,
  FiDollarSign,
  FiClock,
  FiBarChart2,
  FiUser,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";

import logo from "../../assets/images/logo.png";

import { logoutUser } from "../../features/auth/services/logout";

const menuItems = [
  {
    label: "Dashboard",
    icon: <FiHome />,
    path: "/admin/dashboard",
  },
  {
    label: "Reminders",
    icon: <FiBell />,
    path: "/admin/reminders",
  },
  {
    label: "Categories",
    icon: <FiLayers />,
    path: "/admin/categories",
  },
  {
    label: "Inventory",
    icon: <FiBox />,
    path: "/admin/inventory",
  },
  {
    label: "BOM Management",
    icon: <FiGitBranch />,
    path: "/admin/bom",
  },
  {
    label: "Production",
    icon: <FiTool />,
    path: "/admin/production",
  },
  {
    label: "Warehouses",
    icon: <FiGrid />,
    path: "/admin/warehouses",
  },
  {
    label: "Dispatch",
    icon: <FiSend />,
    path: "/admin/dispatch",
  },
  {
    label: "CRM",
    icon: <FiUsers />,
    path: "/admin/crm",
  },
  {
    label: "Accounts",
    icon: <FiDollarSign />,
    path: "/admin/accounts",
  },
  {
    label: "Attendance",
    icon: <FiClock />,
    path: "/admin/attendance",
  },
  {
    label: "Reports",
    icon: <FiBarChart2 />,
    path: "/admin/reports",
  },
  {
    label: "Users",
    icon: <FiUser />,
    path: "/admin/users",
  },
];

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({
  collapsed,
  setCollapsed,
}: SidebarProps) => {
  const navigate = useNavigate();

  const navRef = useRef<HTMLElement | null>(null);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const handleLogout = async () => {
    await logoutUser();

    navigate("/login", {
      replace: true,
    });
  };

  useEffect(() => {
    const savedScroll = sessionStorage.getItem(
      "sidebar-scroll-position"
    );

    if (navRef.current && savedScroll) {
      navRef.current.scrollTop = Number(savedScroll);
    }
  }, []);

  const handleSidebarScroll = (
    event: React.UIEvent<HTMLElement>
  ) => {
    sessionStorage.setItem(
      "sidebar-scroll-position",
      String(event.currentTarget.scrollTop)
    );
  };
  return (
    <aside
      className={`
        fixed
        inset-y-0
        left-0
        z-50
        flex
        h-screen
        shrink-0
        flex-col
        overflow-hidden
        bg-[#172B6B]
        text-white
        border-r
        border-white/10
        shadow-[4px_0_20px_rgba(15,23,42,0.06)]
        transition-[width]
        duration-300
        ease-out

        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className={`
          flex
          h-20
          shrink-0
          items-center
          border-b
          border-white/10

          ${collapsed
            ? "justify-center px-3"
            : "px-5"
          }
        `}
      >
        {/* Menu Button */}

        <button
          type="button"
          onClick={() =>
            setCollapsed((value) => !value)
          }
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-slate-200
            transition
            hover:bg-white/10
            hover:text-white
            active:scale-95
          "
        >
          <FiMenu size={20} />
        </button>

        {/* Brand */}

        {!collapsed && (
          <div className="ml-4 flex min-w-0 items-center gap-3">
            <img
              src={logo}
              alt="ToyHub"
              className="h-10 w-auto shrink-0 object-contain"
            />

            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold tracking-wide">
                TOYHUB
              </h2>

              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Corporation
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav
        ref={navRef}
        onScroll={handleSidebarScroll}
        className="
    min-h-0
    flex-1
    overflow-y-auto
    overflow-x-hidden
    px-3
    py-5
    scrollbar-thin
  "
      >
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={
                collapsed
                  ? item.label
                  : undefined
              }
              className={({ isActive }) => `
                group
                flex
                h-11
                items-center
                rounded-xl
                text-sm
                font-medium
                transition-all
                duration-150

                ${collapsed
                  ? "justify-center"
                  : "justify-start gap-3 px-4"
                }

                ${isActive
                  ? `
                      bg-white/10
                      text-white
                      shadow-sm
                    `
                  : `
                      text-slate-300
                      hover:bg-white/[0.06]
                      hover:text-white
                    `
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Icon */}

                  <span
                    className={`
                      flex
                      h-5
                      w-5
                      shrink-0
                      items-center
                      justify-center
                      text-[18px]
                      transition-colors

                      ${isActive
                        ? "text-[#FF8A1F]"
                        : "text-slate-400 group-hover:text-slate-200"
                      }
                    `}
                  >
                    {item.icon}
                  </span>

                  {/* Label */}

                  {!collapsed && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* =====================================================
          USER / FOOTER
      ===================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-white/10
          p-3
        "
      >
        {/* User Card */}

        <div
          className={`
            flex
            items-center
            rounded-xl
            bg-white/[0.06]
            p-2.5

            ${collapsed
              ? "justify-center"
              : "gap-3"
            }
          `}
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#FF8A1F]
              text-sm
              font-bold
              text-white
            "
          >
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-white">
                {user?.name ?? "Admin"}
              </h3>

              <p className="text-xs text-slate-400">
                Founder
              </p>
            </div>
          )}
        </div>

        {/* Logout */}

        <button
          type="button"
          onClick={handleLogout}
          title={
            collapsed
              ? "Sign Out"
              : undefined
          }
          className={`
            mt-2
            flex
            h-10
            w-full
            items-center
            rounded-xl
            text-sm
            text-slate-300
            transition
            hover:bg-white/[0.06]
            hover:text-white

            ${collapsed
              ? "justify-center"
              : "gap-3 px-3"
            }
          `}
        >
          <FiLogOut size={17} />

          {!collapsed && (
            <span>Sign Out</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;