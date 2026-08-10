import {
  FiDownload,
  FiFileText,
  FiSearch,
  FiSliders,
  FiX,
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
    <section className="mt-8">

      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
          sm:p-5
        "
      >

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

          {/* ================= LEFT ================= */}

          <div
            className="
              flex
              flex-1
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
            "
          >

            {/* Search */}

            <div className="relative flex-1 sm:max-w-md">

              <FiSearch
                size={18}
                className="
                  pointer-events-none
                  absolute
                  left-4
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
                placeholder="Search attendance..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-11
                  pr-10
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-[#17357A]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-blue-100
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
                    right-3
                    top-1/2
                    flex
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-lg
                    p-1
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-700
                  "
                  aria-label="Clear search"
                >
                  <FiX size={16} />
                </button>
              )}

            </div>

            {/* Status */}

            <div className="relative sm:w-44">

              <FiSliders
                size={16}
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
                  bg-slate-50
                  pl-10
                  pr-9
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  transition
                  focus:border-[#17357A]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-blue-100
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

              <span
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-xs
                  text-slate-400
                "
              >
                ▼
              </span>

            </div>

            {/* Clear */}

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  text-sm
                  font-medium
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  hover:text-slate-900
                "
              >
                <FiX size={16} />

                Clear
              </button>
            )}

          </div>

          {/* ================= RIGHT ================= */}

          <div
            className="
              flex
              flex-col
              gap-2
              sm:flex-row
              xl:justify-end
            "
          >

            {/* Excel */}

            <button
              type="button"
              onClick={onExportExcel}
              className="
                inline-flex
                h-11
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
                transition
                hover:border-slate-300
                hover:bg-slate-50
                active:scale-[0.98]
              "
            >
              <FiDownload size={17} />

              Export Excel
            </button>

            {/* PDF */}

            <button
              type="button"
              onClick={onExportPdf}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#172B6B]
                px-4
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-[#20398F]
                hover:shadow-md
                active:scale-[0.98]
              "
            >
              <FiFileText size={17} />

              Export PDF
            </button>

          </div>

        </div>

      </div>

    </section>
  );
};

export default AttendanceToolbar;