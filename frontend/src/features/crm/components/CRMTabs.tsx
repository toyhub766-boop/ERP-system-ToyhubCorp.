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
    <div className="border-b border-slate-200">

      <div className="flex gap-8">

        {tabs.map((tab) => (

          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(tab.id)
            }
            className={`
              pb-4
              text-sm
              font-medium
              border-b-2
              transition
              ${
                activeTab === tab.id
                  ? "border-[#172B6B] text-[#172B6B]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }
            `}
          >
            {tab.label}
          </button>

        ))}

      </div>

    </div>
  );
};

export default CRMTabs;