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
    <section className="space-y-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

        {/* Title */}

        <div className="min-w-0">

          {/* Eyebrow */}

          <div className="mb-3 flex items-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A1F]" />

            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#17357A]">
              Workforce
            </span>

          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-[34px]">
            Attendance
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
            Track employee and labour attendance,
            working hours and daily performance.
          </p>

        </div>

        {/* Add Attendance */}

        <button
          type="button"
          onClick={onAddAttendance}
          className="
            group
            inline-flex
            h-11
            shrink-0
            items-center
            justify-center
            gap-2.5
            rounded-xl
            bg-[#17357A]
            px-5
            text-sm
            font-semibold
            text-white
            shadow-[0_5px_16px_rgba(23,53,122,0.16)]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:bg-[#10295D]
            hover:shadow-[0_8px_22px_rgba(23,53,122,0.22)]
            active:translate-y-0
            active:scale-[0.98]
            sm:h-12
            sm:px-6
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
            <FiPlus
              size={17}
              strokeWidth={2.5}
            />
          </span>

          Add Attendance
        </button>

      </div>

      {/* =================================================
          TABS
      ================================================= */}

      <div
        className="
          flex
          w-full
          rounded-2xl
          border
          border-slate-200/80
          bg-slate-100/70
          p-1.5
          shadow-[0_2px_10px_rgba(15,23,42,0.025)]
          sm:w-fit
        "
      >

        {/* Employee */}

        <button
          type="button"
          onClick={() =>
            onTabChange("employee")
          }
          className={`
            group
            flex
            min-h-11
            flex-1
            items-center
            justify-center
            gap-2.5
            rounded-xl
            px-4
            text-sm
            font-semibold
            transition-all
            duration-200
            sm:min-w-[190px]
            sm:px-5
            ${
              activeTab === "employee"
                ? `
                  bg-white
                  text-[#17357A]
                  shadow-[0_2px_8px_rgba(15,23,42,0.08)]
                  ring-1
                  ring-slate-200/60
                `
                : `
                  text-slate-500
                  hover:bg-white/60
                  hover:text-slate-800
                `
            }
          `}
        >
          <span
            className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              transition-colors
              ${
                activeTab === "employee"
                  ? "bg-[#17357A]/10 text-[#17357A]"
                  : "bg-slate-200/70 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
              }
            `}
          >
            <FiUsers size={16} />
          </span>

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
            group
            flex
            min-h-11
            flex-1
            items-center
            justify-center
            gap-2.5
            rounded-xl
            px-4
            text-sm
            font-semibold
            transition-all
            duration-200
            sm:min-w-[190px]
            sm:px-5
            ${
              activeTab === "labour"
                ? `
                  bg-white
                  text-[#17357A]
                  shadow-[0_2px_8px_rgba(15,23,42,0.08)]
                  ring-1
                  ring-slate-200/60
                `
                : `
                  text-slate-500
                  hover:bg-white/60
                  hover:text-slate-800
                `
            }
          `}
        >
          <span
            className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              transition-colors
              ${
                activeTab === "labour"
                  ? "bg-[#17357A]/10 text-[#17357A]"
                  : "bg-slate-200/70 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
              }
            `}
          >
            <FiBriefcase size={16} />
          </span>

          <span>
            Labour Attendance
          </span>

        </button>

      </div>

    </section>
  );
};

export default AttendanceHeader;