import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import HRLayout from "../layouts/HRLayout";

import {
  getAttendance,
  deleteAttendance,
} from "../../attendance/services/attendance.service";

import {
  getLabours,
  deleteLabour,
} from "../../labour/services/labour.service";

import {
  getAttendanceShift,
} from "../../attendance/services/attendanceShift.service";

import LabourModal from "../../labour/components/LabourModal";
import EmployeeAttendanceTable from "../../attendance/components/EmployeeAttendanceTable";
import AttendancePhotoPreview from "../../attendance/components/AttendancePhotoPreview";
import AttendanceStreakCalendar from "../../attendance/components/AttendanceStreakCalendar";

import LabourProxyPunch from "../../attendance/components/LabourProxyPunch";

import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiDownload,
  FiFileText,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiSearch,
  FiChevronDown,
  FiClipboard,
  FiX,
  FiCalendar,
  FiPhone,
  FiBriefcase,
  FiAward,
  FiActivity,
  FiArrowRight,
  FiCamera,
  FiUserCheck,
} from "react-icons/fi";

import { exportAttendanceExcel } from "../../../utils/exportAttendanceExcel";
import { exportAttendancePdf } from "../../../utils/exportAttendancePdf";

interface LabourShift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  graceMinutes: number;
  status: "ACTIVE" | "INACTIVE";
}

interface LabourAttendanceStats {
  totalDays: number;
  greenDays: number;
  yellowDays: number;
  absentDays: number;
  leaveDays: number;
  currentStreak: number;
  bestStreak: number;
  score: number;
}

const getRecordDate = (record: any) => {
  return record?.date || record?.createdAt;
};

const getDayKey = (value: string | Date) => {
  const date = new Date(value);

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const getDayStatus = (record: any) => {
  if (!record) return "ABSENT";

  if (record.dayStatus) {
    return record.dayStatus;
  }

  const status = String(
    record.status || ""
  ).toUpperCase();

  if (status === "LEAVE") {
    return "LEAVE";
  }

  if (
    status === "LATE" ||
    status === "EARLY_LEAVE" ||
    status === "LATE_AND_EARLY"
  ) {
    return "YELLOW";
  }

  if (
    status === "PRESENT" ||
    status === "FULL_DAY"
  ) {
    return "GREEN";
  }

  return "ABSENT";
};

const calculateStreakStats = (
  records: any[]
): LabourAttendanceStats => {
  const recordsByDay = new Map<string, any>();

  records.forEach((record) => {
    const date = getRecordDate(record);

    if (!date) return;

    recordsByDay.set(
      getDayKey(date),
      record
    );
  });

  const sortedRecords = Array.from(
    recordsByDay.entries()
  ).sort(
    ([a], [b]) =>
      new Date(b).getTime() -
      new Date(a).getTime()
  );

  let currentStreak = 0;

  for (const [, record] of sortedRecords) {
    const status = getDayStatus(record);

    if (status === "GREEN") {
      currentStreak++;
    } else if (status === "LEAVE") {
      continue;
    } else {
      break;
    }
  }

  let bestStreak = 0;
  let runningStreak = 0;

  for (const [, record] of sortedRecords) {
    const status = getDayStatus(record);

    if (status === "GREEN") {
      runningStreak++;
      bestStreak = Math.max(
        bestStreak,
        runningStreak
      );
    } else if (status === "LEAVE") {
      continue;
    } else {
      runningStreak = 0;
    }
  }

  const greenDays = sortedRecords.filter(
    ([, record]) =>
      getDayStatus(record) === "GREEN"
  ).length;

  const yellowDays = sortedRecords.filter(
    ([, record]) =>
      getDayStatus(record) === "YELLOW"
  ).length;

  const absentDays = sortedRecords.filter(
    ([, record]) =>
      getDayStatus(record) === "ABSENT"
  ).length;

  const leaveDays = sortedRecords.filter(
    ([, record]) =>
      getDayStatus(record) === "LEAVE"
  ).length;

  const totalDays = sortedRecords.length;

  const score =
    totalDays === 0
      ? 0
      : Math.round(
        ((greenDays + yellowDays * 0.75) /
          totalDays) *
        100
      );

  return {
    totalDays,
    greenDays,
    yellowDays,
    absentDays,
    leaveDays,
    currentStreak,
    bestStreak,
    score,
  };
};

const formatMinutes = (
  minutes?: number
) => {
  if (
    minutes === undefined ||
    minutes === null
  ) {
    return "—";
  }

  const hours = Math.floor(
    minutes / 60
  );

  const remainingMinutes =
    minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

const formatDate = (
  value?: string
) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
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

const formatEventTime = (
  value?: string
) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const getStageLabel = (
  stage?: string
) => {
  switch (stage) {
    case "EXCELLENT":
      return "Excellent";

    case "IMPROVING":
      return "Improving";

    case "REGULAR":
      return "Regular";

    case "WARNING":
      return "Warning";

    case "NEW":
      return "New";

    default:
      return stage || "Unknown";
  }
};

const getStageStyle = (
  stage?: string
) => {
  switch (stage) {
    case "EXCELLENT":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "IMPROVING":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "WARNING":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "REGULAR":
      return "bg-slate-50 text-slate-600 border-slate-200";

    default:
      return "bg-violet-50 text-violet-700 border-violet-200";
  }
};

const HRPage = () => {
  const navigate = useNavigate();

  const [tab, setTab] =
    useState<"EMPLOYEE" | "LABOUR">(
      "EMPLOYEE"
    );

  const [attendance, setAttendance] =
    useState<any[]>([]);

  const [labours, setLabours] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [
    showLabourModal,
    setShowLabourModal,
  ] = useState(false);

  const [
    editingLabour,
    setEditingLabour,
  ] = useState<any>(null);

  const [
    selectedLabour,
    setSelectedLabour,
  ] = useState<any>(null);

  const [
    selectedLabourShift,
    setSelectedLabourShift,
  ] = useState<LabourShift | null>(
    null
  );

  const [
    loadingLabourShift,
    setLoadingLabourShift,
  ] = useState(false);

  const [previewPhoto, setPreviewPhoto] =
    useState("");

  const [
    previewEmployee,
    setPreviewEmployee,
  ] = useState("");

  const [previewDate, setPreviewDate] =
    useState("");

  const loadAttendance = async () => {
    try {
      const data =
        await getAttendance();

      setAttendance(
        Array.isArray(data)
          ? data
          : data?.attendance || []
      );
    } catch (error) {
      console.error(
        "Failed to load attendance:",
        error
      );
    }
  };

  const loadLabours = async () => {
    try {
      const data =
        await getLabours();

      setLabours(
        Array.isArray(data)
          ? data
          : data?.labours || []
      );
    } catch (error) {
      console.error(
        "Failed to load labour:",
        error
      );
    }
  };

  useEffect(() => {
    loadAttendance();
    loadLabours();
  }, []);

  const filteredAttendance = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return attendance.filter(
      (record: any) => {
        const name =
          record.employee?.name ||
          record.labour?.name ||
          "";

        const role =
          record.employee?.role ||
          record.labour?.department ||
          "";

        const employeeId =
          record.employee?.employeeId ||
          "";

        const searchValue =
          `${name} ${role} ${employeeId}`
            .toLowerCase();

        const matchesSearch =
          !query ||
          searchValue.includes(query);

        const matchesStatus =
          statusFilter === "All" ||
          record.status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    attendance,
    search,
    statusFilter,
  ]);

  const filteredLabours = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return labours.filter(
      (labour: any) => {
        const searchValue =
          `${labour.name || ""} ${labour.department || ""
            } ${labour.phone || ""}`
            .toLowerCase();

        return searchValue.includes(
          query
        );
      }
    );
  }, [labours, search]);

  const employeeStats = useMemo(() => {
    const total =
      attendance.length;

    const present =
      attendance.filter(
        (record) => {
          const status =
            String(
              record.status || ""
            ).toUpperCase();

          return [
            "PRESENT",
            "LATE",
            "EARLY_LEAVE",
            "LATE_AND_EARLY",
          ].includes(status);
        }
      ).length;

    const absent =
      attendance.filter(
        (record) =>
          String(
            record.status || ""
          ).toUpperCase() ===
          "ABSENT"
      ).length;

    const leave =
      attendance.filter(
        (record) =>
          String(
            record.status || ""
          ).toUpperCase() ===
          "LEAVE"
      ).length;

    return {
      total,
      present,
      absent,
      leave,
    };
  }, [attendance]);

  const selectedLabourAttendance =
    useMemo(() => {
      if (!selectedLabour?._id) {
        return [];
      }

      return attendance
        .filter((record: any) => {
          const labourId =
            record.labour?._id ||
            record.labour;

          return (
            String(labourId) ===
            String(
              selectedLabour._id
            )
          );
        })
        .sort((a, b) => {
          const aDate =
            getRecordDate(a);

          const bDate =
            getRecordDate(b);

          return (
            new Date(
              bDate || 0
            ).getTime() -
            new Date(
              aDate || 0
            ).getTime()
          );
        });
    }, [
      attendance,
      selectedLabour,
    ]);

  const selectedLabourStats =
    useMemo(() => {
      return calculateStreakStats(
        selectedLabourAttendance
      );
    }, [
      selectedLabourAttendance,
    ]);

  const selectedLabourLatestAttendance =
    selectedLabourAttendance[0];

  const openLabourDetails = async (
    labour: any
  ) => {
    setSelectedLabour(labour);
    setSelectedLabourShift(null);

    if (!labour.attendanceShift) {
      return;
    }

    const shiftId =
      typeof labour.attendanceShift ===
        "object"
        ? labour.attendanceShift?._id
        : labour.attendanceShift;

    if (!shiftId) {
      return;
    }

    try {
      setLoadingLabourShift(true);

      const response =
        await getAttendanceShift(
          shiftId
        );

      const shift =
        response?.shift ||
        response;

      setSelectedLabourShift(
        shift || null
      );
    } catch (error) {
      console.error(
        "Failed to load labour shift:",
        error
      );
    } finally {
      setLoadingLabourShift(false);
    }
  };

  const closeLabourDetails = () => {
    setSelectedLabour(null);
    setSelectedLabourShift(null);
  };

  const handleExcelExport = () => {
    const data =
      tab === "EMPLOYEE"
        ? filteredAttendance
        : filteredLabours;

    exportAttendanceExcel(
      data,
      tab === "EMPLOYEE"
        ? "attendance"
        : "labours"
    );
  };

  const handlePdfExport = () => {
    const data =
      tab === "EMPLOYEE"
        ? filteredAttendance
        : filteredLabours;

    exportAttendancePdf(
      data,
      tab === "EMPLOYEE"
        ? "attendance"
        : "labours"
    );
  };

  const handleDeleteAttendance =
    async (id: string) => {
      const confirmed =
        window.confirm(
          "Delete this attendance record?"
        );

      if (!confirmed) return;

      try {
        await deleteAttendance(id);
        await loadAttendance();
      } catch (error) {
        console.error(
          "Failed to delete attendance:",
          error
        );
      }
    };

  const handleDeleteLabour = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Delete this labour record?"
      );

    if (!confirmed) return;

    try {
      await deleteLabour(id);

      if (
        selectedLabour?._id === id
      ) {
        closeLabourDetails();
      }

      await loadLabours();
      await loadAttendance();
    } catch (error) {
      console.error(
        "Failed to delete labour:",
        error
      );
    }
  };

  const handleViewPhoto = (
    photo: string,
    employeeName: string,
    date?: string
  ) => {
    setPreviewPhoto(photo);
    setPreviewEmployee(
      employeeName
    );
    setPreviewDate(
      date || ""
    );
  };

  const closePhotoPreview = () => {
    setPreviewPhoto("");
    setPreviewEmployee("");
    setPreviewDate("");
  };

  return (
    <HRLayout>
      <div className="mx-auto w-full max-w-[1500px] space-y-6">

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Admin</span>
                <span>/</span>
                <span className="text-slate-600">
                  Attendance
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Attendance Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage employee attendance,
                labour records, shifts,
                working hours and attendance
                performance.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              {tab === "EMPLOYEE" && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/attendance/punch"
                    )
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <FiCamera size={17} />
                  Employee Punch
                </button>
              )}

              {tab === "LABOUR" && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingLabour(null);
                    setShowLabourModal(
                      true
                    );
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#172B6B] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20398F]"
                >
                  <FiPlus size={17} />
                  Add Labour
                </button>
              )}

            </div>
          </div>
        </section>

        {tab === "EMPLOYEE" && (
          <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">

            <StatCard
              label="Total Records"
              value={employeeStats.total}
              icon={<FiCalendar size={19} />}
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              label="Present"
              value={employeeStats.present}
              icon={<FiCheckCircle size={19} />}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              label="Absent"
              value={employeeStats.absent}
              icon={<FiAlertCircle size={19} />}
              iconClass="bg-red-50 text-red-600"
            />

            <StatCard
              label="On Leave"
              value={employeeStats.leave}
              icon={<FiClock size={19} />}
              iconClass="bg-amber-50 text-amber-600"
            />

          </section>
        )}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="inline-flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 sm:w-auto">

                <TabButton
                  active={
                    tab === "EMPLOYEE"
                  }
                  onClick={() => {
                    setTab("EMPLOYEE");
                    setSearch("");
                    setStatusFilter(
                      "All"
                    );
                    closeLabourDetails();
                  }}
                >
                  <FiUserCheck size={16} />
                  Employee
                </TabButton>

                <TabButton
                  active={
                    tab === "LABOUR"
                  }
                  onClick={() => {
                    setTab("LABOUR");
                    setSearch("");
                    setStatusFilter(
                      "All"
                    );
                  }}
                >
                  <FiUsers size={16} />
                  Labour
                </TabButton>

              </div>

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/admin/tasks"
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <FiClipboard size={16} />
                  Tasks
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/admin/hr/shifts"
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <FiClock size={16} />
                  Shifts
                </button>

              </div>
            </div>
          </div>

          {tab === "EMPLOYEE" && (
            <>
              <div className="border-b border-slate-200 p-4 sm:p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

                  <div className="relative w-full sm:w-[320px]">
                    <FiSearch
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search employee or role..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#172B6B] focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">

                    <div className="relative">
                      <select
                        value={
                          statusFilter
                        }
                        onChange={(e) =>
                          setStatusFilter(
                            e.target.value
                          )
                        }
                        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-[#172B6B] sm:w-44"
                      >
                        <option value="All">
                          All Status
                        </option>

                        <option value="PRESENT">
                          Present
                        </option>

                        <option value="LATE">
                          Late
                        </option>

                        <option value="EARLY_LEAVE">
                          Early Leave
                        </option>

                        <option value="LATE_AND_EARLY">
                          Late + Early
                        </option>

                        <option value="ABSENT">
                          Absent
                        </option>

                        <option value="LEAVE">
                          Leave
                        </option>
                      </select>

                      <FiChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleExcelExport
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      <FiDownload size={16} />
                      Excel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handlePdfExport
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#172B6B] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20398F]"
                    >
                      <FiFileText size={16} />
                      PDF
                    </button>

                  </div>
                </div>
              </div>

              <div className="border-b border-slate-200 p-4 sm:p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <FiCalendar size={18} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Attendance Calendar
                      </h2>

                      <p className="text-xs text-slate-400">
                        Daily attendance,
                        streaks and status
                      </p>
                    </div>
                  </div>
                </div>

                <AttendanceStreakCalendar
                  records={attendance}
                />
              </div>

              <div className="overflow-x-auto">
                <EmployeeAttendanceTable
                  records={
                    filteredAttendance
                  }
                  onEdit={() => {
                    return;
                  }}
                  onDelete={(record) => {
                    handleDeleteAttendance(
                      record._id
                    );
                  }}
                  onViewPhoto={
                    handleViewPhoto
                  }
                />
              </div>
            </>
          )}

          {tab === "LABOUR" && (
            <>
              <div className="border-b border-slate-200 p-4 sm:p-5">
                <LabourProxyPunch
                  labours={labours}
                  attendance={attendance}
                  onSuccess={async () => {
                    await loadAttendance();
                    await loadLabours();
                  }}
                />
              </div>
              <div className="border-b border-slate-200 p-4 sm:p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

                  <div className="relative w-full sm:w-[360px]">
                    <FiSearch
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search labour, department or phone..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#172B6B] focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">

                    <button
                      type="button"
                      onClick={
                        handleExcelExport
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      <FiDownload size={16} />
                      Excel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handlePdfExport
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#172B6B] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20398F]"
                    >
                      <FiFileText size={16} />
                      PDF
                    </button>

                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70">

                      <TableHead>
                        Name
                      </TableHead>

                      <TableHead>
                        Department
                      </TableHead>

                      <TableHead align="center">
                        Wage
                      </TableHead>

                      <TableHead align="center">
                        Shift
                      </TableHead>

                      <TableHead align="center">
                        Phone
                      </TableHead>

                      <TableHead align="center">
                        Status
                      </TableHead>

                      <TableHead align="center">
                        Actions
                      </TableHead>

                    </tr>
                  </thead>

                  <tbody>
                    {filteredLabours.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-20 text-center"
                        >
                          <div className="flex flex-col items-center">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                              <FiUsers size={20} />
                            </div>

                            <p className="mt-4 text-sm font-semibold text-slate-800">
                              No labour records found
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Add a labour or change your search.
                            </p>

                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredLabours.map(
                        (labour: any) => {

                          const wageType =
                            labour.wageType ||
                            "DAILY";

                          const wageAmount =
                            labour.wageAmount ??
                            labour.dailyWage ??
                            0;

                          const shiftName =
                            typeof labour.attendanceShift ===
                              "object"
                              ? labour
                                .attendanceShift
                                ?.name
                              : null;

                          return (
                            <tr
                              key={
                                labour._id
                              }
                              onClick={() =>
                                openLabourDetails(
                                  labour
                                )
                              }
                              className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/30"
                            >

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">

                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                                    {(
                                      labour.name ||
                                      "-"
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                      {labour.name ||
                                        "-"}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                      View profile
                                    </p>
                                  </div>

                                </div>
                              </td>

                              <td className="px-6 py-4 text-sm text-slate-600">
                                {labour.department ||
                                  "-"}
                              </td>

                              <td className="px-6 py-4 text-center">
                                <div className="text-sm font-semibold text-slate-700">
                                  ₹
                                  {Number(
                                    wageAmount
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </div>

                                <div className="mt-0.5 text-[11px] uppercase text-slate-400">
                                  {wageType}
                                </div>
                              </td>

                              <td className="px-6 py-4 text-center">
                                {shiftName ? (
                                  <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                    {shiftName}
                                  </span>
                                ) : (
                                  <span className="text-sm text-slate-400">
                                    Not assigned
                                  </span>
                                )}
                              </td>

                              <td className="px-6 py-4 text-center text-sm text-slate-600">
                                {labour.phone ||
                                  "-"}
                              </td>

                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${labour.status ===
                                    "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                    }`}
                                >
                                  {labour.status ||
                                    "-"}
                                </span>
                              </td>

                              <td
                                className="px-6 py-4"
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                              >
                                <div className="flex justify-center gap-1">

                                  <IconButton
                                    label="Edit labour"
                                    onClick={() => {
                                      setEditingLabour(
                                        labour
                                      );
                                      setShowLabourModal(
                                        true
                                      );
                                    }}
                                  >
                                    <FiEdit2
                                      size={16}
                                    />
                                  </IconButton>

                                  <IconButton
                                    label="Delete labour"
                                    danger
                                    onClick={() =>
                                      handleDeleteLabour(
                                        labour._id
                                      )
                                    }
                                  >
                                    <FiTrash2
                                      size={16}
                                    />
                                  </IconButton>

                                  <IconButton
                                    label="View labour details"
                                    onClick={() =>
                                      openLabourDetails(
                                        labour
                                      )
                                    }
                                  >
                                    <FiArrowRight
                                      size={16}
                                    />
                                  </IconButton>

                                </div>
                              </td>

                            </tr>
                          );
                        }
                      )
                    )}
                  </tbody>

                </table>
              </div>
            </>
          )}

        </section>

        <LabourModal
          open={
            showLabourModal
          }
          labour={
            editingLabour
          }
          onClose={() => {
            setShowLabourModal(false);
            setEditingLabour(null);
          }}
          onSuccess={async () => {
            await loadLabours();

            setShowLabourModal(false);
            setEditingLabour(null);
          }}
        />

        <AttendancePhotoPreview
          open={Boolean(
            previewPhoto
          )}
          photo={previewPhoto}
          employeeName={
            previewEmployee
          }
          date={previewDate}
          onClose={
            closePhotoPreview
          }
        />

        {selectedLabour && (
          <LabourDetailsDrawer
            labour={selectedLabour}
            attendance={
              selectedLabourAttendance
            }
            stats={
              selectedLabourStats
            }
            shift={
              selectedLabourShift
            }
            loadingShift={
              loadingLabourShift
            }
            latestAttendance={
              selectedLabourLatestAttendance
            }
            onClose={
              closeLabourDetails
            }
            onEdit={() => {
              setEditingLabour(
                selectedLabour
              );
              setShowLabourModal(
                true
              );
            }}
          />
        )}

      </div>
    </HRLayout>
  );
};

const LabourDetailsDrawer = ({
  labour,
  attendance,
  stats,
  shift,
  loadingShift,
  latestAttendance,
  onClose,
  onEdit,
}: {
  labour: any;
  attendance: any[];
  stats: LabourAttendanceStats;
  shift: LabourShift | null;
  loadingShift: boolean;
  latestAttendance: any;
  onClose: () => void;
  onEdit: () => void;
}) => {
  const wageType =
    labour.wageType || "DAILY";

  const wageAmount =
    labour.wageAmount ??
    labour.dailyWage ??
    0;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-slate-900/40 backdrop-blur-[2px]">

      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              Labour Profile
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {labour.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {labour.department ||
                "No department"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX size={19} />
          </button>

        </div>

        <div className="flex-1 overflow-y-auto p-6">

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            <DetailStat
              label="Streak"
              value={`${stats.currentStreak} days`}
              icon={<FiActivity size={16} />}
            />

            <DetailStat
              label="Best"
              value={`${stats.bestStreak} days`}
              icon={<FiAward size={16} />}
            />

            <DetailStat
              label="Score"
              value={`${stats.score}%`}
              icon={<FiCheckCircle size={16} />}
            />

            <DetailStat
              label="Records"
              value={String(
                stats.totalDays
              )}
              icon={<FiCalendar size={16} />}
            />

          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 p-5">

            <div className="flex items-center justify-between">

              <div>
                <h3 className="font-bold text-slate-900">
                  Labour Information
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Current management details
                </p>
              </div>

              <button
                type="button"
                onClick={onEdit}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Edit
              </button>

            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <InfoItem
                icon={<FiBriefcase size={15} />}
                label="Department"
                value={
                  labour.department ||
                  "—"
                }
              />

              <InfoItem
                icon={<FiPhone size={15} />}
                label="Phone"
                value={
                  labour.phone ||
                  "—"
                }
              />

              <InfoItem
                icon={<FiActivity size={15} />}
                label="Wage Type"
                value={wageType}
              />

              <InfoItem
                icon={<FiAward size={15} />}
                label="Wage Amount"
                value={`₹${Number(
                  wageAmount
                ).toLocaleString(
                  "en-IN"
                )}`}
              />

            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <FiClock size={18} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Assigned Shift
                </h3>

                <p className="text-xs text-slate-400">
                  Individual working schedule
                </p>
              </div>

            </div>

            {loadingShift ? (
              <div className="mt-5 text-sm text-slate-400">
                Loading shift...
              </div>
            ) : shift ? (
              <div className="mt-5">

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

                  <div>
                    <p className="font-semibold text-slate-900">
                      {shift.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {shift.startTime}
                      {" — "}
                      {shift.endTime}
                    </p>
                  </div>

                  <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                    {formatMinutes(
                      shift.durationMinutes
                    )}
                  </span>

                </div>

                <div className="mt-3 flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Grace period
                  </span>

                  <span className="font-semibold text-slate-800">
                    {shift.graceMinutes} min
                  </span>

                </div>

              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-400">
                No attendance shift assigned.
              </div>
            )}

          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <FiAward size={18} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Attendance Performance
                </h3>

                <p className="text-xs text-slate-400">
                  Stage, score and progression
                </p>
              </div>

            </div>

            {latestAttendance ? (
              <>
                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Current Score
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {latestAttendance.score ??
                        stats.score}
                      %
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Current Stage
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getStageStyle(
                        latestAttendance.stage
                      )}`}
                    >
                      {getStageLabel(
                        latestAttendance.stage
                      )}
                    </span>
                  </div>

                </div>

                {Array.isArray(
                  latestAttendance.stageHistory
                ) &&
                  latestAttendance
                    .stageHistory.length >
                  0 && (
                    <div className="mt-5">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Stage History
                      </p>

                      <div className="mt-3 space-y-3">

                        {[
                          ...latestAttendance.stageHistory,
                        ]
                          .reverse()
                          .map(
                            (
                              history: any,
                              index: number
                            ) => (
                              <div
                                key={
                                  history._id ||
                                  index
                                }
                                className="flex gap-3 rounded-xl border border-slate-100 p-3"
                              >

                                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" />

                                <div className="min-w-0 flex-1">

                                  <div className="flex flex-wrap items-center justify-between gap-2">

                                    <span
                                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStageStyle(
                                        history.stage
                                      )}`}
                                    >
                                      {getStageLabel(
                                        history.stage
                                      )}
                                    </span>

                                    <span className="text-[11px] text-slate-400">
                                      {formatDate(
                                        history.changedAt
                                      )}
                                    </span>

                                  </div>

                                  {history.note && (
                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                      {history.note}
                                    </p>
                                  )}

                                </div>

                              </div>
                            )
                          )}

                      </div>
                    </div>
                  )}
              </>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-400">
                No attendance performance data yet.
              </div>
            )}

          </section>

          <section className="mt-4">

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              <MiniStatus
                label="Full Days"
                value={stats.greenDays}
                className="bg-emerald-50 text-emerald-700"
              />

              <MiniStatus
                label="Late / Early"
                value={stats.yellowDays}
                className="bg-amber-50 text-amber-700"
              />

              <MiniStatus
                label="Absent"
                value={stats.absentDays}
                className="bg-red-50 text-red-700"
              />

              <MiniStatus
                label="Leave"
                value={stats.leaveDays}
                className="bg-slate-100 text-slate-600"
              />

            </div>

          </section>

          {latestAttendance && (
            <section className="mt-4 rounded-2xl border border-slate-200 p-5">

              <h3 className="font-bold text-slate-900">
                Latest Attendance
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                {formatDate(
                  getRecordDate(
                    latestAttendance
                  )
                )}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">

                <InfoBox
                  label="Status"
                  value={
                    latestAttendance.status ||
                    "—"
                  }
                />

                <InfoBox
                  label="Day"
                  value={
                    latestAttendance.dayStatus ||
                    getDayStatus(
                      latestAttendance
                    )
                  }
                />

                <InfoBox
                  label="Working"
                  value={formatMinutes(
                    latestAttendance.actualWorkingMinutes
                  )}
                />

                <InfoBox
                  label="Break"
                  value={formatMinutes(
                    latestAttendance.breakMinutes
                  )}
                />

                <InfoBox
                  label="Required"
                  value={formatMinutes(
                    latestAttendance.requiredWorkingMinutes
                  )}
                />

                <InfoBox
                  label="Difference"
                  value={formatMinutes(
                    latestAttendance.differenceMinutes
                  )}
                />

              </div>

            </section>
          )}

          <section className="mt-4 rounded-2xl border border-slate-200 p-5">

            <div className="flex items-center justify-between">

              <div>
                <h3 className="font-bold text-slate-900">
                  Attendance History
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Recent recorded days
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-400">
                {attendance.length} records
              </span>

            </div>

            <div className="mt-4 space-y-3">

              {attendance.length ===
                0 ? (
                <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                  No attendance records found.
                </div>
              ) : (
                attendance
                  .slice(0, 10)
                  .map(
                    (
                      record: any,
                      index: number
                    ) => {
                      const dayStatus =
                        getDayStatus(
                          record
                        );

                      return (
                        <div
                          key={
                            record._id ||
                            index
                          }
                          className="rounded-xl border border-slate-100 p-4"
                        >

                          <div className="flex items-center justify-between gap-3">

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {formatDate(
                                  getRecordDate(
                                    record
                                  )
                                )}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {record.status ||
                                  "—"}
                              </p>
                            </div>

                            <DayStatusBadge
                              status={
                                dayStatus
                              }
                            />

                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">

                            <SmallValue
                              label="Working"
                              value={formatMinutes(
                                record.actualWorkingMinutes
                              )}
                            />

                            <SmallValue
                              label="Break"
                              value={formatMinutes(
                                record.breakMinutes
                              )}
                            />

                            <SmallValue
                              label="Difference"
                              value={formatMinutes(
                                record.differenceMinutes
                              )}
                            />

                          </div>

                          {record.events?.length >
                            0 && (
                              <div className="mt-3 flex flex-wrap gap-2">

                                {record.events.map(
                                  (
                                    event: any,
                                    eventIndex: number
                                  ) => (
                                    <span
                                      key={
                                        event._id ||
                                        eventIndex
                                      }
                                      className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500"
                                    >
                                      {String(
                                        event.type
                                      ).replace(
                                        "_",
                                        " "
                                      )}{" "}
                                      ·{" "}
                                      {formatEventTime(
                                        event.at
                                      )}
                                    </span>
                                  )
                                )}

                              </div>
                            )}

                        </div>
                      );
                    }
                  )
              )}

            </div>

          </section>

        </div>
      </div>
    </div>
  );
};

const DetailStat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[11px] uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>

      </div>

    </div>
  );
};

const InfoBox = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3">

      <p className="text-[11px] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
};

const SmallValue = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5">

      <p className="text-[10px] text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 text-xs font-bold text-slate-700">
        {value}
      </p>

    </div>
  );
};

const MiniStatus = ({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) => {
  return (
    <div
      className={`rounded-2xl p-4 ${className}`}
    >

      <p className="text-xs font-medium">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
};

const DayStatusBadge = ({
  status,
}: {
  status: string;
}) => {
  const normalized =
    String(status).toUpperCase();

  const config =
    normalized === "GREEN"
      ? {
        label: "Full Day",
        className:
          "bg-emerald-50 text-emerald-700",
      }
      : normalized === "YELLOW"
        ? {
          label: "Late / Early",
          className:
            "bg-amber-50 text-amber-700",
        }
        : normalized === "LEAVE"
          ? {
            label: "Leave",
            className:
              "bg-slate-100 text-slate-600",
          }
          : {
            label: "Absent",
            className:
              "bg-red-50 text-red-700",
          };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
};

const StatCard = ({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  iconClass: string;
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
};

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition ${active
        ? "bg-white text-[#172B6B] shadow-sm"
        : "text-slate-500 hover:text-slate-800"
        }`}
    >
      {children}
    </button>
  );
};

const TableHead = ({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "center";
}) => {
  return (
    <th
      className={`px-6 py-4 text-${align} text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400`}
    >
      {children}
    </th>
  );
};

const IconButton = ({
  children,
  onClick,
  label,
  danger = false,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${danger
        ? "text-red-500 hover:bg-red-50 hover:text-red-600"
        : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
        }`}
    >
      {children}
    </button>
  );
};

export default HRPage;