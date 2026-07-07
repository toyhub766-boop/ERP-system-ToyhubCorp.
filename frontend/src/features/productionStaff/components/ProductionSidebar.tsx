import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const links = [
  {
  name: "Dashboard",
  path: "/production-staff",
  icon: "🏠",
},

  {
    name: "BOM",
    path: "/production-staff/bom",
    icon: "📋",
  },
  {
    name: "Production",
    path: "/production-staff/production",
    icon: "🏭",
  },
  {
    name: "Dispatch",
    path: "/production-staff/dispatch",
    icon: "🚚",
  },
];

const ProductionSidebar = () => {
  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  navigate("/login");navigate("/login");
};
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">

      <div className="p-6 border-b border-slate-700">

        <h1 className="text-xl font-bold">
          TOY HUB
        </h1>

        <p className="text-sm text-slate-400">
          Production Staff
        </p>

      </div>

      <nav className="flex-1 p-4 space-y-2">

        {links.map((link) => (

          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-blue-600"
                  : "hover:bg-slate-800"
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.name}</span>
          </NavLink>

        ))}

      </nav>
        <div className="p-4 border-t border-slate-700">

  <button
    onClick={handleLogout}
    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition"
  >
    🚪 Sign Out
  </button>

</div>
    </aside>
  );
};

export default ProductionSidebar;