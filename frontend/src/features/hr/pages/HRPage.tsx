import { useEffect, useMemo, useState } from "react";

import api from "../../../services/api/axios";

import HRLayout from "../layouts/HRLayout";

import UserChecklistWorkspace from "../components/UserChecklistWorkspace";

import AttendanceModal from "../../attendance/components/AttendanceModal";
import LabourModal from "../../labour/components/LabourModal";

import {
  getAttendance,
  deleteAttendance,
} from "../../attendance/services/attendance.service";

import {
  getLabours,
  deleteLabour,
} from "../../labour/services/labour.service";

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiFileText,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiClipboard,
} from "react-icons/fi";

import { exportAttendanceExcel } from "../../../utils/exportAttendanceExcel";
import { exportAttendancePdf } from "../../../utils/exportAttendancePdf";

type MainTab =
  | "EMPLOYEE"
  | "LABOUR"
  | "TASKS";

interface User {
  _id: string;
  name: string;
  role: string;
  employeeId?: string;
}

const HRPage = () => {
  /* =========================================================
     TAB
  ========================================================= */

  const [activeTab, setActiveTab] =
    useState<MainTab>("EMPLOYEE");

  /* =========================================================
     DATA
  ========================================================= */

  const [attendance, setAttendance] =
    useState<any[]>([]);

  const [labours, setLabours] =
    useState<any[]>([]);

  const [users, setUsers] =
    useState<User[]>([]);

  /* =========================================================
     SEARCH / FILTER
  ========================================================= */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  /* =========================================================
     ATTENDANCE MODAL
  ========================================================= */

  const [
    showAttendanceModal,
    setShowAttendanceModal,
  ] = useState(false);

  const [
    editingAttendance,
    setEditingAttendance,
  ] = useState<any>(null);

  /* =========================================================
     LABOUR MODAL
  ========================================================= */

  const [
    showLabourModal,
    setShowLabourModal,
  ] = useState(false);

  const [
    editingLabour,
    setEditingLabour,
  ] = useState<any>(null);

  /* =========================================================
     LOAD ATTENDANCE
  ========================================================= */

  const loadAttendance = async () => {
    try {
      const data = await getAttendance();

      setAttendance(data);
    } catch (error) {
      console.error(
        "Failed to load attendance:",
        error
      );
    }
  };

  /* =========================================================
     LOAD LABOUR
  ========================================================= */

  const loadLabours = async () => {
    try {
      const data = await getLabours();

      setLabours(data);
    } catch (error) {
      console.error(
        "Failed to load labour:",
        error
      );
    }
  };

  /* =========================================================
     LOAD USERS
  ========================================================= */

  const loadUsers = async () => {
    try {
      const { data } =
        await api.get(
          "/users/attendance-users"
        );

      setUsers(data);
    } catch (error) {
      console.error(
        "Failed to load users:",
        error
      );
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadAttendance();
    loadLabours();
    loadUsers();
  }, []);

  /* =========================================================
     EMPLOYEE ATTENDANCE
  ========================================================= */

  const employeeAttendance =
    useMemo(() => {
      return attendance.filter(
        (record: any) =>
          record.attendanceType ===
            "EMPLOYEE" ||
          !!record.employee
      );
    }, [attendance]);

  /* =========================================================
     FILTER EMPLOYEE ATTENDANCE
  ========================================================= */

  const filteredAttendance =
    useMemo(() => {
      return employeeAttendance.filter(
        (record: any) => {
          const employeeName =
            record.employee?.name ||
            "";

          const role =
            record.employee?.role ||
            "";

          const employeeId =
            record.employee?.employeeId ||
            "";

          const searchableText =
            `
              ${employeeName}
              ${role}
              ${employeeId}
            `.toLowerCase();

          const matchesSearch =
            searchableText.includes(
              search.toLowerCase()
            );

          const matchesStatus =
            statusFilter === "All" ||
            record.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      employeeAttendance,
      search,
      statusFilter,
    ]);

  /* =========================================================
     FILTER LABOUR
  ========================================================= */

  const filteredLabours =
    useMemo(() => {
      return labours.filter(
        (labour: any) => {
          const searchableText = `
            ${labour.name || ""}
            ${labour.department || ""}
            ${labour.phone || ""}
          `.toLowerCase();

          return searchableText.includes(
            search.toLowerCase()
          );
        }
      );
    }, [labours, search]);

  /* =========================================================
     EMPLOYEE STATS
  ========================================================= */

  const employeeStats =
    useMemo(() => {
      const present =
        employeeAttendance.filter(
          (record: any) =>
            record.status ===
            "Present"
        ).length;

      const absent =
        employeeAttendance.filter(
          (record: any) =>
            record.status ===
            "Absent"
        ).length;

      const leave =
        employeeAttendance.filter(
          (record: any) =>
            record.status ===
            "Leave"
        ).length;

      const halfDay =
        employeeAttendance.filter(
          (record: any) =>
            record.status ===
            "Half Day"
        ).length;

      return {
        total: employeeAttendance.length,
        present,
        absent,
        leave,
        halfDay,
      };
    }, [employeeAttendance]);

  /* =========================================================
     TAB CHANGE
  ========================================================= */

  const handleTabChange = (
    tab: MainTab
  ) => {
    setActiveTab(tab);

    setSearch("");

    setStatusFilter("All");
  };

  /* =========================================================
     DELETE ATTENDANCE
  ========================================================= */

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

  /* =========================================================
     DELETE LABOUR
  ========================================================= */

  const handleDeleteLabour =
    async (id: string) => {
      const confirmed =
        window.confirm(
          "Delete this labour record?"
        );

      if (!confirmed) return;

      try {
        await deleteLabour(id);

        await loadLabours();
      } catch (error) {
        console.error(
          "Failed to delete labour:",
          error
        );
      }
    };

  /* =========================================================
     EXPORT EXCEL
  ========================================================= */

const handleExcelExport = () => {
  if (activeTab === "EMPLOYEE") {
    exportAttendanceExcel(
      filteredAttendance,
      "Employee_Attendance_Report"
    );

    return;
  }

  if (activeTab === "LABOUR") {
    exportAttendanceExcel(
      filteredLabours,
      "Labour_Attendance_Report"
    );
  }
};

const handlePdfExport = () => {
  if (activeTab === "EMPLOYEE") {
    exportAttendancePdf(
      filteredAttendance,
      "Employee Attendance Report"
    );

    return;
  }

  if (activeTab === "LABOUR") {
    exportAttendancePdf(
      filteredLabours,
      "Labour Attendance Report"
    );
  }
};

  return (
    <HRLayout>
      <div className="min-h-full bg-slate-50">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

          {/* =====================================================
              HERO HEADER
          ===================================================== */}

          <section className="relative mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-50 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-24 w-56 rounded-full bg-indigo-50 blur-3xl" />

            <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  <span>HR & Operations</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-[#172B6B]">
                    Workforce Management
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  HR & Attendance
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Monitor workforce attendance, labour records and
                  employee performance from one operational workspace.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">

                {activeTab === "EMPLOYEE" && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAttendance(null);
                      setShowAttendanceModal(true);
                    }}
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
                      shadow-[0_8px_24px_rgba(23,43,107,0.18)]
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:bg-[#20398F]
                      hover:shadow-[0_12px_28px_rgba(23,43,107,0.24)]
                      active:translate-y-0
                    "
                  >
                    <FiPlus size={17} strokeWidth={2.5} />
                    Add Attendance
                  </button>
                )}

                {activeTab === "LABOUR" && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLabour(null);
                      setShowLabourModal(true);
                    }}
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
                      shadow-[0_8px_24px_rgba(23,43,107,0.18)]
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:bg-[#20398F]
                      hover:shadow-[0_12px_28px_rgba(23,43,107,0.24)]
                      active:translate-y-0
                    "
                  >
                    <FiPlus size={17} strokeWidth={2.5} />
                    Add Labour
                  </button>
                )}

              </div>
            </div>
          </section>

          {/* =====================================================
              KPI OVERVIEW
          ===================================================== */}

          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">

            {/* Total */}

            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 transition-transform duration-300 group-hover:scale-125" />

              <div className="relative flex items-start justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Employee Records
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    {employeeStats.total}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Attendance entries
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiUsers size={19} />
                </div>

              </div>
            </div>

            {/* Present */}

            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-50 transition-transform duration-300 group-hover:scale-125" />

              <div className="relative flex items-start justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Present
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                    {employeeStats.present}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Employees present
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FiCheckCircle size={19} />
                </div>

              </div>
            </div>

            {/* Absent */}

            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-50 transition-transform duration-300 group-hover:scale-125" />

              <div className="relative flex items-start justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Absent
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-red-600">
                    {employeeStats.absent}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Attendance exceptions
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <FiAlertCircle size={19} />
                </div>

              </div>
            </div>

            {/* Leave */}

            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-50 transition-transform duration-300 group-hover:scale-125" />

              <div className="relative flex items-start justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Leave / Half Day
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-amber-600">
                    {employeeStats.leave + employeeStats.halfDay}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Partial availability
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <FiClock size={19} />
                </div>

              </div>
            </div>

          </section>

          {/* =====================================================
              MAIN WORKSPACE
          ===================================================== */}

          <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">

            {/* ===================================================
                NAVIGATION
            =================================================== */}

            <div className="border-b border-slate-200 bg-white px-4 pt-4 sm:px-6">

              <div className="flex gap-1 overflow-x-auto">

                <button
                  type="button"
                  onClick={() => handleTabChange("EMPLOYEE")}
                  className={`
                    relative shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition-all
                    ${
                      activeTab === "EMPLOYEE"
                        ? "bg-[#172B6B] text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  Employee Attendance
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("LABOUR")}
                  className={`
                    relative shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition-all
                    ${
                      activeTab === "LABOUR"
                        ? "bg-[#172B6B] text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  Labour Attendance
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("TASKS")}
                  className={`
                    inline-flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-xl
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    transition-all
                    ${
                      activeTab === "TASKS"
                        ? "bg-[#172B6B] text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <FiClipboard size={16} />
                  Tasks & Checklists
                </button>

              </div>
            </div>

            {/* ===================================================
                EMPLOYEE TOOLBAR
            =================================================== */}

            {activeTab === "EMPLOYEE" && (
              <div className="border-b border-slate-200 bg-slate-50/50 p-4 sm:p-5">

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

                  <div className="flex flex-col gap-3 sm:flex-row">

                    <div className="relative">

                      <FiUsers
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={search}
                        onChange={(e) =>
                          setSearch(e.target.value)
                        }
                        placeholder="Search employee, role or ID..."
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          pl-10
                          pr-4
                          text-sm
                          text-slate-800
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-[#172B6B]
                          focus:ring-4
                          focus:ring-blue-50
                          sm:w-[320px]
                        "
                      />

                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value)
                      }
                      className="
                        h-11
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-sm
                        font-medium
                        text-slate-700
                        outline-none
                        transition
                        focus:border-[#172B6B]
                        focus:ring-4
                        focus:ring-blue-50
                      "
                    >
                      <option value="All">All Status</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Half Day">Half Day</option>
                      <option value="Leave">Leave</option>
                    </select>

                  </div>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={handleExcelExport}
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
                        shadow-sm
                        transition
                        hover:border-slate-300
                        hover:bg-slate-50
                      "
                    >
                      <FiDownload size={16} />
                      Excel
                    </button>

                    <button
                      type="button"
                      onClick={handlePdfExport}
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
                        shadow-sm
                        transition
                        hover:border-slate-300
                        hover:bg-slate-50
                      "
                    >
                      <FiFileText size={16} />
                      PDF
                    </button>

                  </div>

                </div>
              </div>
            )}

            {/* ===================================================
                LABOUR TOOLBAR
            =================================================== */}

            {activeTab === "LABOUR" && (
              <div className="border-b border-slate-200 bg-slate-50/50 p-4 sm:p-5">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div className="relative">

                    <FiUsers
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Search labour, department or phone..."
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        pl-10
                        pr-4
                        text-sm
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-[#172B6B]
                        focus:ring-4
                        focus:ring-blue-50
                        sm:w-[360px]
                      "
                    />

                  </div>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={handleExcelExport}
                      className="
                        inline-flex
                        h-11
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-sm
                        font-semibold
                        text-slate-700
                        shadow-sm
                        transition
                        hover:bg-slate-50
                      "
                    >
                      <FiDownload size={16} />
                      Excel
                    </button>

                    <button
                      type="button"
                      onClick={handlePdfExport}
                      className="
                        inline-flex
                        h-11
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-sm
                        font-semibold
                        text-slate-700
                        shadow-sm
                        transition
                        hover:bg-slate-50
                      "
                    >
                      <FiFileText size={16} />
                      PDF
                    </button>

                  </div>

                </div>
              </div>
            )}

            {/* ===================================================
                EMPLOYEE TABLE
            =================================================== */}

            {activeTab === "EMPLOYEE" && (
              <div className="relative">

                <div className="max-h-[620px] overflow-auto">

                  <table className="min-w-[1200px] w-full">

                    <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">

                      <tr className="border-b border-slate-200">

                        {[
                          "Employee",
                          "Role",
                          "Date",
                          "Check In",
                          "Check Out",
                          "Tasks",
                          "Completed",
                          "Score",
                          "Status",
                          "Actions",
                        ].map((heading, index) => (
                          <th
                            key={heading}
                            className={`
                              whitespace-nowrap
                              px-6
                              py-4
                              text-xs
                              font-semibold
                              uppercase
                              tracking-[0.1em]
                              text-slate-400
                              ${
                                index >= 2
                                  ? "text-center"
                                  : "text-left"
                              }
                            `}
                          >
                            {heading}
                          </th>
                        ))}

                      </tr>

                    </thead>

                    <tbody>

                      {filteredAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-20 text-center">

                            <div className="mx-auto flex max-w-sm flex-col items-center">

                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <FiUsers size={24} />
                              </div>

                              <h3 className="mt-4 text-base font-bold text-slate-800">
                                No attendance records
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                Try changing your search or status filter.
                              </p>

                            </div>

                          </td>
                        </tr>
                      ) : (
                        filteredAttendance.map((record: any) => {

                          const score =
                            Number(record.score) || 0;

                          return (
                            <tr
                              key={record._id}
                              className="
                                border-b
                                border-slate-100
                                transition-colors
                                hover:bg-slate-50/70
                              "
                            >

                              <td className="px-6 py-4">

                                <div className="flex items-center gap-3">

                                  <div className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#172B6B]/10
                                    text-sm
                                    font-bold
                                    text-[#172B6B]
                                  ">
                                    {(
                                      record.employee?.name || "-"
                                    )
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>

                                  <div className="min-w-0">

                                    <p className="truncate font-semibold text-slate-800">
                                      {record.employee?.name || "-"}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                      {record.employee?.employeeId || "-"}
                                    </p>

                                  </div>

                                </div>

                              </td>

                              <td className="px-6 py-4 text-sm text-slate-600">
                                {record.employee?.role || "-"}
                              </td>

                              <td className="px-6 py-4 text-center text-sm text-slate-600">
                                {record.date
                                  ? new Date(record.date).toLocaleDateString("en-IN")
                                  : "-"}
                              </td>

                              <td className="px-6 py-4 text-center text-sm font-medium text-slate-700">
                                {record.checkIn || "-"}
                              </td>

                              <td className="px-6 py-4 text-center text-sm font-medium text-slate-700">
                                {record.checkOut || "-"}
                              </td>

                              <td className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                                {record.tasksAssigned ?? 0}
                              </td>

                              <td className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                                {record.tasksCompleted ?? 0}
                              </td>

                              <td className="px-6 py-4 text-center">

                                <span
                                  className={`
                                    inline-flex
                                    min-w-[58px]
                                    justify-center
                                    rounded-full
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-bold
                                    ${
                                      score >= 90
                                        ? "bg-emerald-50 text-emerald-700"
                                        : score >= 70
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-red-50 text-red-700"
                                    }
                                  `}
                                >
                                  {score}%
                                </span>

                              </td>

                              <td className="px-6 py-4 text-center">

                                <span
                                  className={`
                                    inline-flex
                                    rounded-full
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    ${
                                      record.status === "Present"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : record.status === "Half Day"
                                        ? "bg-amber-50 text-amber-700"
                                        : record.status === "Leave"
                                        ? "bg-blue-50 text-blue-700"
                                        : "bg-red-50 text-red-700"
                                    }
                                  `}
                                >
                                  {record.status || "-"}
                                </span>

                              </td>

                              <td className="px-6 py-4">

                                <div className="flex justify-center gap-1">

                                  <button
                                    type="button"
                                    title="Edit attendance"
                                    onClick={() => {
                                      setEditingAttendance(record);
                                      setShowAttendanceModal(true);
                                    }}
                                    className="
                                      rounded-lg
                                      p-2
                                      text-slate-500
                                      transition
                                      hover:bg-blue-50
                                      hover:text-blue-600
                                    "
                                  >
                                    <FiEdit2 size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Delete attendance"
                                    onClick={() =>
                                      handleDeleteAttendance(record._id)
                                    }
                                    className="
                                      rounded-lg
                                      p-2
                                      text-slate-500
                                      transition
                                      hover:bg-red-50
                                      hover:text-red-600
                                    "
                                  >
                                    <FiTrash2 size={16} />
                                  </button>

                                </div>

                              </td>

                            </tr>
                          );
                        })
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

            {/* ===================================================
                LABOUR TABLE
            =================================================== */}

            {activeTab === "LABOUR" && (
              <div className="relative">

                <div className="max-h-[620px] overflow-auto">

                  <table className="min-w-[900px] w-full">

                    <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">

                      <tr className="border-b border-slate-200">

                        {[
                          "Labour",
                          "Department",
                          "Daily Wage",
                          "Phone",
                          "Status",
                          "Actions",
                        ].map((heading, index) => (
                          <th
                            key={heading}
                            className={`
                              whitespace-nowrap
                              px-6
                              py-4
                              text-xs
                              font-semibold
                              uppercase
                              tracking-[0.1em]
                              text-slate-400
                              ${
                                index >= 2
                                  ? "text-center"
                                  : "text-left"
                              }
                            `}
                          >
                            {heading}
                          </th>
                        ))}

                      </tr>

                    </thead>

                    <tbody>

                      {filteredLabours.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-20 text-center">

                            <div className="mx-auto flex max-w-sm flex-col items-center">

                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <FiUsers size={24} />
                              </div>

                              <h3 className="mt-4 text-base font-bold text-slate-800">
                                No labour records
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                Try changing your search.
                              </p>

                            </div>

                          </td>
                        </tr>
                      ) : (
                        filteredLabours.map((labour: any) => (
                          <tr
                            key={labour._id}
                            className="
                              border-b
                              border-slate-100
                              transition-colors
                              hover:bg-slate-50/70
                            "
                          >

                            <td className="px-6 py-4">

                              <div className="flex items-center gap-3">

                                <div className="
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-[#172B6B]/10
                                  text-sm
                                  font-bold
                                  text-[#172B6B]
                                ">
                                  {(labour.name || "-")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <span className="font-semibold text-slate-800">
                                  {labour.name || "-"}
                                </span>

                              </div>

                            </td>

                            <td className="px-6 py-4 text-sm text-slate-600">
                              {labour.department || "-"}
                            </td>

                            <td className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                              ₹
                              {Number(
                                labour.dailyWage || 0
                              ).toLocaleString("en-IN")}
                            </td>

                            <td className="px-6 py-4 text-center text-sm text-slate-600">
                              {labour.phone || "-"}
                            </td>

                            <td className="px-6 py-4 text-center">

                              <span
                                className={`
                                  inline-flex
                                  rounded-full
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-semibold
                                  ${
                                    labour.status === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-red-50 text-red-700"
                                  }
                                `}
                              >
                                {labour.status || "-"}
                              </span>

                            </td>

                            <td className="px-6 py-4">

                              <div className="flex justify-center gap-1">

                                <button
                                  type="button"
                                  title="Edit labour"
                                  onClick={() => {
                                    setEditingLabour(labour);
                                    setShowLabourModal(true);
                                  }}
                                  className="
                                    rounded-lg
                                    p-2
                                    text-slate-500
                                    transition
                                    hover:bg-blue-50
                                    hover:text-blue-600
                                  "
                                >
                                  <FiEdit2 size={16} />
                                </button>

                                <button
                                  type="button"
                                  title="Delete labour"
                                  onClick={() =>
                                    handleDeleteLabour(labour._id)
                                  }
                                  className="
                                    rounded-lg
                                    p-2
                                    text-slate-500
                                    transition
                                    hover:bg-red-50
                                    hover:text-red-600
                                  "
                                >
                                  <FiTrash2 size={16} />
                                </button>

                              </div>

                            </td>

                          </tr>
                        ))
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

            {/* ===================================================
                TASKS
            =================================================== */}

            {activeTab === "TASKS" && (
              <div className="p-4 sm:p-6">

                <UserChecklistWorkspace users={users} />

              </div>
            )}

          </section>

        </div>

        {/* =====================================================
            MODALS — EXISTING FUNCTIONALITY PRESERVED
        ===================================================== */}

        <AttendanceModal
          open={showAttendanceModal}
          attendance={editingAttendance}
          onClose={() => {
            setShowAttendanceModal(false);
            setEditingAttendance(null);
          }}
          onSuccess={async () => {
            await loadAttendance();

            setShowAttendanceModal(false);
            setEditingAttendance(null);
          }}
        />

        <LabourModal
          open={showLabourModal}
          labour={editingLabour}
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

      </div>
    </HRLayout>
  );
};

export default HRPage;