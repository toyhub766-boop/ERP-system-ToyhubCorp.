interface Props {
  activeTab: "CUSTOMER" | "SUPPLIER";
  setActiveTab: (
    tab: "CUSTOMER" | "SUPPLIER"
  ) => void;

  search: string;

  setSearch: (value: string) => void;
}

const PartyTabs = ({
  activeTab,
  setActiveTab,
  search,
  setSearch,
}: Props) => {
  return (
    <div className="space-y-5 border-b border-slate-200 p-5">

      {/* Tabs */}

      <div className="flex rounded-xl bg-slate-100 p-1">
  <button
    onClick={() => setActiveTab("CUSTOMER")}
    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
      activeTab === "CUSTOMER"
        ? "bg-white shadow text-[#17357A]"
        : "text-slate-500"
    }`}
  >
    Customers
  </button>

  <button
    onClick={() => setActiveTab("SUPPLIER")}
    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
      activeTab === "SUPPLIER"
        ? "bg-white shadow text-[#17357A]"
        : "text-slate-500"
    }`}
  >
    Suppliers
  </button>
</div>
      {/* Search */}

      <input
        type="text"
        placeholder="Search party..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="
          w-full
          rounded-xl
          border
          border-slate-300
          px-4
          py-3
          outline-none
          focus:border-[#17357A]
        "
      />

    </div>
  );
};

export default PartyTabs;