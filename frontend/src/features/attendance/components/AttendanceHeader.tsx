import {
  FiPlus,
  FiUsers,
  FiBriefcase,
} from "react-icons/fi";

interface Props {
  activeTab: "employee" | "labour";

  onTabChange: (
    tab: "employee" | "labour"
  ) => void;

  onAddAttendance: () => void;
}

const AttendanceHeader = ({
  activeTab,
  onTabChange,
  onAddAttendance,
}: Props) => {
  return (
    <section className="space-y-6">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>

          {/* Breadcrumb */}

          <div className="flex items-center gap-2 text-sm text-slate-500">

            <span>Admin</span>

            <span className="text-slate-300">
              /
            </span>

            <span className="font-medium text-slate-700">
              Attendance
            </span>

          </div>

          {/* Title */}

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Attendance Management
          </h1>

          {/* Subtitle */}

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Track employee and labour attendance,
            working hours and daily performance.
          </p>

        </div>

        {/* Add Attendance */}

        <button
          type="button"
          onClick={onAddAttendance}
          className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#172B6B]
            px-5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            duration-200
            hover:bg-[#20398F]
            hover:shadow-md
            active:scale-[0.98]
            sm:h-12
            sm:px-6
          "
        >
          <FiPlus
            size={18}
            strokeWidth={2.5}
          />

          <span>
            Add Attendance
          </span>
        </button>

      </div>

      {/* ================= TABS ================= */}

      <div
        className="
          inline-flex
          w-full
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-1.5
          shadow-sm
          sm:w-auto
        "
      >

        {/* Employee */}

        <button
          type="button"
          onClick={() =>
            onTabChange("employee")
          }
          className={`
            flex
            min-w-0
            flex-1
            items-center
            justify-center
            gap-2
            rounded-xl
            px-5
            py-3
            text-sm
            font-semibold
            transition-all
            duration-200
            sm:min-w-[170px]
            ${
              activeTab === "employee"
                ? `
                  bg-[#172B6B]
                  text-white
                  shadow-sm
                `
                : `
                  text-slate-500
                  hover:bg-slate-50
                  hover:text-slate-800
                `
            }
          `}
        >
          <FiUsers size={17} />

          <span>
            Employee Attendance
          </span>

        </button>

        {/* Labour */}

        <button
          type="button"
          onClick={() =>
            onTabChange("labour")
          }
          className={`
            flex
            min-w-0
            flex-1
            items-center
            justify-center
            gap-2
            rounded-xl
            px-5
            py-3
            text-sm
            font-semibold
            transition-all
            duration-200
            sm:min-w-[170px]
            ${
              activeTab === "labour"
                ? `
                  bg-[#172B6B]
                  text-white
                  shadow-sm
                `
                : `
                  text-slate-500
                  hover:bg-slate-50
                  hover:text-slate-800
                `
            }
          `}
        >
          <FiBriefcase size={17} />

          <span>
            Labour Attendance
          </span>

        </button>

      </div>

    </section>
  );
};

export default AttendanceHeader;