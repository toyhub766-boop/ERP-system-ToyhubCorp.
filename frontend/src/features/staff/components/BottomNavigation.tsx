import { Package, ArrowLeftRight, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const BottomNavigation = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm flex justify-around py-3">

      <NavLink
        to="/staff/inventory"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs ${
            isActive
              ? "text-[#17357A]"
              : "text-slate-400"
          }`
        }
      >
        <Package size={22} />
        Inventory
      </NavLink>

      <NavLink
        to="/staff/transactions"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs ${
            isActive
              ? "text-[#17357A]"
              : "text-slate-400"
          }`
        }
      >
        <ArrowLeftRight size={22} />
        Transactions
      </NavLink>

      <NavLink
        to="/staff/profile"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs ${
            isActive
              ? "text-[#17357A]"
              : "text-slate-400"
          }`
        }
      >
        <User size={22} />
        Profile
      </NavLink>

    </div>
  );
};

export default BottomNavigation;