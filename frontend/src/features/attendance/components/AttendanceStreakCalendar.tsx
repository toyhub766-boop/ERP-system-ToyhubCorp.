import { useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiLogIn,
  FiLogOut,
  FiCoffee,
  FiAward,
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

  attendanceType?:
    | "EMPLOYEE"
    | "LABOUR";

  employee?: {
    _id?: string;
    name?: string;
    employeeId?: string;
  };

  labour?: {
    _id?: string;
    name?: string;
    department?: string;
  };

  date: string;

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
    name?: string;
    startTime?: string;
    endTime?: string;
    durationMinutes?: number;
    graceMinutes?: number;
  };
}

interface Props {
  records: AttendanceRecord[];
  personName?: string;
  onDaySelect?: (
    record: AttendanceRecord | null,
    date: Date
  ) => void;
}

type CalendarStatus =
  | "GREEN"
  | "YELLOW"
  | "ABSENT"
  | "LEAVE"
  | "EMPTY";

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getRecordDateKey = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return getDateKey(date);
};

const formatMinutes = (minutes?: number) => {
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

  const remaining = safeMinutes % 60;

  if (hours === 0) {
    return `${remaining}m`;
  }

  if (remaining === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}m`;
};

const formatTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCalendarStatus = (
  record?: AttendanceRecord
): CalendarStatus => {
  if (!record) {
    return "EMPTY";
  }

  if (record.dayStatus) {
    return record.dayStatus;
  }

  if (record.status === "LEAVE") {
    return "LEAVE";
  }

  if (record.status === "ABSENT") {
    return "ABSENT";
  }

  if (
    record.status === "LATE" ||
    record.status === "EARLY_LEAVE" ||
    record.status === "LATE_AND_EARLY" ||
    record.status === "HALF_DAY"
  ) {
    return "YELLOW";
  }

  if (record.status === "PRESENT") {
    return "GREEN";
  }

  return "EMPTY";
};

const getDayClasses = (
  status: CalendarStatus,
  isSelected: boolean,
  isToday: boolean
) => {
  const base =
    "relative flex min-h-[54px] items-center justify-center rounded-xl border text-center transition-all duration-150 sm:min-h-[72px] sm:items-start sm:justify-start sm:p-2.5";

  let statusClasses = "";

  switch (status) {
    case "GREEN":
      statusClasses =
        "border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100/70";

      break;

    case "YELLOW":
      statusClasses =
        "border-amber-200 bg-amber-50 hover:border-amber-300 hover:bg-amber-100/70";

      break;

    case "ABSENT":
      statusClasses =
        "border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100/70";

      break;

    case "LEAVE":
      statusClasses =
        "border-slate-200 bg-slate-100 hover:border-slate-300 hover:bg-slate-200/70";

      break;

    default:
      statusClasses =
        "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50";
  }

  const selectedClasses = isSelected
    ? "ring-2 ring-[#17357A]/35 ring-offset-1"
    : "";

  const todayClasses = isToday
    ? "shadow-[inset_0_0_0_1px_rgba(23,53,122,0.35)]"
    : "";

  return `${base} ${statusClasses} ${selectedClasses} ${todayClasses}`;
};

const getStatusDot = (
  status: CalendarStatus
) => {
  switch (status) {
    case "GREEN":
      return "bg-emerald-500";

    case "YELLOW":
      return "bg-amber-500";

    case "ABSENT":
      return "bg-red-500";

    case "LEAVE":
      return "bg-slate-400";

    default:
      return "bg-slate-200";
  }
};

const getDateLabel = (date: Date) => {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AttendanceStreakCalendar = ({
  records,
  personName,
  onDaySelect,
}: Props) => {
  const today = new Date();

  const [currentMonth, setCurrentMonth] =
    useState(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

  const [selectedDateKey, setSelectedDateKey] =
    useState<string | null>(null);

  const recordsByDate = useMemo(() => {
    const map = new Map<
      string,
      AttendanceRecord
    >();

    records.forEach((record) => {
      const key = getRecordDateKey(
        record.date
      );

      if (key) {
        map.set(key, record);
      }
    });

    return map;
  }, [records]);

  const monthLabel =
    currentMonth.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );

  const calendarDays = useMemo(() => {
    const year =
      currentMonth.getFullYear();

    const month =
      currentMonth.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    );

    const lastDay = new Date(
      year,
      month + 1,
      0
    );

    const firstWeekday =
      firstDay.getDay();

    const totalDays =
      lastDay.getDate();

    const days: Array<Date | null> = [];

    for (
      let index = 0;
      index < firstWeekday;
      index++
    ) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= totalDays;
      day++
    ) {
      days.push(
        new Date(
          year,
          month,
          day
        )
      );
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentMonth]);

  const currentStreak = useMemo(() => {
    const datedRecords = records
      .map((record) => ({
        key: getRecordDateKey(
          record.date
        ),
        record,
      }))
      .filter(
        (item) => item.key
      )
      .sort((a, b) =>
        a.key.localeCompare(b.key)
      );

    if (datedRecords.length === 0) {
      return 0;
    }

    const statusByDate =
      new Map<
        string,
        CalendarStatus
      >();

    datedRecords.forEach(
      ({ key, record }) => {
        statusByDate.set(
          key,
          getCalendarStatus(record)
        );
      }
    );

    const sortedKeys =
      Array.from(
        statusByDate.keys()
      ).sort();

    let anchorKey =
      sortedKeys[
        sortedKeys.length - 1
      ];

    const todayKey =
      getDateKey(today);

    if (anchorKey > todayKey) {
      anchorKey = todayKey;
    }

    let cursor = new Date(
      `${anchorKey}T00:00:00`
    );

    let streak = 0;

    while (true) {
      const key =
        getDateKey(cursor);

      const status =
        statusByDate.get(key);

      if (status === "LEAVE") {
        cursor.setDate(
          cursor.getDate() - 1
        );
        continue;
      }

      if (status === "GREEN") {
        streak += 1;

        cursor.setDate(
          cursor.getDate() - 1
        );

        continue;
      }

      break;
    }

    return streak;
  }, [records]);

  const monthStats = useMemo(() => {
    const month =
      currentMonth.getMonth();

    const year =
      currentMonth.getFullYear();

    let green = 0;
    let yellow = 0;
    let absent = 0;
    let leave = 0;

    records.forEach((record) => {
      const date = new Date(
        record.date
      );

      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month
      ) {
        return;
      }

      const status =
        getCalendarStatus(record);

      if (status === "GREEN") {
        green += 1;
      } else if (
        status === "YELLOW"
      ) {
        yellow += 1;
      } else if (
        status === "ABSENT"
      ) {
        absent += 1;
      } else if (
        status === "LEAVE"
      ) {
        leave += 1;
      }
    });

    return {
      green,
      yellow,
      absent,
      leave,
    };
  }, [records, currentMonth]);

  const selectedRecord =
    selectedDateKey
      ? recordsByDate.get(
          selectedDateKey
        )
      : undefined;

  const selectedDate =
    selectedDateKey
      ? new Date(
          `${selectedDateKey}T00:00:00`
        )
      : null;

  const handleDayClick = (
    date: Date
  ) => {
    const key = getDateKey(date);

    const record =
      recordsByDate.get(key) ||
      null;

    setSelectedDateKey(key);

    onDaySelect?.(
      record,
      date
    );
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );

    setSelectedDateKey(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );

    setSelectedDateKey(null);
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

    setSelectedDateKey(null);
  };

  return (
    <section className="mt-8">
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

        {/* HEADER */}

        <div className="border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A1F]" />

                <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                  Attendance Calendar
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {personName
                  ? `${personName}'s attendance history`
                  : "Attendance performance and streak history"}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-start sm:gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:px-3.5 sm:py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400 sm:text-[10px]">
                  Current Streak
                </p>

                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-[#17357A]">
                    {currentStreak}
                  </span>

                  <span className="text-[10px] font-medium text-slate-500 sm:text-xs">
                    {currentStreak === 1
                      ? "day"
                      : "days"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={goToCurrentMonth}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* CALENDAR AREA */}

        <div className="px-3 py-4 sm:px-6 sm:py-5">

          {/* MONTH CONTROLS */}

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={
                  goToPreviousMonth
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Previous month"
              >
                <FiChevronLeft size={17} />
              </button>

              <h3 className="min-w-0 text-center text-sm font-bold text-slate-900 sm:min-w-[150px] sm:text-base">
                {monthLabel}
              </h3>

              <button
                type="button"
                onClick={
                  goToNextMonth
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Next month"
              >
                <FiChevronRight size={17} />
              </button>
            </div>

            {/* DESKTOP MONTH STATS */}

            <div className="hidden flex-wrap items-center gap-2 sm:flex">
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                {monthStats.green} full
              </span>

              <span className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700">
                {monthStats.yellow} attention
              </span>

              <span className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700">
                {monthStats.absent} absent
              </span>

              <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                {monthStats.leave} leave
              </span>
            </div>
          </div>

          {/* MOBILE STATS */}

          <div className="mt-3 grid grid-cols-4 gap-1.5 sm:hidden">
            <div className="rounded-lg bg-emerald-50 px-1.5 py-2 text-center">
              <p className="text-sm font-bold text-emerald-700">
                {monthStats.green}
              </p>
              <p className="text-[8px] font-semibold uppercase tracking-wide text-emerald-600">
                Full
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 px-1.5 py-2 text-center">
              <p className="text-sm font-bold text-amber-700">
                {monthStats.yellow}
              </p>
              <p className="text-[8px] font-semibold uppercase tracking-wide text-amber-600">
                Attention
              </p>
            </div>

            <div className="rounded-lg bg-red-50 px-1.5 py-2 text-center">
              <p className="text-sm font-bold text-red-700">
                {monthStats.absent}
              </p>
              <p className="text-[8px] font-semibold uppercase tracking-wide text-red-600">
                Absent
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 px-1.5 py-2 text-center">
              <p className="text-sm font-bold text-slate-600">
                {monthStats.leave}
              </p>
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500">
                Leave
              </p>
            </div>
          </div>

          {/* CALENDAR */}

          <div className="mt-5">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">

              {/* WEEKDAYS */}

              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div
                  key={day}
                  className="py-1.5 text-center text-[8px] font-bold uppercase tracking-wide text-slate-400 sm:py-2 sm:text-[10px]"
                >
                  <span className="sm:hidden">
                    {day.charAt(0)}
                  </span>

                  <span className="hidden sm:inline">
                    {day}
                  </span>
                </div>
              ))}

              {/* DAYS */}

              {calendarDays.map(
                (date, index) => {
                  if (!date) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-[54px] sm:min-h-[72px]"
                      />
                    );
                  }

                  const key =
                    getDateKey(date);

                  const record =
                    recordsByDate.get(
                      key
                    );

                  const status =
                    getCalendarStatus(
                      record
                    );

                  const isToday =
                    key ===
                    getDateKey(today);

                  const isSelected =
                    key ===
                    selectedDateKey;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        handleDayClick(
                          date
                        )
                      }
                      className={getDayClasses(
                        status,
                        isSelected,
                        isToday
                      )}
                      title={getDateLabel(
                        date
                      )}
                    >
                      {/* MOBILE: ONLY DATE */}

                      <span
                        className={`
                          text-xs
                          font-bold
                          sm:hidden
                          ${
                            isToday
                              ? "text-[#17357A]"
                              : "text-slate-700"
                          }
                        `}
                      >
                        {date.getDate()}
                      </span>

                      {/* DESKTOP: DATE + DETAILS */}

                      <div className="hidden w-full sm:block">
                        <div className="flex items-start justify-between">
                          <span
                            className={`text-sm font-bold ${
                              isToday
                                ? "text-[#17357A]"
                                : "text-slate-700"
                            }`}
                          >
                            {date.getDate()}
                          </span>

                          {isToday && (
                            <span className="rounded-md bg-[#17357A] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                              Today
                            </span>
                          )}
                        </div>

                        {record ? (
                          <>
                            <div className="mt-3 flex items-center gap-1.5">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                  status
                                )}`}
                              />

                              <span className="truncate text-[10px] font-semibold text-slate-600">
                                {status ===
                                "GREEN"
                                  ? "Present"
                                  : status ===
                                    "YELLOW"
                                  ? "Attention"
                                  : status ===
                                    "ABSENT"
                                  ? "Absent"
                                  : status ===
                                    "LEAVE"
                                  ? "Leave"
                                  : ""}
                              </span>
                            </div>

                            {record.actualWorkingMinutes !==
                              undefined && (
                              <p className="mt-1 text-[10px] font-medium text-slate-400">
                                {formatMinutes(
                                  record.actualWorkingMinutes
                                )}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="mt-4 text-[10px] font-medium text-slate-300">
                            No record
                          </p>
                        )}
                      </div>

                      {/* TODAY INDICATOR — MOBILE */}

                      {isToday && (
                        <span
                          className="
                            absolute
                            bottom-1
                            h-1
                            w-1
                            rounded-full
                            bg-[#17357A]
                            sm:hidden
                          "
                        />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* LEGEND */}

          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start sm:gap-x-5">
              <span className="w-full text-center text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:w-auto sm:text-left sm:text-[10px]">
                Legend
              </span>

              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md border border-emerald-200 bg-emerald-100" />
                <span className="text-[10px] font-medium text-slate-600 sm:text-xs">
                  Full day
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md border border-amber-200 bg-amber-100" />
                <span className="text-[10px] font-medium text-slate-600 sm:text-xs">
                  Late / early
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md border border-red-200 bg-red-100" />
                <span className="text-[10px] font-medium text-slate-600 sm:text-xs">
                  Absent
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md border border-slate-200 bg-slate-100" />
                <span className="text-[10px] font-medium text-slate-600 sm:text-xs">
                  Leave
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SELECTED DAY */}

        {selectedDate && (
          <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Selected Day
                </p>

                <h3 className="mt-1 text-base font-bold text-slate-900">
                  {getDateLabel(
                    selectedDate
                  )}
                </h3>
              </div>

              {selectedRecord ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <p className="text-[10px] font-medium text-slate-400">
                      Working
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {formatMinutes(
                        selectedRecord.actualWorkingMinutes
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <p className="text-[10px] font-medium text-slate-400">
                      Break
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {formatMinutes(
                        selectedRecord.breakMinutes
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <p className="text-[10px] font-medium text-slate-400">
                      Difference
                    </p>

                    <p
                      className={`mt-1 text-sm font-bold ${
                        (
                          selectedRecord.differenceMinutes ||
                          0
                        ) >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {(
                        selectedRecord.differenceMinutes ||
                        0
                      ) >= 0
                        ? "+"
                        : "-"}
                      {formatMinutes(
                        Math.abs(
                          selectedRecord.differenceMinutes ||
                            0
                        )
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <p className="text-[10px] font-medium text-slate-400">
                      Score
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#17357A]">
                      {selectedRecord.score ??
                        0}
                      %
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-sm font-medium text-slate-500">
                    No attendance record for
                    this day.
                  </p>
                </div>
              )}
            </div>

            {selectedRecord && (
              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">

                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Event Timeline
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.events?.map(
                      (event) => {
                        const isCheckIn =
                          event.type ===
                          "CHECK_IN";

                        const isCheckOut =
                          event.type ===
                          "CHECK_OUT";

                        return (
                          <div
                            key={
                              event._id ||
                              `${event.type}-${event.at}`
                            }
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                              {isCheckIn ? (
                                <FiLogIn size={14} />
                              ) : isCheckOut ? (
                                <FiLogOut size={14} />
                              ) : (
                                <FiCoffee size={14} />
                              )}
                            </span>

                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400">
                                {event.type.replace(
                                  "_",
                                  " "
                                )}
                              </p>

                              <p className="text-xs font-semibold text-slate-700">
                                {formatTime(
                                  event.at
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">

                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-medium text-slate-400">
                      Stage
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <FiAward
                        size={14}
                        className="text-[#17357A]"
                      />

                      <span className="text-xs font-bold text-slate-700">
                        {selectedRecord.stage ||
                          "NEW"}
                      </span>
                    </div>
                  </div>

                  {selectedRecord.shift && (
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <p className="text-[10px] font-medium text-slate-400">
                        Shift
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <FiClock
                          size={14}
                          className="text-[#17357A]"
                        />

                        <span className="text-xs font-bold text-slate-700">
                          {selectedRecord.shift.name ||
                            "Assigned"}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AttendanceStreakCalendar;