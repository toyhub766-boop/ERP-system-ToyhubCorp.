import {
  FiCalendar,
  FiCamera,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiUser,
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

interface LabourRecord {
  _id: string;

  labour?: {
    _id?: string;
    name?: string;
    department?: string;
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

const getDayStatusStyles = (
  status?: string
) => {
  switch (status) {
    case "GREEN":
      return {
        wrapper:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
        label: "Full Day",
      };

    case "YELLOW":
      return {
        wrapper:
          "border-amber-200 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
        label: "Late / Early",
      };

    case "LEAVE":
      return {
        wrapper:
          "border-slate-200 bg-slate-50 text-slate-600",
        dot: "bg-slate-400",
        label: "Leave",
      };

    case "ABSENT":
      return {
        wrapper:
          "border-red-200 bg-red-50 text-red-700",
        dot: "bg-red-500",
        label: "Absent",
      };

    default:
      return {
        wrapper:
          "border-slate-200 bg-slate-50 text-slate-600",
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
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "IMPROVING":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "REGULAR":
      return "border-slate-200 bg-slate-50 text-slate-600";

    case "WARNING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "NEW":
      return "border-violet-200 bg-violet-50 text-violet-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-500";
  }
};

const getScoreStyles = (
  score: number
) => {
  if (score >= 80) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (score >= 50) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
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
  record: LabourRecord,
  type: AttendanceEvent["type"]
) => {
  return (
    record.events?.find(
      (event) => event.type === type
    ) || null
  );
};

const getLatestPhoto = (
  record: LabourRecord
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
  record: LabourRecord
) => {
  if (
    typeof record.score ===
    "number"
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

const LabourAttendanceTable = ({
  records,
  onEdit,
  onDelete,
  onViewPhoto,
}: Props) => {
  return (
    <section className="mt-8">
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
                No attendance records match
                the current filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Labour
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Date
                  </th>

                  <th className="px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Events
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Working
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Break
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Required
                  </th>

                  <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Difference
                  </th>

                  <th className="px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Score
                  </th>

                  <th className="px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Stage
                  </th>

                  <th className="px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {records.map((record) => {
                  const labourName =
                    record.labour?.name ||
                    "Unknown Labour";

                  const dayStatus =
                    record.dayStatus ||
                    "ABSENT";

                  const statusStyles =
                    getDayStatusStyles(
                      dayStatus
                    );

                  const score =
                    getDisplayScore(
                      record
                    );

                  const scoreStyles =
                    getScoreStyles(score);

                  const photo =
                    getLatestPhoto(
                      record
                    );

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

                  return (
                    <tr
                      key={record._id}
                      className="group transition-colors duration-150 hover:bg-slate-50/70"
                    >
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
                              {record.labour
                                ?.department ||
                                "Labour"}
                            </p>
                          </div>
                        </div>
                      </td>

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

                      <td className="px-4 py-5">
                        <span className="text-sm font-medium text-slate-700">
                          {formatMinutes(
                            record.breakMinutes
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        <span className="text-sm font-medium text-slate-700">
                          {formatMinutes(
                            record.requiredWorkingMinutes
                          )}
                        </span>
                      </td>

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
                              : ""}
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

                      <td className="px-4 py-5 text-center">
                        <span
                          className={`inline-flex min-w-[58px] items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-bold ${scoreStyles}`}
                        >
                          {score}%
                        </span>
                      </td>

                      <td className="px-4 py-5 text-center">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase ${getStageStyles(
                            record.stage
                          )}`}
                        >
                          {record.stage ||
                            "NEW"}
                        </span>
                      </td>

                      <td className="px-4 py-5 text-center">
                        <span
                          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyles.wrapper}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`}
                          />

                          {statusStyles.label}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-1">
                          {photo ? (
                            <button
                              type="button"
                              onClick={() =>
                                onViewPhoto(
                                  photo,
                                  labourName,
                                  record.date
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-[#17357A]"
                              title="View attendance selfie"
                            >
                              <FiCamera
                                size={16}
                              />
                            </button>
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-200">
                              <FiCamera
                                size={16}
                              />
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              onEdit(record)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-[#17357A]"
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
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
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

export default LabourAttendanceTable;