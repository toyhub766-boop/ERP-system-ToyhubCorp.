import {
  CheckCircle2,
  CircleX,
  CalendarOff,
  Percent,
} from "lucide-react";

interface AttendanceRecord {
  status?: string;
  tasksAssigned?: number;
  tasksCompleted?: number;
  score?: number;
}

interface Props {
  records: AttendanceRecord[];
}

const AttendanceOverview = ({
  records,
}: Props) => {
  const total = records.length;

  const present = records.filter(
    (record) =>
      record.status === "Present"
  ).length;

  const absent = records.filter(
    (record) =>
      record.status === "Absent"
  ).length;

  const leave = records.filter(
    (record) =>
      record.status === "Leave"
  ).length;

  const averageScore =
    records.length === 0
      ? 0
      : Math.round(
          records.reduce(
            (sum, record) => {
              const score =
                typeof record.score ===
                "number"
                  ? record.score
                  : record.tasksAssigned &&
                    record.tasksAssigned > 0
                  ? Math.round(
                      ((record.tasksCompleted ||
                        0) /
                        record.tasksAssigned) *
                        100
                    )
                  : 0;

              return sum + score;
            },
            0
          ) / records.length
        );

  const cards = [
    {
      label: "Present",
      value: present,
      description:
        total === 1
          ? "1 attendance record"
          : `${total} attendance records`,
      icon: CheckCircle2,
      iconClass:
        "bg-emerald-50 text-emerald-600",
      valueClass:
        "text-emerald-600",
      accent:
        "from-emerald-500/0 via-emerald-500/0 to-emerald-500/20",
    },

    {
      label: "Absent",
      value: absent,
      description:
        "Currently marked absent",
      icon: CircleX,
      iconClass:
        "bg-red-50 text-red-600",
      valueClass:
        "text-red-600",
      accent:
        "from-red-500/0 via-red-500/0 to-red-500/20",
    },

    {
      label: "On Leave",
      value: leave,
      description:
        "Currently on approved leave",
      icon: CalendarOff,
      iconClass:
        "bg-amber-50 text-amber-600",
      valueClass:
        "text-amber-600",
      accent:
        "from-amber-500/0 via-amber-500/0 to-amber-500/20",
    },

    {
      label: "Average Task Score",
      value: `${averageScore}%`,
      description:
        "Based on completed tasks",
      icon: Percent,
      iconClass:
        "bg-blue-50 text-[#17357A]",
      valueClass:
        "text-[#17357A]",
      accent:
        "from-blue-500/0 via-blue-500/0 to-blue-500/20",
    },
  ];

  return (
    <section className="mt-8">

      {/* ================= HEADER ================= */}

      <div className="mb-5">

        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#17357A]">
          Workforce Insights
        </p>

        <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">

          <div>

            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Attendance Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A quick summary of attendance
              and task performance.
            </p>

          </div>

          <div className="flex h-8 w-fit items-center rounded-lg bg-slate-100 px-3 text-xs font-medium text-slate-500">
            {total}{" "}
            {total === 1
              ? "record"
              : "records"}
          </div>

        </div>

      </div>

      {/* ================= CARDS ================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-slate-200/80
                bg-white
                p-5
                shadow-[0_2px_12px_rgba(15,23,42,0.035)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-slate-300
                hover:shadow-[0_10px_30px_rgba(15,23,42,0.07)]
              "
            >

              {/* Decorative corner */}

              <div
                className={`
                  pointer-events-none
                  absolute
                  -right-10
                  -top-10
                  h-28
                  w-28
                  rounded-full
                  bg-gradient-to-br
                  ${card.accent}
                  blur-2xl
                  transition-transform
                  duration-300
                  group-hover:scale-125
                `}
              />

              {/* Top row */}

              <div className="relative flex items-start justify-between">

                <div
                  className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    ${card.iconClass}
                  `}
                >
                  <Icon
                    size={19}
                    strokeWidth={2.2}
                  />
                </div>

                <p
                  className={`
                    text-3xl
                    font-bold
                    tracking-tight
                    ${card.valueClass}
                  `}
                >
                  {card.value}
                </p>

              </div>

              {/* Bottom */}

              <div className="relative mt-6">

                <p className="text-sm font-bold text-slate-900">
                  {card.label}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {card.description}
                </p>

              </div>

              {/* Bottom accent */}

              <div
                className={`
                  absolute
                  bottom-0
                  left-5
                  right-5
                  h-px
                  opacity-0
                  transition-opacity
                  duration-200
                  group-hover:opacity-100
                  ${
                    card.label ===
                    "Present"
                      ? "bg-emerald-200"
                      : card.label ===
                        "Absent"
                      ? "bg-red-200"
                      : card.label ===
                        "On Leave"
                      ? "bg-amber-200"
                      : "bg-blue-200"
                  }
                `}
              />

            </div>
          );
        })}

      </div>

    </section>
  );
};

export default AttendanceOverview;