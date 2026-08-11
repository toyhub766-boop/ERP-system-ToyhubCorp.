import {
  FiDownload,
  FiFileText,
  FiSearch,
  FiSliders,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

interface Props {
  search: string;
  status: string;

  onSearchChange: (
    value: string
  ) => void;

  onStatusChange: (
    value: string
  ) => void;

  onExportExcel: () => void;
  onExportPdf: () => void;
}

const AttendanceToolbar = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onExportExcel,
  onExportPdf,
}: Props) => {
  const hasFilters =
    search.trim() !== "" ||
    status !== "All";

  const clearFilters = () => {
    onSearchChange("");
    onStatusChange("All");
  };

  return (
    <section className="mt-7">
      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200/80
          bg-white
          shadow-[0_2px_12px_rgba(15,23,42,0.04)]
        "
      >
        <div className="p-4 sm:p-5">

          {/* =================================================
              TOP ROW
          ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-4
              xl:flex-row
              xl:items-center
              xl:justify-between
            "
          >

            {/* ================= FILTERS ================= */}

            <div
              className="
                flex
                min-w-0
                flex-1
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
              "
            >

              {/* Search */}

              <div
                className="
                  relative
                  w-full
                  sm:max-w-[360px]
                "
              >
                <FiSearch
                  size={17}
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    onSearchChange(
                      e.target.value
                    )
                  }
                  placeholder="Search employees..."
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50/70
                    pl-10
                    pr-10
                    text-sm
                    font-medium
                    text-slate-800
                    outline-none
                    transition-all
                    duration-200
                    placeholder:text-slate-400
                    hover:border-slate-300
                    hover:bg-white
                    focus:border-[#17357A]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#17357A]/8
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      onSearchChange("")
                    }
                    className="
                      absolute
                      right-2.5
                      top-1/2
                      flex
                      h-7
                      w-7
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      transition
                      hover:bg-slate-100
                      hover:text-slate-700
                    "
                    aria-label="Clear search"
                  >
                    <FiX size={15} />
                  </button>
                )}
              </div>

              {/* Status */}

              <div className="relative w-full sm:w-[175px]">
                <FiSliders
                  size={15}
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <select
                  value={status}
                  onChange={(e) =>
                    onStatusChange(
                      e.target.value
                    )
                  }
                  className="
                    h-11
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50/70
                    pl-10
                    pr-9
                    text-sm
                    font-medium
                    text-slate-700
                    outline-none
                    transition-all
                    duration-200
                    hover:border-slate-300
                    hover:bg-white
                    focus:border-[#17357A]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#17357A]/8
                  "
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Present">
                    Present
                  </option>

                  <option value="Absent">
                    Absent
                  </option>

                  <option value="Half Day">
                    Half Day
                  </option>

                  <option value="Leave">
                    Leave
                  </option>
                </select>

                <FiChevronDown
                  size={15}
                  className="
                    pointer-events-none
                    absolute
                    right-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />
              </div>

              {/* Clear Filters */}

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    inline-flex
                    h-11
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    text-sm
                    font-semibold
                    text-slate-600
                    transition-all
                    duration-200
                    hover:border-slate-300
                    hover:bg-slate-50
                    hover:text-slate-900
                    active:scale-[0.98]
                  "
                >
                  <FiX size={15} />

                  Clear
                </button>
              )}
            </div>

            {/* ================= EXPORTS ================= */}

            <div
              className="
                flex
                w-full
                flex-col
                gap-2
                sm:flex-row
                xl:w-auto
              "
            >

              {/* Excel */}

              <button
                type="button"
                onClick={onExportExcel}
                className="
                  group
                  inline-flex
                  h-11
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-sm
                  font-semibold
                  text-slate-700
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-slate-300
                  hover:bg-slate-50
                  hover:shadow-sm
                  active:translate-y-0
                  active:scale-[0.98]
                  sm:flex-none
                "
              >
                <span
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    bg-emerald-50
                    text-emerald-600
                    transition
                    group-hover:bg-emerald-100
                  "
                >
                  <FiDownload size={15} />
                </span>

                Export Excel
              </button>

              {/* PDF */}

              <button
                type="button"
                onClick={onExportPdf}
                className="
                  group
                  inline-flex
                  h-11
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#17357A]
                  px-4
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_4px_12px_rgba(23,53,122,0.14)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-[#10295D]
                  hover:shadow-[0_7px_18px_rgba(23,53,122,0.20)]
                  active:translate-y-0
                  active:scale-[0.98]
                  sm:flex-none
                "
              >
                <span
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/10
                    transition
                    group-hover:bg-white/15
                  "
                >
                  <FiFileText size={15} />
                </span>

                Export PDF
              </button>

            </div>

          </div>

        </div>

        {/* =================================================
            ACTIVE FILTER INDICATOR
        ================================================= */}

        {hasFilters && (
          <div
            className="
              flex
              items-center
              gap-2
              border-t
              border-slate-100
              bg-slate-50/60
              px-4
              py-2.5
              sm:px-5
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A1F]" />

            <p className="text-xs font-medium text-slate-500">
              Filters are active
            </p>

            {status !== "All" && (
              <span
                className="
                  rounded-md
                  bg-white
                  px-2
                  py-1
                  text-[11px]
                  font-semibold
                  text-slate-600
                  ring-1
                  ring-slate-200
                "
              >
                {status}
              </span>
            )}
          </div>
        )}

      </div>
    </section>
  );
};

export default AttendanceToolbar;