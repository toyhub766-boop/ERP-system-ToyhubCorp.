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
      icon: "✓",
      iconClass:
        "bg-emerald-50 text-emerald-600",
      valueClass:
        "text-emerald-600",
    },

    {
      label: "Absent",
      value: absent,
      description:
        "Currently marked absent",
      icon: "×",
      iconClass:
        "bg-red-50 text-red-600",
      valueClass:
        "text-red-600",
    },

    {
      label: "On Leave",
      value: leave,
      description:
        "Currently on approved leave",
      icon: "—",
      iconClass:
        "bg-amber-50 text-amber-600",
      valueClass:
        "text-amber-600",
    },

    {
      label: "Average Task Score",
      value: `${averageScore}%`,
      description:
        "Based on completed tasks",
      icon: "%",
      iconClass:
        "bg-blue-50 text-blue-600",
      valueClass:
        "text-[#17357A]",
    },
  ];

  return (
    <section className="mt-8">

      {/* Section heading */}

      <div className="mb-4">

        <h2 className="text-lg font-semibold text-slate-900">
          Attendance Overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          A quick summary of attendance and task performance.
        </p>

      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {cards.map((card) => (
          <div
            key={card.label}
            className="
              group
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-md
            "
          >

            <div className="flex items-start justify-between">

              {/* Icon */}

              <div
                className={`
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  text-sm
                  font-bold
                  ${card.iconClass}
                `}
              >
                {card.icon}
              </div>

              {/* Value */}

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

            {/* Label */}

            <div className="mt-5">

              <p className="text-sm font-semibold text-slate-900">
                {card.label}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {card.description}
              </p>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
};

export default AttendanceOverview;