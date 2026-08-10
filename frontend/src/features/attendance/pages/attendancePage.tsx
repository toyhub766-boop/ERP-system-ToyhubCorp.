import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../../app/layouts/AdminLayout";

import {
  getAttendance,
  deleteAttendance,
} from "../services/attendance.service";

import {
  getLabours,
  deleteLabour,
} from "../../labour/services/labour.service";

import AttendanceModal from "../components/AttendanceModal";
import LabourModal from "../../labour/components/LabourModal";

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
} from "react-icons/fi";

import { exportAttendanceExcel } from "../../../utils/exportAttendanceExcel";
import { exportAttendancePdf } from "../../../utils/exportAttendancePdf";

const AttendancePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"EMPLOYEE" | "LABOUR">("EMPLOYEE");

  const [attendance, setAttendance] = useState<any[]>([]);
  const [labours, setLabours] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAttendanceModal, setShowAttendanceModal] =
    useState(false);

  const [showLabourModal, setShowLabourModal] =
    useState(false);

  const [editingAttendance, setEditingAttendance] =
    useState<any>(null);

  const [editingLabour, setEditingLabour] =
    useState<any>(null);

  const loadAttendance = async () => {
    try {
      const data = await getAttendance();
      setAttendance(data);
    } catch (error) {
      console.error("Failed to load attendance:", error);
    }
  };

  const loadLabours = async () => {
    try {
      const data = await getLabours();
      setLabours(data);
    } catch (error) {
      console.error("Failed to load labour:", error);
    }
  };

  useEffect(() => {
    loadAttendance();
    loadLabours();
  }, []);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record: any) => {
      const name =
        record.employee?.name ||
        record.labour?.name ||
        "";

      const role =
        record.employee?.role ||
        record.labour?.department ||
        "";

      const searchValue = `${name} ${role}`.toLowerCase();

      const matchesSearch = searchValue.includes(
        search.toLowerCase()
      );

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [attendance, search, statusFilter]);

  const filteredLabours = useMemo(() => {
    return labours.filter((labour: any) => {
      const searchValue = `
        ${labour.name || ""}
        ${labour.department || ""}
        ${labour.phone || ""}
      `.toLowerCase();

      return searchValue.includes(
        search.toLowerCase()
      );
    });
  }, [labours, search]);

  /* =========================
     ATTENDANCE STATISTICS
  ========================= */

  const employeeStats = useMemo(() => {
    const total = attendance.length;

    const present = attendance.filter(
      (record) => record.status === "Present"
    ).length;

    const absent = attendance.filter(
      (record) => record.status === "Absent"
    ).length;

    const leave = attendance.filter(
      (record) => record.status === "Leave"
    ).length;

    return {
      total,
      present,
      absent,
      leave,
    };
  }, [attendance]);

  /* =========================
     EXPORTS
  ========================= */

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

  /* =========================
     DELETE HANDLERS
  ========================= */

  const handleDeleteAttendance = async (
    id: string
  ) => {
    const confirmed = window.confirm(
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
    const confirmed = window.confirm(
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

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-[1450px] space-y-7">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">

          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Admin / Attendance
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Attendance Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage employee and labour attendance,
                working hours and attendance records from
                one place.
              </p>
            </div>

            <button
              onClick={() => {
                if (tab === "EMPLOYEE") {
                  setEditingAttendance(null);
                  setShowAttendanceModal(true);
                } else {
                  setEditingLabour(null);
                  setShowLabourModal(true);
                }
              }}
              className="
                inline-flex
                h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#172B6B]
                px-6
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-[#20398F]
              "
            >
              <FiPlus size={18} />

              {tab === "EMPLOYEE"
                ? "Add Attendance"
                : "Add Labour"}
            </button>

          </div>

        </section>

        {/* =====================================================
            STATS
        ===================================================== */}

        {tab === "EMPLOYEE" && (
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Total Records
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

                  <p className="mt-2 text-2xl font-bold text-slate-900">
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

                  <p className="mt-2 text-2xl font-bold text-slate-900">
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
                    Leave
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {employeeStats.leave}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <FiClock size={20} />
                </div>

              </div>

            </div>

          </section>
        )}

        {/* =====================================================
            MAIN ATTENDANCE CARD
        ===================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* Tabs */}

          <div className="border-b border-slate-200 px-6 pt-6">

            <div className="flex flex-wrap gap-2">

              <button
                onClick={() => {
                  setTab("EMPLOYEE");
                  setSearch("");
                  setStatusFilter("All");
                }}
                className={`
                  rounded-xl
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  transition
                  ${tab === "EMPLOYEE"
                    ? "bg-[#172B6B] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                Employee Attendance
              </button>

              <button
                onClick={() => {
                  setTab("LABOUR");
                  setSearch("");
                  setStatusFilter("All");
                }}
                className={`
                  rounded-xl
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  transition
                  ${tab === "LABOUR"
                    ? "bg-[#172B6B] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                Labour Management
              </button>

              <button
                onClick={() => navigate("/admin/tasks")}
                className="
    rounded-xl
    px-5
    py-3
    text-sm
    font-semibold
    text-slate-600
    transition
    hover:bg-slate-100
  "
              >
                Tasks & Checklists
              </button>

            </div>

          </div>

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="border-b border-slate-200 p-6">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div className="flex flex-col gap-3 md:flex-row">

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder={
                    tab === "EMPLOYEE"
                      ? "Search employee or role..."
                      : "Search labour, department or phone..."
                  }
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

                {tab === "EMPLOYEE" && (
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
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
                      transition
                      focus:border-[#172B6B]
                      focus:ring-4
                      focus:ring-blue-50
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
                )}

              </div>

              {/* EXPORTS */}

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={handleExcelExport}
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-5
                    text-sm
                    font-medium
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <FiDownload size={16} />
                  Export Excel
                </button>

                <button
                  onClick={handlePdfExport}
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-5
                    text-sm
                    font-medium
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <FiFileText size={16} />
                  Export PDF
                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              EMPLOYEE TABLE
          ================================================= */}

          {tab === "EMPLOYEE" && (
            <div className="overflow-x-auto">

              <table className="min-w-[1250px] w-full">

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
                      Assigned
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

                  {filteredAttendance.length === 0 ? (

                    <tr>
                      <td
                        colSpan={10}
                        className="py-16 text-center text-sm text-slate-500"
                      >
                        No attendance records found.
                      </td>
                    </tr>

                  ) : (

                    filteredAttendance.map(
                      (record: any) => {

                        const score =
                          Number(record.score) || 0;

                        return (
                          <tr
                            key={record._id}
                            className="
                              border-b
                              border-slate-100
                              transition
                              hover:bg-slate-50
                            "
                          >

                            {/* Employee */}

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
                                  font-semibold
                                  text-slate-600
                                ">
                                  {(
                                    record.employee?.name ||
                                    "-"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {record.employee?.name ||
                                      "-"}
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {record.employee?.employeeId ||
                                      "-"}
                                  </p>
                                </div>

                              </div>

                            </td>

                            {/* Role */}

                            <td className="px-6 py-5 text-sm text-slate-600">
                              {record.employee?.role ||
                                "-"}
                            </td>

                            {/* Date */}

                            <td className="px-6 py-5 text-center text-sm text-slate-600">
                              {record.date
                                ? new Date(
                                  record.date
                                ).toLocaleDateString()
                                : "-"}
                            </td>

                            {/* Check In */}

                            <td className="px-6 py-5 text-center text-sm font-medium text-slate-700">
                              {record.checkIn || "-"}
                            </td>

                            {/* Check Out */}

                            <td className="px-6 py-5 text-center text-sm font-medium text-slate-700">
                              {record.checkOut || "-"}
                            </td>

                            {/* Assigned */}

                            <td className="px-6 py-5 text-center text-sm font-semibold text-slate-700">
                              {record.tasksAssigned ?? 0}
                            </td>

                            {/* Completed */}

                            <td className="px-6 py-5 text-center text-sm font-semibold text-slate-700">
                              {record.tasksCompleted ?? 0}
                            </td>

                            {/* Score */}

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
                                  ${score >= 90
                                    ? "bg-green-100 text-green-700"
                                    : score >= 70
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                  }
                                `}
                              >
                                {score}%
                              </span>

                            </td>

                            {/* Status */}

                            <td className="px-6 py-5 text-center">

                              <span
                                className={`
                                  inline-flex
                                  rounded-full
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-semibold
                                  ${record.status ===
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
                                {record.status}
                              </span>

                            </td>

                            {/* Actions */}

                            <td className="px-6 py-5">

                              <div className="flex justify-center gap-2">

                                <button
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
                                  title="Edit attendance"
                                >
                                  <FiEdit2 size={17} />
                                </button>

                                <button
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
                                  title="Delete attendance"
                                >
                                  <FiTrash2 size={17} />
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

          {/* =================================================
              LABOUR TABLE
          ================================================= */}

          {tab === "LABOUR" && (
            <div className="overflow-x-auto">

              <table className="min-w-[900px] w-full">

                <thead className="bg-slate-50">

                  <tr className="border-b border-slate-200">

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Name
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

                  {filteredLabours.length === 0 ? (

                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-sm text-slate-500"
                      >
                        No labour records found.
                      </td>
                    </tr>

                  ) : (

                    filteredLabours.map(
                      (labour: any) => (

                        <tr
                          key={labour._id}
                          className="
                            border-b
                            border-slate-100
                            transition
                            hover:bg-slate-50
                          "
                        >

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
                                font-semibold
                                text-slate-600
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

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {labour.department || "-"}
                          </td>

                          <td className="px-6 py-5 text-center text-sm font-semibold text-slate-700">
                            ₹{labour.dailyWage ?? 0}
                          </td>

                          <td className="px-6 py-5 text-center text-sm text-slate-600">
                            {labour.phone || "-"}
                          </td>

                          <td className="px-6 py-5 text-center">

                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                ${labour.status ===
                                  "ACTIVE"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                                }
                              `}
                            >
                              {labour.status || "-"}
                            </span>

                          </td>

                          <td className="px-6 py-5">

                            <div className="flex justify-center gap-2">

                              <button
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
                                title="Edit labour"
                              >
                                <FiEdit2 size={17} />
                              </button>

                              <button
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
                                title="Delete labour"
                              >
                                <FiTrash2 size={17} />
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

        </section>

        {/* =====================================================
            MODALS
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
          }}
        />

      </div>
    </AdminLayout>
  );
};

export default AttendancePage;