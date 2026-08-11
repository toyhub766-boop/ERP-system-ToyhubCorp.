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
    <div className="space-y-3 border-b border-slate-200 bg-white p-3">

      {/* SEARCH */}

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search Party..."
        className="
          h-10
          w-full
          rounded-xl
          border
          border-slate-300
          bg-white
          px-3.5
          text-sm
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-[#17357A]
          focus:ring-2
          focus:ring-[#17357A]/10
        "
      />

      {/* FILTERS */}

      <div className="grid grid-cols-2 gap-2">

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="
            h-9
            min-w-0
            rounded-lg
            border
            border-slate-200
            bg-white
            px-2.5
            text-xs
            font-medium
            text-slate-600
            outline-none
            focus:border-[#17357A]
          "
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

        <select
          value={balanceFilter}
          onChange={(e) =>
            setBalanceFilter(
              e.target.value
            )
          }
          className="
            h-9
            min-w-0
            rounded-lg
            border
            border-slate-200
            bg-white
            px-2.5
            text-xs
            font-medium
            text-slate-600
            outline-none
            focus:border-[#17357A]
          "
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
          value={dueDateFilter}
          onChange={(e) =>
            setDueDateFilter(
              e.target.value
            )
          }
          className="
            h-9
            min-w-0
            rounded-lg
            border
            border-slate-200
            bg-white
            px-2.5
            text-xs
            font-medium
            text-slate-600
            outline-none
            focus:border-[#17357A]
          "
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

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value
            )
          }
          className="
            h-9
            min-w-0
            rounded-lg
            border
            border-slate-200
            bg-white
            px-2.5
            text-xs
            font-medium
            text-slate-600
            outline-none
            focus:border-[#17357A]
          "
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