import {
  FiCalendar,
  FiCamera,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiChevronRight,
} from "react-icons/fi";

interface AttendanceEvent {
  _id?: string;

  type:
    | "CHECK_IN"
    | "BREAK_OUT"
    | "BREAK_IN"
    | "CHECK_OUT";

  at: string;

  photo?: string;

  note?: string;
}

interface AttendanceRecord {
  _id: string;

  employee?: {
    _id?: string;
    name?: string;
    role?: string;
    employeeId?: string;
  };

  date?: string;

  events?: AttendanceEvent[];

  totalElapsedMinutes?: number;
  breakMinutes?: number;
  actualWorkingMinutes?: number;
  requiredWorkingMinutes?: number;
  differenceMinutes?: number;

  status?:
    | "PRESENT"
    | "LATE"
    | "EARLY_LEAVE"
    | "LATE_AND_EARLY"
    | "HALF_DAY"
    | "ABSENT"
    | "LEAVE";

  dayStatus?:
    | "GREEN"
    | "YELLOW"
    | "ABSENT"
    | "LEAVE";

  lateMinutes?: number;
  earlyLeaveMinutes?: number;

  stage?:
    | "NEW"
    | "REGULAR"
    | "IMPROVING"
    | "WARNING"
    | "EXCELLENT";

  score?: number;

  remarks?: string;

  shift?: {
    _id?: string;
    name?: string;
    startTime?: string;
    endTime?: string;
    durationMinutes?: number;
    graceMinutes?: number;
  };
}

interface Props {
  records: AttendanceRecord[];

  onEdit: (
    record: AttendanceRecord
  ) => void;

  onDelete: (
    record: AttendanceRecord
  ) => void;

  onViewPhoto: (
    photo: string,
    employeeName: string,
    date?: string
  ) => void;

  onViewEmployee?: (
    employeeId: string,
    employeeName: string
  ) => void;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const getPhotoUrl = (
  photo?: string
) => {
  if (!photo) return "";

  if (
    photo.startsWith("http://") ||
    photo.startsWith("https://") ||
    photo.startsWith("data:")
  ) {
    return photo;
  }

  return `${API_URL.replace(
    /\/$/,
    ""
  )}/${photo.replace(/^\//, "")}`;
};

const getDayStatusStyles = (
  status?: string
) => {
  switch (status) {
    case "GREEN":
      return {
        wrapper:
          "bg-emerald-50 text-emerald-700 ring-emerald-100",
        dot: "bg-emerald-500",
        label: "Full Day",
      };

    case "YELLOW":
      return {
        wrapper:
          "bg-amber-50 text-amber-700 ring-amber-100",
        dot: "bg-amber-500",
        label: "Late / Early",
      };

    case "LEAVE":
      return {
        wrapper:
          "bg-slate-50 text-slate-600 ring-slate-200",
        dot: "bg-slate-400",
        label: "Leave",
      };

    case "ABSENT":
      return {
        wrapper:
          "bg-red-50 text-red-700 ring-red-100",
        dot: "bg-red-500",
        label: "Absent",
      };

    default:
      return {
        wrapper:
          "bg-slate-50 text-slate-600 ring-slate-200",
        dot: "bg-slate-400",
        label: "Unknown",
      };
  }
};

const getStageStyles = (
  stage?: string
) => {
  switch (stage) {
    case "EXCELLENT":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";

    case "IMPROVING":
      return "bg-blue-50 text-blue-700 ring-blue-100";

    case "REGULAR":
      return "bg-slate-50 text-slate-600 ring-slate-200";

    case "WARNING":
      return "bg-amber-50 text-amber-700 ring-amber-100";

    case "NEW":
      return "bg-violet-50 text-violet-700 ring-violet-100";

    default:
      return "bg-slate-50 text-slate-500 ring-slate-200";
  }
};

const formatDate = (
  value?: string
) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatTime = (
  value?: string
) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const formatMinutes = (
  minutes?: number
) => {
  if (
    minutes === undefined ||
    minutes === null
  ) {
    return "-";
  }

  const safeMinutes = Math.max(
    0,
    Math.round(minutes)
  );

  const hours = Math.floor(
    safeMinutes / 60
  );

  const remaining =
    safeMinutes % 60;

  if (hours === 0) {
    return `${remaining}m`;
  }

  if (remaining === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}m`;
};

const getEvent = (
  record: AttendanceRecord,
  type: AttendanceEvent["type"]
) => {
  return (
    record.events?.find(
      (event) => event.type === type
    ) || null
  );
};

const getLatestPhoto = (
  record: AttendanceRecord
) => {
  const checkIn = getEvent(
    record,
    "CHECK_IN"
  );

  const checkOut = getEvent(
    record,
    "CHECK_OUT"
  );

  return (
    checkOut?.photo ||
    checkIn?.photo ||
    ""
  );
};

const getDisplayScore = (
  record: AttendanceRecord
) => {
  if (
    typeof record.score === "number"
  ) {
    return Math.max(
      0,
      Math.min(100, record.score)
    );
  }

  if (
    record.requiredWorkingMinutes &&
    record.requiredWorkingMinutes > 0
  ) {
    return Math.max(
      0,
      Math.min(
        100,
        Math.round(
          ((record.actualWorkingMinutes ||
            0) /
            record.requiredWorkingMinutes) *
            100
        )
      )
    );
  }

  return 0;
};

const EmployeeAttendanceTable = ({
  records,
  onEdit,
  onDelete,
  onViewPhoto,
  onViewEmployee,
}: Props) => {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A1F]" />

            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Employee Attendance
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {records.length === 1
              ? "1 attendance record"
              : `${records.length} attendance records`}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        {records.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center px-6 py-12">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FiUser size={23} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No attendance records
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                There are no employee attendance
                records matching the current
                search or filter.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1350px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Employee
                  </th>

                  <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Photo
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Date
                  </th>

                  <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Events
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Working
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Break
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Required
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Difference
                  </th>

                  <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Score
                  </th>

                  <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Stage
                  </th>

                  <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => {
                  const employee =
                    record.employee;

                  const employeeName =
                    employee?.name ||
                    "Unknown Employee";

                  const checkIn =
                    getEvent(
                      record,
                      "CHECK_IN"
                    );

                  const checkOut =
                    getEvent(
                      record,
                      "CHECK_OUT"
                    );

                  const photo =
                    getLatestPhoto(
                      record
                    );

                  const score =
                    getDisplayScore(
                      record
                    );

                  const dayStatus =
                    record.dayStatus ||
                    "ABSENT";

                  const statusStyles =
                    getDayStatusStyles(
                      dayStatus
                    );

                  const canOpenProfile =
                    Boolean(
                      employee?._id
                    );

                  return (
                    <tr
                      key={record._id}
                      className={`
                        group
                        border-b
                        border-slate-100
                        transition-colors
                        duration-150
                        last:border-0
                        ${
                          canOpenProfile
                            ? "cursor-pointer hover:bg-slate-50/70"
                            : "hover:bg-slate-50/50"
                        }
                      `}
                      onClick={() => {
                        if (
                          employee?._id &&
                          onViewEmployee
                        ) {
                          onViewEmployee(
                            employee._id,
                            employeeName
                          );
                        }
                      }}
                    >
                      {/* EMPLOYEE */}

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17357A]/8 text-sm font-bold text-[#17357A]">
                            {employeeName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {employeeName}
                              </p>

                              {canOpenProfile && (
                                <FiChevronRight
                                  size={15}
                                  className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#17357A]"
                                />
                              )}
                            </div>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {employee?.employeeId ||
                                "No Employee ID"}
                            </p>

                            {employee?.role && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {employee.role}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* PHOTO */}

                      <td
                        className="px-4 py-5 text-center"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        {photo ? (
                          <button
                            type="button"
                            onClick={() =>
                              onViewPhoto(
                                getPhotoUrl(
                                  photo
                                ),
                                employeeName,
                                record.date
                              )
                            }
                            className="group/photo relative mx-auto block h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#17357A]/30 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#17357A]/10"
                            title="View attendance selfie"
                          >
                            <img
                              src={getPhotoUrl(
                                photo
                              )}
                              alt={`${employeeName} attendance`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover/photo:scale-105"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />

                            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 transition-opacity duration-200 group-hover/photo:opacity-100">
                              <FiCamera
                                size={16}
                                className="text-white"
                              />
                            </span>
                          </button>
                        ) : (
                          <div
                            className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50"
                            title="No attendance selfie"
                          >
                            <FiCamera
                              size={16}
                              className="text-slate-300"
                            />
                          </div>
                        )}
                      </td>

                      {/* DATE */}

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                            <FiCalendar
                              size={14}
                              className="text-slate-400"
                            />
                          </span>

                          <span className="text-sm font-medium text-slate-700">
                            {formatDate(
                              record.date
                            )}
                          </span>
                        </div>
                      </td>

                      {/* EVENTS */}

                      <td className="px-4 py-5 text-center">
                        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                          <FiClock
                            size={14}
                            className="text-slate-400"
                          />

                          <span className="text-xs font-semibold text-slate-700">
                            {record.events
                              ?.length || 0}
                          </span>

                          <span className="text-xs text-slate-400">
                            events
                          </span>
                        </div>
                      </td>

                      {/* WORKING */}

                      <td className="px-4 py-5">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {formatMinutes(
                              record.actualWorkingMinutes
                            )}
                          </p>

                          {checkIn && (
                            <p className="mt-1 text-[11px] text-slate-400">
                              In{" "}
                              {formatTime(
                                checkIn.at
                              )}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* BREAK */}

                      <td className="px-4 py-5">
                        <span className="text-sm font-medium text-slate-700">
                          {formatMinutes(
                            record.breakMinutes
                          )}
                        </span>
                      </td>

                      {/* REQUIRED */}

                      <td className="px-4 py-5">
                        <span className="text-sm font-medium text-slate-700">
                          {formatMinutes(
                            record.requiredWorkingMinutes
                          )}
                        </span>
                      </td>

                      {/* DIFFERENCE */}

                      <td className="px-4 py-5">
                        <div>
                          <span
                            className={`text-sm font-semibold ${
                              (
                                record.differenceMinutes ||
                                0
                              ) >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {(
                              record.differenceMinutes ||
                              0
                            ) >= 0
                              ? "+"
                              : "-"}
                            {formatMinutes(
                              Math.abs(
                                record.differenceMinutes ||
                                  0
                              )
                            )}
                          </span>

                          {record.lateMinutes &&
                            record.lateMinutes >
                              0 && (
                              <p className="mt-1 text-[11px] text-amber-600">
                                Late{" "}
                                {formatMinutes(
                                  record.lateMinutes
                                )}
                              </p>
                            )}

                          {record.earlyLeaveMinutes &&
                            record.earlyLeaveMinutes >
                              0 && (
                              <p className="mt-1 text-[11px] text-red-500">
                                Early{" "}
                                {formatMinutes(
                                  record.earlyLeaveMinutes
                                )}
                              </p>
                            )}
                        </div>
                      </td>

                      {/* SCORE */}

                      <td className="px-4 py-5 text-center">
                        <span
                          className={`inline-flex min-w-[58px] items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                            score >= 80
                              ? "bg-emerald-50 text-emerald-700"
                              : score >= 50
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {score}%
                        </span>
                      </td>

                      {/* STAGE */}

                      <td className="px-4 py-5 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase ring-1 ring-inset ${getStageStyles(
                            record.stage
                          )}`}
                        >
                          {record.stage ||
                            "NEW"}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-5 text-center">
                        <span
                          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusStyles.wrapper}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`}
                          />

                          {statusStyles.label}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td
                        className="px-5 py-5"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              onEdit(record)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-[#17357A]/8 hover:text-[#17357A] active:scale-95"
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
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
                            title="Delete attendance"
                          >
                            <FiTrash2
                              size={16}
                            />
                          </button>
                        </div>

                        {checkOut && (
                          <p className="mt-1 text-center text-[10px] text-slate-400">
                            Out{" "}
                            {formatTime(
                              checkOut.at
                            )}
                          </p>
                        )}
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

export default EmployeeAttendanceTable;