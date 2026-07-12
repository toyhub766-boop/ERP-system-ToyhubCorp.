import { useEffect, useMemo, useState } from "react";
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
} from "react-icons/fi";

import {
  getTasks,
  deleteTask,
} from "../../tasks/services/task.service";

import TaskModal from "../../tasks/components/TaskModal";

import { exportAttendanceExcel } from "../../../utils/exportAttendanceExcel";
import { exportAttendancePdf } from "../../../utils/exportAttendancePdf";

const AttendancePage = () => {
  const [tab, setTab] = useState<"EMPLOYEE" | "LABOUR">(
    "EMPLOYEE"
  );

  const [attendance, setAttendance] = useState<any[]>([]);
  const [labours, setLabours] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [showAttendanceModal, setShowAttendanceModal] =
    useState(false);

  const [showLabourModal, setShowLabourModal] =
    useState(false);

  const [editingAttendance, setEditingAttendance] =
    useState<any>(null);

  const [editingLabour, setEditingLabour] =
    useState<any>(null);

  const [tasks, setTasks] = useState<any[]>([]);

  const [taskSearch, setTaskSearch] =
    useState("");

  const [showTaskModal, setShowTaskModal] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState<any>(null);

  const loadAttendance = async () => {
    try {
      const data = await getAttendance();
      setAttendance(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLabours = async () => {
    try {
      const data = await getLabours();
      setLabours(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

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

      const matchesSearch = name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [attendance, search, statusFilter]);

  const filteredLabours = useMemo(() => {
    return labours.filter((labour: any) =>
      labour.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [labours, search]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task: any) =>
      (task.title || "")
        .toLowerCase()
        .includes(taskSearch.toLowerCase())
    );
  }, [tasks, taskSearch]);

  return (
  <AdminLayout>
    <div className="mx-auto w-full max-w-[1450px] space-y-8">

      {/* ===================== PAGE HEADER ===================== */}

      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">

        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

          {/* Left */}

          <div>

            <p className="text-sm text-slate-500">
              Admin &gt; Attendance
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
              Attendance Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage employee attendance, labour records and daily task assignments.
            </p>

          </div>

          {/* Right */}

          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              onClick={() =>
                tab === "EMPLOYEE"
                  ? setShowAttendanceModal(true)
                  : setShowLabourModal(true)
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-[#172B6B]
                px-6
                py-3
                text-sm
                font-semibold
                text-white
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

        </div>

      </div>

      {/* ===================== ATTENDANCE CARD ===================== */}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* Top */}

        <div className="border-b border-slate-200 px-6 py-6">

          <div className="flex flex-col gap-6">

            {/* Tabs */}

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() => setTab("EMPLOYEE")}
                className={`
                  rounded-xl
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  ${
                    tab === "EMPLOYEE"
                      ? "bg-[#172B6B] text-white shadow"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                Employee Attendance
              </button>

              <button
                onClick={() => setTab("LABOUR")}
                className={`
                  rounded-xl
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  ${
                    tab === "LABOUR"
                      ? "bg-[#172B6B] text-white shadow"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                Labour Management
              </button>

            </div>

            {/* Toolbar */}

            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

              {/* Left */}

              <div className="flex flex-1 flex-col gap-4 md:flex-row">

                <input
                  placeholder={
                    tab === "EMPLOYEE"
                      ? "Search employee..."
                      : "Search labour..."
                  }
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="
                    h-12
                    w-full
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
                    focus:ring-blue-100
                    md:max-w-md
                  "
                />

                {tab === "EMPLOYEE" && (

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="
                      h-12
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
                      focus:ring-blue-100
                    "
                  >
                    <option>All</option>
                    <option>Present</option>
                    <option>Absent</option>
                    <option>Half Day</option>
                    <option>Leave</option>
                  </select>

                )}

              </div>

              {/* Right */}

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    exportAttendanceExcel(
                      tab === "EMPLOYEE"
                        ? filteredAttendance
                        : filteredLabours,
                      tab === "EMPLOYEE"
                        ? "attendance"
                        : "labours"
                    )
                  }
                  className="
                    inline-flex
                    h-12
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-5
                    text-sm
                    font-medium
                    transition
                    hover:bg-slate-50
                  "
                >
                  <FiDownload />
                  Excel
                </button>

                <button
                  onClick={() =>
                    exportAttendancePdf(
                      tab === "EMPLOYEE"
                        ? filteredAttendance
                        : filteredLabours,
                      tab === "EMPLOYEE"
                        ? "attendance"
                        : "labours"
                    )
                  }
                  className="
                    inline-flex
                    h-12
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-5
                    text-sm
                    font-medium
                    transition
                    hover:bg-slate-50
                  "
                >
                  <FiFileText />
                  PDF
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* ===================== TABLE ===================== */}

        <div className="overflow-x-auto">

          <table className="min-w-[1200px] w-full">

             <thead className="bg-slate-50">

  {tab === "EMPLOYEE" ? (

    <tr className="border-b border-slate-200">

      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
        Employee
      </th>

      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
        Role / Department
      </th>

      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
        Date
      </th>

      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
        Check In
      </th>

      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
        Check Out
      </th>

      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
        Assigned
      </th>

      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
        Completed
      </th>

      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
        Score
      </th>

      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
        Status
      </th>

      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
        Actions
      </th>

    </tr>

  ) : (

    <tr className="border-b border-slate-200">

      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
        Name
      </th>

      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
        Department
      </th>

      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
        Daily Wage
      </th>

      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
        Phone
      </th>

      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
        Status
      </th>

      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
        Actions
      </th>

    </tr>

  )}

</thead>

<tbody>

  {tab === "EMPLOYEE" ? (

    filteredAttendance.length === 0 ? (

      <tr>

        <td
          colSpan={10}
          className="py-16 text-center text-slate-500"
        >
          No attendance records found.
        </td>

      </tr>

    ) : (

      filteredAttendance.map((record: any) => (

        <tr
          key={record._id}
          className="border-b border-slate-100 transition hover:bg-slate-50"
        >

          <td className="px-6 py-5">

            <div className="font-semibold text-slate-800">
              {record.attendanceType === "EMPLOYEE"
                ? record.employee?.name || "-"
                : record.labour?.name || "-"}
            </div>

          </td>

          <td className="px-6 py-5 text-slate-600">

            {record.attendanceType === "EMPLOYEE"
              ? record.employee?.role || "-"
              : record.labour?.department || "-"}

          </td>

          <td className="px-6 py-5 text-center">

            {new Date(record.date).toLocaleDateString()}

          </td>

          <td className="px-6 py-5 text-center">
            {record.checkIn || "-"}
          </td>

          <td className="px-6 py-5 text-center">
            {record.checkOut || "-"}
          </td>

          <td className="px-6 py-5 text-center">
            {record.tasksAssigned}
          </td>

          <td className="px-6 py-5 text-center">
            {record.tasksCompleted}
          </td>

          <td className="px-6 py-5 text-center">

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                record.score >= 90
                  ? "bg-green-100 text-green-700"
                  : record.score >= 70
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {record.score}%
            </span>

          </td>

          <td className="px-6 py-5 text-center">

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                record.status === "Present"
                  ? "bg-green-100 text-green-700"
                  : record.status === "Half Day"
                  ? "bg-yellow-100 text-yellow-700"
                  : record.status === "Leave"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {record.status}
            </span>

          </td>

          <td className="px-6 py-5">

            <div className="flex justify-center gap-3">

              <button
                onClick={() => {
                  setEditingAttendance(record);
                  setShowAttendanceModal(true);
                }}
                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
              >
                <FiEdit2 />
              </button>

              <button
                onClick={async () => {
                  if (!window.confirm("Delete attendance?")) return;

                  await deleteAttendance(record._id);

                  loadAttendance();
                }}
                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
              >
                <FiTrash2 />
              </button>

            </div>

          </td>

        </tr>

      ))

    )

  ) : (

    filteredLabours.length === 0 ? (

      <tr>

        <td
          colSpan={6}
          className="py-16 text-center text-slate-500"
        >
          No labour records found.
        </td>

      </tr>

    ) : (

      filteredLabours.map((labour: any) => (

        <tr
          key={labour._id}
          className="border-b border-slate-100 transition hover:bg-slate-50"
        >

          <td className="px-6 py-5 font-semibold">
            {labour.name}
          </td>

          <td className="px-6 py-5">
            {labour.department}
          </td>

          <td className="px-6 py-5 text-center">
            ₹{labour.dailyWage}
          </td>

          <td className="px-6 py-5 text-center">
            {labour.phone || "-"}
          </td>

          <td className="px-6 py-5 text-center">

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                labour.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {labour.status}
            </span>

          </td>

          <td className="px-6 py-5">

            <div className="flex justify-center gap-3">

              <button
                onClick={() => {
                  setEditingLabour(labour);
                  setShowLabourModal(true);
                }}
                className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
              >
                <FiEdit2 />
              </button>

              <button
                onClick={async () => {
                  if (!window.confirm("Delete labour?")) return;

                  await deleteLabour(labour._id);

                  loadLabours();
                }}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <FiTrash2 />
              </button>

            </div>

          </td>

        </tr>

      ))

    )

  )}

</tbody>

</table>

</div>

</div> 


<div className="h-16" />

      {/* ===================== TODAY'S TASK ASSIGNMENT ===================== */}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* Header */}

        <div className="border-b border-slate-200 px-6 py-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <h2 className="text-2xl font-bold text-slate-900">
                Today's Task Assignment
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Assign, track and manage employee tasks for today.
              </p>

            </div>

            <button
              onClick={() => {
                setEditingTask(null);
                setShowTaskModal(true);
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
                transition
                hover:bg-[#20398F]
              "
            >
              <FiPlus />
              Assign Task
            </button>

          </div>

        </div>

        {/* Toolbar */}

        <div className="border-b border-slate-200 px-6 py-5">

          <input
            placeholder="Search tasks..."
            value={taskSearch}
            onChange={(e) =>
              setTaskSearch(e.target.value)
            }
            className="
              h-12
              w-full
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
              focus:ring-blue-100
              md:max-w-md
            "
          />

        </div>

        {/* Table */}

        <div className="overflow-x-auto">

          <table className="min-w-[950px] w-full">

            <thead className="bg-slate-50">

              <tr className="border-b border-slate-200">

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Task
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Assigned To
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Priority
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Status
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Due Date
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredTasks.length > 0 ? (

                filteredTasks.map((task: any) => (

                  <tr
                    key={task._id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >

                    <td className="px-6 py-5">

                      <div className="font-semibold text-slate-800">
                        {task.title}
                      </div>

                    </td>

                    <td className="px-6 py-5">

                      {task.assignedTo?.name || "-"}

                    </td>

                    <td className="px-6 py-5 text-center">

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          task.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {task.priority}
                      </span>

                    </td>

                    <td className="px-6 py-5 text-center">

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          task.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : task.status === "In Progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {task.status}
                      </span>

                    </td>

                    <td className="px-6 py-5 text-center">

                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "-"}

                    </td>

                    <td className="px-6 py-5">

                      <div className="flex justify-center gap-3">

                        <button
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          onClick={() => {
                            setEditingTask(task);
                            setShowTaskModal(true);
                          }}
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          onClick={async () => {

                            if (!window.confirm("Delete task?"))
                              return;

                            await deleteTask(task._id);

                            loadTasks();

                          }}
                        >
                          <FiTrash2 />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={6}
                    className="py-16 text-center text-slate-500"
                  >

                    No tasks assigned for today.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ===================== MODALS ===================== */}

      <AttendanceModal
        open={showAttendanceModal}
        attendance={editingAttendance}
        onClose={() => {
          setShowAttendanceModal(false);
          setEditingAttendance(null);
        }}
        onSuccess={loadAttendance}
      />

      <TaskModal
        open={showTaskModal}
        task={editingTask}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSuccess={loadTasks}
      />

      <LabourModal
        open={showLabourModal}
        labour={editingLabour}
        onClose={() => {
          setShowLabourModal(false);
          setEditingLabour(null);
        }}
        onSuccess={loadLabours}
      />

    </div>

  </AdminLayout>

);
};

export default AttendancePage;