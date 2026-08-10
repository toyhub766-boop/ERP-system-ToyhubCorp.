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
  },
  {
    id: "pipeline",
    label: "Sales Pipeline",
  },
  {
    id: "dues",
    label: "Due Dates",
  },
  {
    id: "orders",
    label: "Orders",
  },
  {
    id: "payments",
    label: "Payments",
  },
] as const;

const CRMTabs = ({
  activeTab,
  setActiveTab,
}: Props) => {
  return (
    <div className="flex min-w-max gap-2 overflow-x-auto rounded-2xl bg-slate-100 p-2">
      {tabs.map((tab) => {
        const active =
          activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() =>
              setActiveTab(tab.id)
            }
            className={`
              flex
              flex-1
              items-center
              justify-center
              whitespace-nowrap
              rounded-xl
              px-5
              py-3
              text-sm
              font-semibold
              transition-all
              duration-200
              ${
                active
                  ? "bg-white text-[#172B6B] shadow-sm"
                  : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default CRMTabs;