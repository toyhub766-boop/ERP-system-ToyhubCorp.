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
      <div className="min-h-full bg-slate-50 p-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mb-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                HR &gt; Attendance
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                HR & Attendance
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage employee attendance,
                labour records and employee
                task performance.
              </p>

            </div>

            {/* PRIMARY ACTION */}

            {activeTab ===
              "EMPLOYEE" && (
              <button
                onClick={() => {
                  setEditingAttendance(
                    null
                  );

                  setShowAttendanceModal(
                    true
                  );
                }}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#172B6B]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#20398F]
                "
              >
                <FiPlus size={17} />
                Add Attendance
              </button>
            )}

            {activeTab ===
              "LABOUR" && (
              <button
                onClick={() => {
                  setEditingLabour(null);

                  setShowLabourModal(
                    true
                  );
                }}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#172B6B]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#20398F]
                "
              >
                <FiPlus size={17} />
                Add Labour
              </button>
            )}

          </div>

        </section>

        {/* =====================================================
            KPI CARDS
        ===================================================== */}

        <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Employee Records
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {employeeStats.total}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiUsers size={20} />
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Present
                </p>

                <p className="mt-2 text-2xl font-bold text-green-600">
                  {employeeStats.present}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <FiCheckCircle size={20} />
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Absent
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {employeeStats.absent}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <FiAlertCircle size={20} />
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Leave / Half Day
                </p>

                <p className="mt-2 text-2xl font-bold text-orange-600">
                  {employeeStats.leave +
                    employeeStats.halfDay}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <FiClock size={20} />
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* ===================================================
              TABS
          =================================================== */}

          <div className="border-b border-slate-200 px-6 pt-5">

            <div className="flex flex-wrap gap-2">

              <button
                onClick={() =>
                  handleTabChange(
                    "EMPLOYEE"
                  )
                }
                className={`
                  rounded-xl
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  transition
                  ${
                    activeTab ===
                    "EMPLOYEE"
                      ? "bg-[#172B6B] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                Employee Attendance
              </button>

              <button
                onClick={() =>
                  handleTabChange(
                    "LABOUR"
                  )
                }
                className={`
                  rounded-xl
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  transition
                  ${
                    activeTab ===
                    "LABOUR"
                      ? "bg-[#172B6B] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                Labour Attendance
              </button>

              <button
                onClick={() =>
                  handleTabChange(
                    "TASKS"
                  )
                }
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  transition
                  ${
                    activeTab ===
                    "TASKS"
                      ? "bg-[#172B6B] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                <FiClipboard
                  size={16}
                />

                Tasks & Checklists
              </button>

            </div>

          </div>

          {/* ===================================================
              EMPLOYEE TOOLBAR
          =================================================== */}

          {activeTab ===
            "EMPLOYEE" && (
            <div className="border-b border-slate-200 p-6">

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                <div className="flex flex-col gap-3 md:flex-row">

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search employee, role or ID..."
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      text-sm
                      outline-none
                      transition
                      focus:border-[#172B6B]
                      focus:ring-4
                      focus:ring-blue-50
                      md:w-[320px]
                    "
                  />

                  <select
                    value={
                      statusFilter
                    }
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                    className="
                      h-11
                      rounded-xl
                      border
                      border-slate-300
                      bg-white
                      px-4
                      text-sm
                      outline-none
                      focus:border-[#172B6B]
                    "
                  >
                    <option value="All">
                      All Status
                    </option>

                    <option value="Present">
                      Present
                    </option>

                    <option value="Absent">
                      Absent
                    </option>

                    <option value="Half Day">
                      Half Day
                    </option>

                    <option value="Leave">
                      Leave
                    </option>
                  </select>

                </div>

                <div className="flex gap-3">

                  <button
                    onClick={
                      handleExcelExport
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-slate-700
                      hover:bg-slate-50
                    "
                  >
                    <FiDownload
                      size={16}
                    />

                    Excel
                  </button>

                  <button
                    onClick={
                      handlePdfExport
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-slate-700
                      hover:bg-slate-50
                    "
                  >
                    <FiFileText
                      size={16}
                    />

                    PDF
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* ===================================================
              LABOUR TOOLBAR
          =================================================== */}

          {activeTab ===
            "LABOUR" && (
            <div className="border-b border-slate-200 p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search labour, department or phone..."
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    text-sm
                    outline-none
                    transition
                    focus:border-[#172B6B]
                    focus:ring-4
                    focus:ring-blue-50
                    sm:w-[360px]
                  "
                />

                <div className="flex gap-3">

                  <button
                    onClick={
                      handleExcelExport
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-slate-700
                      hover:bg-slate-50
                    "
                  >
                    <FiDownload
                      size={16}
                    />

                    Excel
                  </button>

                  <button
                    onClick={
                      handlePdfExport
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-slate-700
                      hover:bg-slate-50
                    "
                  >
                    <FiFileText
                      size={16}
                    />

                    PDF
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* ===================================================
              EMPLOYEE ATTENDANCE TABLE
          =================================================== */}

          {activeTab ===
            "EMPLOYEE" && (
            <div className="overflow-x-auto">

              <table className="min-w-[1200px] w-full">

                <thead className="bg-slate-50">

                  <tr className="border-b border-slate-200">

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Employee
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Check In
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Check Out
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tasks
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Completed
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Score
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredAttendance.length ===
                  0 ? (
                    <tr>

                      <td
                        colSpan={10}
                        className="py-16 text-center text-sm text-slate-500"
                      >
                        No attendance records
                        found.
                      </td>

                    </tr>
                  ) : (
                    filteredAttendance.map(
                      (record: any) => {

                        const score =
                          Number(
                            record.score
                          ) || 0;

                        return (
                          <tr
                            key={
                              record._id
                            }
                            className="
                              border-b
                              border-slate-100
                              transition
                              hover:bg-slate-50
                            "
                          >

                            {/* EMPLOYEE */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-3">

                                <div className="
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-slate-100
                                  text-sm
                                  font-bold
                                  text-slate-600
                                ">
                                  {(
                                    record
                                      .employee
                                      ?.name ||
                                    "-"
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <div>

                                  <p className="font-semibold text-slate-800">
                                    {record
                                      .employee
                                      ?.name ||
                                      "-"}
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {record
                                      .employee
                                      ?.employeeId ||
                                      "-"}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* ROLE */}

                            <td className="px-6 py-5 text-sm text-slate-600">
                              {record
                                .employee
                                ?.role ||
                                "-"}
                            </td>

                            {/* DATE */}

                            <td className="px-6 py-5 text-center text-sm text-slate-600">
                              {record.date
                                ? new Date(
                                    record.date
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "-"}
                            </td>

                            {/* CHECK IN */}

                            <td className="px-6 py-5 text-center text-sm font-medium text-slate-700">
                              {record.checkIn ||
                                "-"}
                            </td>

                            {/* CHECK OUT */}

                            <td className="px-6 py-5 text-center text-sm font-medium text-slate-700">
                              {record.checkOut ||
                                "-"}
                            </td>

                            {/* TASKS */}

                            <td className="px-6 py-5 text-center text-sm font-semibold text-slate-700">
                              {record.tasksAssigned ??
                                0}
                            </td>

                            {/* COMPLETED */}

                            <td className="px-6 py-5 text-center text-sm font-semibold text-slate-700">
                              {record.tasksCompleted ??
                                0}
                            </td>

                            {/* SCORE */}

                            <td className="px-6 py-5 text-center">

                              <span
                                className={`
                                  inline-flex
                                  min-w-[58px]
                                  justify-center
                                  rounded-full
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-semibold
                                  ${
                                    score >=
                                    90
                                      ? "bg-green-100 text-green-700"
                                      : score >=
                                        70
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                  }
                                `}
                              >
                                {score}%
                              </span>

                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5 text-center">

                              <span
                                className={`
                                  inline-flex
                                  rounded-full
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-semibold
                                  ${
                                    record.status ===
                                    "Present"
                                      ? "bg-green-100 text-green-700"
                                      : record.status ===
                                        "Half Day"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : record.status ===
                                        "Leave"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-red-100 text-red-700"
                                  }
                                `}
                              >
                                {
                                  record.status
                                }
                              </span>

                            </td>

                            {/* ACTIONS */}

                            <td className="px-6 py-5">

                              <div className="flex justify-center gap-2">

                                <button
                                  title="Edit attendance"
                                  onClick={() => {
                                    setEditingAttendance(
                                      record
                                    );

                                    setShowAttendanceModal(
                                      true
                                    );
                                  }}
                                  className="
                                    rounded-lg
                                    p-2
                                    text-blue-600
                                    transition
                                    hover:bg-blue-50
                                  "
                                >
                                  <FiEdit2
                                    size={17}
                                  />
                                </button>

                                <button
                                  title="Delete attendance"
                                  onClick={() =>
                                    handleDeleteAttendance(
                                      record._id
                                    )
                                  }
                                  className="
                                    rounded-lg
                                    p-2
                                    text-red-600
                                    transition
                                    hover:bg-red-50
                                  "
                                >
                                  <FiTrash2
                                    size={17}
                                  />
                                </button>

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
          )}

          {/* ===================================================
              LABOUR TABLE
          =================================================== */}

          {activeTab ===
            "LABOUR" && (
            <div className="overflow-x-auto">

              <table className="min-w-[900px] w-full">

                <thead className="bg-slate-50">

                  <tr className="border-b border-slate-200">

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Labour
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Department
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Daily Wage
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredLabours.length ===
                  0 ? (
                    <tr>

                      <td
                        colSpan={6}
                        className="py-16 text-center text-sm text-slate-500"
                      >
                        No labour records
                        found.
                      </td>

                    </tr>
                  ) : (
                    filteredLabours.map(
                      (labour: any) => (
                        <tr
                          key={
                            labour._id
                          }
                          className="
                            border-b
                            border-slate-100
                            transition
                            hover:bg-slate-50
                          "
                        >

                          {/* NAME */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-full
                                bg-slate-100
                                text-sm
                                font-bold
                                text-slate-600
                              ">
                                {(
                                  labour.name ||
                                  "-"
                                )
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <span className="font-semibold text-slate-800">
                                {labour.name ||
                                  "-"}
                              </span>

                            </div>

                          </td>

                          {/* DEPARTMENT */}

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {labour.department ||
                              "-"}
                          </td>

                          {/* WAGE */}

                          <td className="px-6 py-5 text-center text-sm font-semibold text-slate-700">
                            ₹
                            {Number(
                              labour.dailyWage ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          {/* PHONE */}

                          <td className="px-6 py-5 text-center text-sm text-slate-600">
                            {labour.phone ||
                              "-"}
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5 text-center">

                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                ${
                                  labour.status ===
                                  "ACTIVE"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }
                              `}
                            >
                              {labour.status ||
                                "-"}
                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-6 py-5">

                            <div className="flex justify-center gap-2">

                              <button
                                title="Edit labour"
                                onClick={() => {
                                  setEditingLabour(
                                    labour
                                  );

                                  setShowLabourModal(
                                    true
                                  );
                                }}
                                className="
                                  rounded-lg
                                  p-2
                                  text-blue-600
                                  transition
                                  hover:bg-blue-50
                                "
                              >
                                <FiEdit2
                                  size={17}
                                />
                              </button>

                              <button
                                title="Delete labour"
                                onClick={() =>
                                  handleDeleteLabour(
                                    labour._id
                                  )
                                }
                                className="
                                  rounded-lg
                                  p-2
                                  text-red-600
                                  transition
                                  hover:bg-red-50
                                "
                              >
                                <FiTrash2
                                  size={17}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

          {/* ===================================================
              TASKS / CHECKLISTS
          =================================================== */}

          {activeTab ===
            "TASKS" && (

            <div className="p-6">

              <UserChecklistWorkspace
                users={users}
              />

            </div>

          )}

        </section>

        {/* =====================================================
            ATTENDANCE MODAL
        ===================================================== */}

        <AttendanceModal
          open={
            showAttendanceModal
          }
          attendance={
            editingAttendance
          }
          onClose={() => {
            setShowAttendanceModal(
              false
            );

            setEditingAttendance(
              null
            );
          }}
          onSuccess={async () => {
            await loadAttendance();

            setShowAttendanceModal(
              false
            );

            setEditingAttendance(
              null
            );
          }}
        />

        {/* =====================================================
            LABOUR MODAL
        ===================================================== */}

        <LabourModal
          open={showLabourModal}
          labour={editingLabour}
          onClose={() => {
            setShowLabourModal(false);

            setEditingLabour(null);
          }}
          onSuccess={async () => {
            await loadLabours();

            setShowLabourModal(
              false
            );

            setEditingLabour(null);
          }}
        />

      </div>
    </HRLayout>
  );
};

export default HRPage;