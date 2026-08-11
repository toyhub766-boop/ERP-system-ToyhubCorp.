import {
  FiCalendar,
  FiCamera,
  FiEdit2,
  FiTrash2,
  FiUser,
} from "react-icons/fi";

interface LabourRecord {
  _id: string;

  labour?: {
    _id?: string;
    name?: string;
    department?: string;
  };

  date?: string;

  checkIn?: string;
  checkOut?: string;

  status?:
    | "Present"
    | "Absent"
    | "Half Day"
    | "Leave";

  tasksAssigned?: number;
  tasksCompleted?: number;

  score?: number;

  photo?: string;

  remarks?: string;
}

interface Props {
  records: LabourRecord[];

  onEdit: (record: LabourRecord) => void;

  onDelete: (record: LabourRecord) => void;

  onViewPhoto: (
    photo: string,
    labourName: string,
    date?: string
  ) => void;
}

const getStatusStyles = (status?: string) => {
  switch (status) {
    case "Present":
      return {
        wrapper:
          "border-emerald-200/70 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      };

    case "Absent":
      return {
        wrapper:
          "border-red-200/70 bg-red-50 text-red-700",
        dot: "bg-red-500",
      };

    case "Half Day":
      return {
        wrapper:
          "border-amber-200/70 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
      };

    case "Leave":
      return {
        wrapper:
          "border-blue-200/70 bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
      };

    default:
      return {
        wrapper:
          "border-slate-200 bg-slate-50 text-slate-600",
        dot: "bg-slate-400",
      };
  }
};

const getScore = (record: LabourRecord) => {
  if (typeof record.score === "number") {
    return Math.max(0, Math.min(100, record.score));
  }

  if (
    record.tasksAssigned &&
    record.tasksAssigned > 0
  ) {
    return Math.min(
      100,
      Math.round(
        ((record.tasksCompleted || 0) /
          record.tasksAssigned) *
          100
      )
    );
  }

  return 0;
};

const getScoreStyles = (score: number) => {
  if (score >= 80) {
    return {
      badge:
        "bg-emerald-50 text-emerald-700 border-emerald-100",
      bar: "bg-emerald-500",
    };
  }

  if (score >= 50) {
    return {
      badge:
        "bg-amber-50 text-amber-700 border-amber-100",
      bar: "bg-amber-500",
    };
  }

  return {
    badge:
      "bg-red-50 text-red-700 border-red-100",
    bar: "bg-red-500",
  };
};

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const LabourAttendanceTable = ({
  records,
  onEdit,
  onDelete,
  onViewPhoto,
}: Props) => {
  return (
    <section className="mt-8">
      {/* ================= HEADER ================= */}

      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Labour Attendance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {records.length === 1
              ? "1 attendance record"
              : `${records.length} attendance records`}
          </p>
        </div>
      </div>

      {/* ================= CARD ================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]">
        {records.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center px-6 py-12">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                <FiUser
                  size={22}
                  className="text-slate-400"
                />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-900">
                No labour attendance
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                No attendance records match the
                current search or status filter.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse">
              {/* ================= HEAD ================= */}

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Labour
                  </th>

                  <th className="px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Photo
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Department
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Date
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Check In
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Check Out
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Tasks
                  </th>

                  <th className="px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Score
                  </th>

                  <th className="px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* ================= BODY ================= */}

              <tbody className="divide-y divide-slate-100">
                {records.map((record) => {
                  const labour = record.labour;

                  const labourName =
                    labour?.name ||
                    "Unknown Labour";

                  const score = getScore(record);

                  const statusStyles =
                    getStatusStyles(
                      record.status
                    );

                  const scoreStyles =
                    getScoreStyles(score);

                  const completed =
                    record.tasksCompleted || 0;

                  const assigned =
                    record.tasksAssigned || 0;

                  const taskProgress =
                    assigned > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (completed /
                              assigned) *
                              100
                          )
                        )
                      : 0;

                  return (
                    <tr
                      key={record._id}
                      className="
                        group
                        transition-colors
                        duration-150
                        hover:bg-slate-50/70
                      "
                    >
                      {/* ================= LABOUR ================= */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-sm font-bold text-amber-700">
                            {labourName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {labourName}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Labour
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ================= PHOTO ================= */}

                      <td className="px-4 py-5 text-center">
                        {record.photo ? (
                          <button
                            type="button"
                            onClick={() =>
                              onViewPhoto(
                                record.photo!,
                                labourName,
                                record.date
                              )
                            }
                            className="
                              group/photo
                              relative
                              mx-auto
                              block
                              h-11
                              w-11
                              overflow-hidden
                              rounded-xl
                              border
                              border-slate-200
                              bg-slate-100
                              shadow-sm
                              transition-all
                              duration-200
                              hover:scale-105
                              hover:border-slate-300
                              hover:shadow-md
                              focus:outline-none
                              focus:ring-2
                              focus:ring-[#17357A]/20
                            "
                            title="View attendance photo"
                          >
                            <img
                              src={record.photo}
                              alt={`${labourName} attendance`}
                              className="h-full w-full object-cover"
                            />

                            <span
                              className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                bg-slate-950/45
                                opacity-0
                                transition-opacity
                                duration-200
                                group-hover/photo:opacity-100
                              "
                            >
                              <FiCamera
                                size={15}
                                className="text-white"
                              />
                            </span>
                          </button>
                        ) : (
                          <div
                            className="
                              mx-auto
                              flex
                              h-11
                              w-11
                              items-center
                              justify-center
                              rounded-xl
                              border
                              border-dashed
                              border-slate-200
                              bg-slate-50
                            "
                          >
                            <FiCamera
                              size={16}
                              className="text-slate-300"
                            />
                          </div>
                        )}
                      </td>

                      {/* ================= DEPARTMENT ================= */}

                      <td className="px-4 py-5">
                        <span className="text-sm font-medium text-slate-700">
                          {labour?.department ||
                            "-"}
                        </span>
                      </td>

                      {/* ================= DATE ================= */}

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                            <FiCalendar
                              size={14}
                            />
                          </div>

                          <span className="text-sm font-medium text-slate-700">
                            {formatDate(
                              record.date
                            )}
                          </span>
                        </div>
                      </td>

                      {/* ================= CHECK IN ================= */}

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />

                          <span className="text-sm font-medium text-slate-700">
                            {record.checkIn ||
                              "-"}
                          </span>
                        </div>
                      </td>

                      {/* ================= CHECK OUT ================= */}

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-400" />

                          <span className="text-sm font-medium text-slate-700">
                            {record.checkOut ||
                              "-"}
                          </span>
                        </div>
                      </td>

                      {/* ================= TASKS ================= */}

                      <td className="px-4 py-5">
                        <div className="w-[125px]">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-800">
                              {completed}/{assigned}
                            </span>

                            <span className="text-[11px] text-slate-400">
                              {taskProgress}%
                            </span>
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#17357A] transition-all duration-500"
                              style={{
                                width: `${taskProgress}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* ================= SCORE ================= */}

                      <td className="px-4 py-5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span
                            className={`
                              inline-flex
                              min-w-[58px]
                              items-center
                              justify-center
                              rounded-lg
                              border
                              px-2.5
                              py-1.5
                              text-xs
                              font-bold
                              ${scoreStyles.badge}
                            `}
                          >
                            {score}%
                          </span>
                        </div>
                      </td>

                      {/* ================= STATUS ================= */}

                      <td className="px-4 py-5 text-center">
                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-2
                            whitespace-nowrap
                            rounded-full
                            border
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            ${statusStyles.wrapper}
                          `}
                        >
                          <span
                            className={`
                              h-1.5
                              w-1.5
                              rounded-full
                              ${statusStyles.dot}
                            `}
                          />

                          {record.status ||
                            "Unknown"}
                        </span>
                      </td>

                      {/* ================= ACTIONS ================= */}

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              onEdit(record)
                            }
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              text-slate-400
                              transition-all
                              duration-150
                              hover:bg-blue-50
                              hover:text-[#17357A]
                              active:scale-95
                            "
                            title="Edit attendance"
                          >
                            <FiEdit2
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onDelete(record)
                            }
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              text-slate-400
                              transition-all
                              duration-150
                              hover:bg-red-50
                              hover:text-red-600
                              active:scale-95
                            "
                            title="Delete attendance"
                          >
                            <FiTrash2
                              size={16}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default LabourAttendanceTable;