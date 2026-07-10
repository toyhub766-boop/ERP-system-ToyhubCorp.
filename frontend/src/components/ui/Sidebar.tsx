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
} from "react-icons/fi";

import logo from "../../assets/images/logo.png";

const menuItems = [
  {
    label: "Dashboard",
    icon: <FiHome />,
    path: "/admin/dashboard",
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
    icon: <FiSettings />,
    path: "/admin/bom",
  },
  {
    label: "Production",
    icon: <FiClipboard />,
    path: "/admin/production",
  },
  {
    label: "Warehouses",
    icon: <FiGrid />,
    path: "/admin/warehouses",
  },
  {
    label: "Dispatch",
    icon: <FiTruck />,
    path: "/admin/dispatch",
  },
  {
    label: "CRM",
    icon: <FiUsers />,
    path: "/admin/crm",
  },

  {
  label: "Accounts",
  icon:  <FiDollarSign />,
  path: "/admin/accounts",
},

  {
    label: "Attendance",
    icon: <FiUsers />,
    path: "/admin/attendance",
  },
  
  {
    label: "Reports",
    icon: <FiBarChart2 />,
    path: "/admin/reports",
  },
  {
    label: "Users",
    icon: <FiUsers />,
    path: "/admin/users",
  },
];

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

const Sidebar = ({
  collapsed,
  setCollapsed,
}: SidebarProps) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };
  return (
    <aside
  className={`
    fixed
    left-0
    top-0
    h-screen
    bg-[#172B6B]
    text-white
    flex
    flex-col
    z-40
    transition-all
    duration-300
    ${collapsed ? "w-20" : "w-64"}
  `}
>
      {/* Logo Section */}
      <div
        className="
          h-20
          px-5
          flex
          items-center
          gap-3
          border-b
          border-white/10
        "
      >

        <button
  onClick={() => setCollapsed(!collapsed)}
  className="text-xl"
>
  <FiMenu />
</button>

        <img src={logo} alt="Toy Hub" className="h-10 w-auto" />

        <div>
          <h2 className="font-bold text-sm tracking-wide">TOY HUB</h2>

          <p className="text-[10px] uppercase text-slate-400">Corporation</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <div className="space-y-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-3
                px-4
                py-3
                rounded-xl
                transition-all
                duration-200
                ${
                  isActive
                    ? "bg-[#2D3466] text-[#FF7A00]"
                    : "text-slate-300 hover:bg-[#24356E] hover:text-white"
                }
              `
              }
            >
              <span className="text-lg">{item.icon}</span>

              <span className="text-[15px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div
        className="
          border-t
          border-white/10
          p-4
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              h-11
              w-11
              rounded-full
              bg-orange-500
              flex
              items-center
              justify-center
              font-semibold
            "
          >
            {user.name[0]}
          </div>

          <div>
            <h3 className="text-[15px] font-medium">{user.name}</h3>

            <p className="text-xs text-slate-400">Founder</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="
    mt-5
    flex
    items-center
    gap-2
    text-sm
    text-slate-300
    hover:text-white
    transition-colors
  "
        >
          <FiLogOut />

{!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
