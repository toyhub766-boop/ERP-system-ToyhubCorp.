type AccountType =
  | "ALL"
  | "CUSTOMER"
  | "SUPPLIER"
  | "COMPANY_EXPENSE";

interface Props {
  activeTab: AccountType;
  setActiveTab: (tab: AccountType) => void;
}

const PartyTabs = ({
  activeTab,
  setActiveTab,
}: Props) => {
  const tabs: {
    label: string;
    value: AccountType;
  }[] = [
    {
      label: "All",
      value: "ALL",
    },
    {
      label: "Customers",
      value: "CUSTOMER",
    },
    {
      label: "Suppliers",
      value: "SUPPLIER",
    },
    {
      label: "Company Expense",
      value: "COMPANY_EXPENSE",
    },
  ];

  return (
    <div className="border-b border-slate-200 bg-white px-4 pt-4">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.value
                ? "bg-[#17357A] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PartyTabs;