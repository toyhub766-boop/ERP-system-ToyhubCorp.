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

    <div className="flex min-w-max gap-2 rounded-2xl bg-slate-100 p-2">

      {tabs.map((tab) => {

        const active = activeTab === tab.id;

        return (

          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex
              flex-1
              items-center
              justify-center
              rounded-xl
              px-6
              py-3
              text-sm
              font-semibold
              whitespace-nowrap
              transition-all
              duration-200

              ${
                active
                  ? "bg-white text-[#172B6B] shadow-sm"
                  : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }
            `}
          >

            {tab.id === "customers" && (
              <span className="mr-2"></span>
            )}

            {tab.id === "orders" && (
              <span className="mr-2"></span>
            )}

            {tab.id === "payments" && (
              <span className="mr-2"></span>
            )}

            {tab.label}

          </button>

        );

      })}

    </div>

  </div>
);
};

export default CRMTabs;