interface Props {
  search: string;
  setSearch: (value: string) => void;

  statusFilter: string;
  setStatusFilter: (value: string) => void;

  moduleFilter: string;
  setModuleFilter: (value: string) => void;

  onAdd: () => void;
}

const ReminderFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  moduleFilter,
  setModuleFilter,
  onAdd,
}: Props) => {
  return (
    <section
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-3.5
        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
        sm:p-4
        lg:p-5
      "
    >
      <div
        className="
          grid
          gap-2.5
          sm:grid-cols-2
          lg:grid-cols-4
          lg:gap-3
        "
      >
        {/* SEARCH */}

        <div
          className="
            min-w-0
            sm:col-span-2
            lg:col-span-1
          "
        >
          <label
            className="
              mb-1.5
              block
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-slate-400
            "
          >
            Search
          </label>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search reminder..."
            className="
              h-10
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3.5
              text-sm
              font-medium
              text-slate-700
              outline-none
              transition
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-[#17357A]
              focus:ring-2
              focus:ring-[#17357A]/10
            "
          />
        </div>

        {/* STATUS */}

        <div className="min-w-0">
          <label
            className="
              mb-1.5
              block
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-slate-400
            "
          >
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="
              h-10
              w-full
              min-w-0
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              font-medium
              text-slate-700
              outline-none
              transition
              hover:border-slate-300
              focus:border-[#17357A]
              focus:ring-2
              focus:ring-[#17357A]/10
            "
          >
            <option value="ALL">
              All Status
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="OVERDUE">
              Overdue
            </option>
          </select>
        </div>

        {/* MODULE */}

        <div className="min-w-0">
          <label
            className="
              mb-1.5
              block
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-slate-400
            "
          >
            Module
          </label>

          <select
            value={moduleFilter}
            onChange={(e) =>
              setModuleFilter(
                e.target.value
              )
            }
            className="
              h-10
              w-full
              min-w-0
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              font-medium
              text-slate-700
              outline-none
              transition
              hover:border-slate-300
              focus:border-[#17357A]
              focus:ring-2
              focus:ring-[#17357A]/10
            "
          >
            <option value="ALL">
              All Modules
            </option>

            <option value="CRM">
              CRM
            </option>

            <option value="ACCOUNTS">
              Accounts
            </option>
          </select>
        </div>

        {/* ADD BUTTON */}

        <div
          className="
            flex
            items-end
            sm:col-span-2
            lg:col-span-1
          "
        >
          <button
            type="button"
            onClick={onAdd}
            className="
              h-10
              w-full
              rounded-xl
              bg-[#17357A]
              px-4
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-150
              hover:bg-[#10295d]
              hover:shadow-md
              active:scale-[0.98]
            "
          >
            + Add Reminder
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReminderFilters;