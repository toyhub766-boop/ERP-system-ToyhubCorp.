import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBox,
  FiSettings,
  FiClipboard,
  FiGrid,
  FiTruck,
  FiUsers,
  FiBarChart2,
  FiLogOut,
  FiLayers,
  FiMenu,
  FiDollarSign,
  FiBell,
} from "react-icons/fi";

import logo from "../../assets/images/logo.png";

import { logoutUser } from "../../features/auth/services/logout";

const menuItems = [
  { label: "Dashboard", icon: <FiHome />, path: "/admin/dashboard" },
  {
  label: "Reminders",
  path: "/admin/reminders",
  icon: <FiBell />,
},
  { label: "Categories", icon: <FiLayers />, path: "/admin/categories" },
  { label: "Inventory", icon: <FiBox />, path: "/admin/inventory" },
  { label: "BOM Management", icon: <FiSettings />, path: "/admin/bom" },
  { label: "Production", icon: <FiClipboard />, path: "/admin/production" },
  { label: "Warehouses", icon: <FiGrid />, path: "/admin/warehouses" },
  { label: "Dispatch", icon: <FiTruck />, path: "/admin/dispatch" },
  { label: "CRM", icon: <FiUsers />, path: "/admin/crm" },
  { label: "Accounts", icon: <FiDollarSign />, path: "/admin/accounts" },
  { label: "Attendance", icon: <FiUsers />, path: "/admin/attendance" },
  { label: "Reports", icon: <FiBarChart2 />, path: "/admin/reports" },
  { label: "Users", icon: <FiUsers />, path: "/admin/users" },
];

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
  await logoutUser();
  navigate("/login", { replace: true });
};
  return (
    <aside
      className={`
        sticky
        top-0
        h-screen
        shrink-0
        bg-[#172B6B]
        text-white
        border-r
        border-white/10
        flex
        flex-col
        transition-all
        duration-300
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Header */}

      <div className="h-20 px-5 flex items-center border-b border-white/10">

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 w-10 rounded-xl hover:bg-white/10 transition flex items-center justify-center"
        >
          <FiMenu size={20} />
        </button>

        {!collapsed && (
          <div className="flex items-center gap-3 ml-4">

            <img
              src={logo}
              alt="ToyHub"
              className="h-10 w-auto"
            />

            <div>

              <h2 className="text-sm font-bold tracking-wide">
                TOYHUB
              </h2>

              <p className="text-[11px] text-slate-400 uppercase">
                Corporation
              </p>

            </div>

          </div>
        )}

      </div>

      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">

        <div className="space-y-1">

          {menuItems.map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex
                items-center
                ${collapsed ? "justify-center" : "justify-start"}
                gap-3
                h-12
                px-4
                rounded-xl
                text-sm
                font-medium
                transition-all
                duration-200
                ${isActive
                  ? "bg-white/10 text-[#FF8A1F]"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                }
              `
              }
            >

              <span className="text-lg shrink-0">
                {item.icon}
              </span>

              {!collapsed && (
                <span>{item.label}</span>
              )}

            </NavLink>

          ))}

        </div>

      </nav>

      {/* Footer */}

      <div className="border-t border-white/10 p-4">

        <div
          className={`
            rounded-2xl
            bg-white/5
            p-3
            flex
            items-center
            ${collapsed ? "justify-center" : "gap-3"}
          `}
        >

          <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center font-semibold">

            {user?.name?.[0] ?? "A"}

          </div>

          {!collapsed && (

            <div className="min-w-0">

              <h3 className="truncate text-sm font-semibold">
                {user?.name ?? "Admin"}
              </h3>

              <p className="text-xs text-slate-400">
                Founder
              </p>

            </div>

          )}

        </div>

        <button
          onClick={handleLogout}
          className={`
            mt-4
            w-full
            h-11
            rounded-xl
            flex
            items-center
            ${collapsed ? "justify-center" : "justify-start px-4 gap-3"}
            text-sm
            text-slate-300
            hover:bg-white/5
            hover:text-white
            transition
          `}
        >

          <FiLogOut />

          {!collapsed && "Sign Out"}

        </button>

      </div>

    </aside>
  );
};

export default Sidebar;