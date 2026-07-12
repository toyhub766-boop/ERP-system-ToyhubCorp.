interface Props {
  activeTab: "customers" | "orders" | "payments";
  setActiveTab: (
    tab: "customers" | "orders" | "payments"
  ) => void;
}

const tabs = [
  {
    id: "customers",
    label: "Customers",
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
  <div className="overflow-x-auto">

    <div className="inline-flex rounded-2xl bg-slate-100 p-1">

      {tabs.map((tab) => {

        const active = activeTab === tab.id;

        return (

          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              rounded-xl
              px-6
              py-3
              text-sm
              font-semibold
              transition-all
              duration-200

              ${
                active
                  ? "bg-white text-[#172B6B] shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }
            `}
          >

            <div className="flex items-center gap-2">

              <span className="text-base">
                {tab.id === "customers" && "👥"}
                {tab.id === "orders" && "📦"}
                {tab.id === "payments" && "💳"}
              </span>

              <span>
                {tab.label}
              </span>

            </div>

          </button>

        );

      })}

    </div>

  </div>
);
};

export default CRMTabs;