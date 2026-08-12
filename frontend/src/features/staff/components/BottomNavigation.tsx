import {
  Package,
  ArrowLeftRight,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const BottomNavigation = () => {
  return (
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
        md:hidden
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
          px-2
        "
      >
        <NavItem
          to="/staff/inventory"
          icon={<Package size={21} />}
          label="Inventory"
        />

        <NavItem
          to="/staff/transactions"
          icon={
            <ArrowLeftRight size={21} />
          }
          label="Transactions"
        />

        <NavItem
          to="/staff/profile"
          icon={<User size={21} />}
          label="Profile"
        />
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({
  to,
  icon,
  label,
}: NavItemProps) => {
  return (
    <NavLink
      to={to}
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
          active:scale-[0.97]
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
            {icon}
          </span>

          <span className="truncate px-1">
            {label}
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
};

export default BottomNavigation;