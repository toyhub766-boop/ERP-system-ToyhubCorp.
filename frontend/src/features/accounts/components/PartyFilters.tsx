interface Props {
  search: string;
  setSearch: (value: string) => void;

  statusFilter: string;
  setStatusFilter: (value: string) => void;

  balanceFilter: string;
  setBalanceFilter: (value: string) => void;

  sortBy: string;
  setSortBy: (value: string) => void;
}

const PartyFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  balanceFilter,
  setBalanceFilter,
  sortBy,
  setSortBy,
}: Props) => {
  return (
    <div className="space-y-4 border-b border-slate-200 bg-white p-4">

      {/* Search */}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search Party..."
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#17357A]"
      />

      <div className="grid grid-cols-3 gap-3">

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="rounded-xl border border-slate-300 p-3"
        >
          <option value="ALL">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={balanceFilter}
          onChange={(e) =>
            setBalanceFilter(e.target.value)
          }
          className="rounded-xl border border-slate-300 p-3"
        >
          <option value="ALL">
            All Balance
          </option>

          <option value="GET">
            You'll Get
          </option>

          <option value="GIVE">
            You'll Give
          </option>

          <option value="ZERO">
            Zero
          </option>
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
          className="rounded-xl border border-slate-300 p-3"
        >
          <option value="LATEST">
            Latest
          </option>

          <option value="OLDEST">
            Oldest
          </option>

          <option value="A_Z">
            A-Z
          </option>

          <option value="Z_A">
            Z-A
          </option>

          <option value="HIGH">
            Highest Balance
          </option>

          <option value="LOW">
            Lowest Balance
          </option>
        </select>

      </div>

    </div>
  );
};

export default PartyFilters;