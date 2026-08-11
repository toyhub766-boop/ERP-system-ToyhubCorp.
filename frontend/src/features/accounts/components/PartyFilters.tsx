interface Props {
  search: string;
  setSearch: (value: string) => void;

  statusFilter: string;
  setStatusFilter: (value: string) => void;

  balanceFilter: string;
  setBalanceFilter: (value: string) => void;

  dueDateFilter: string;
  setDueDateFilter: (value: string) => void;

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

  dueDateFilter,
  setDueDateFilter,

  sortBy,
  setSortBy,
}: Props) => {
  return (
    <div className="space-y-4 border-b border-slate-200 bg-white p-4">

      {/* =========================
          SEARCH
      ========================= */}

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search Party..."
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#17357A] focus:ring-2 focus:ring-[#17357A]/10"
      />

      {/* =========================
          FILTERS
      ========================= */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

        {/* Status */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-[#17357A]"
        >
          <option value="ALL">
            All Status
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </select>

        {/* Balance */}

        <select
          value={balanceFilter}
          onChange={(e) =>
            setBalanceFilter(e.target.value)
          }
          className="rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-[#17357A]"
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

        {/* Due Date */}

        <select
          value={dueDateFilter}
          onChange={(e) =>
            setDueDateFilter(e.target.value)
          }
          className="rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-[#17357A]"
        >
          <option value="ALL">
            All Due Dates
          </option>

          <option value="OVERDUE">
            Overdue
          </option>

          <option value="TODAY">
            Due Today
          </option>

          <option value="UPCOMING">
            Upcoming
          </option>

          <option value="NONE">
            No Due Date
          </option>
        </select>

        {/* Sort */}

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
          className="rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-[#17357A]"
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