import {
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiPackage,
  FiCreditCard,
} from "react-icons/fi";

interface Props {
  activeTab:
    | "customers"
    | "pipeline"
    | "dues"
    | "orders"
    | "payments";

  setActiveTab: (
    tab:
      | "customers"
      | "pipeline"
      | "dues"
      | "orders"
      | "payments"
  ) => void;
}

const tabs = [
  {
    id: "customers",
    label: "Customers",
    icon: <FiUsers size={16} />,
  },
  {
    id: "pipeline",
    label: "Sales Pipeline",
    icon: <FiTrendingUp size={16} />,
  },
  {
    id: "dues",
    label: "Due Dates",
    icon: <FiCalendar size={16} />,
  },
  {
    id: "orders",
    label: "Orders",
    icon: <FiPackage size={16} />,
  },
  {
    id: "payments",
    label: "Payments",
    icon: <FiCreditCard size={16} />,
  },
] as const;

const CRMTabs = ({
  activeTab,
  setActiveTab,
}: Props) => {
  return (
    <div
      className="
        mt-6
        w-full
        overflow-x-auto
        rounded-2xl
        border
        border-slate-200
        bg-slate-50
        p-1.5
        scrollbar-none
      "
    >
      <div
        className="
          flex
          min-w-max
          gap-1
        "
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                group
                inline-flex
                min-h-10
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                px-4
                text-sm
                font-semibold
                transition-all
                duration-200
                sm:px-5
                ${
                  active
                    ? `
                      bg-white
                      text-[#172B6B]
                      shadow-sm
                      ring-1
                      ring-slate-200
                    `
                    : `
                      text-slate-500
                      hover:bg-white/70
                      hover:text-slate-800
                    `
                }
              `}
            >
              <span
                className={`
                  transition-colors
                  duration-200
                  ${
                    active
                      ? "text-[#172B6B]"
                      : "text-slate-400 group-hover:text-slate-600"
                  }
                `}
              >
                {tab.icon}
              </span>

              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CRMTabs;