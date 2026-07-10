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

  return (
    <AdminLayout>
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-sm text-slate-500">
            Admin &gt; Attendance
          </p>

          <h1 className="text-3xl font-bold mt-2">
            Attendance Management
          </h1>

        </div>

        <div className="flex gap-3">

          <button
            onClick={() => setTab("EMPLOYEE")}
            className={`px-5 py-2 rounded-lg ${tab === "EMPLOYEE"
              ? "bg-[#172B6B] text-white"
              : "bg-slate-200"
              }`}
          >
            Employee
          </button>

          <button
            onClick={() => setTab("LABOUR")}
            className={`px-5 py-2 rounded-lg ${tab === "LABOUR"
              ? "bg-[#172B6B] text-white"
              : "bg-slate-200"
              }`}
          >
            Labour
          </button>

        </div>

        <button
          onClick={() =>
            tab === "EMPLOYEE"
              ? setShowAttendanceModal(true)
              : setShowLabourModal(true)
          }
          className="bg-[#172B6B] text-white px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <FiPlus />

          {tab === "EMPLOYEE"
            ? "Add Attendance"
            : "Add Labour"}
        </button>

      </div>

      <div className="bg-white rounded-xl shadow p-5">

        <div className="flex justify-between mb-5">

          <div className="flex gap-3">

            <input
              placeholder={
                tab === "EMPLOYEE"
                  ? "Search attendance..."
                  : "Search labour..."
              }
              className="border rounded-lg px-3 py-2 w-72"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {tab === "EMPLOYEE" && (
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="border rounded-lg px-3 py-2"
              >
                <option>All</option>
                <option>Present</option>
                <option>Absent</option>
                <option>Half Day</option>
                <option>Leave</option>
              </select>
            )}

          </div>

          <div className="flex gap-3">

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
              className="border rounded-lg px-4 py-2 flex items-center gap-2"
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
              className="border rounded-lg px-4 py-2 flex items-center gap-2"
            >
              <FiFileText />
              PDF
            </button>

          </div>

        </div>
        {tab === "EMPLOYEE" ? (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left py-3 px-3">Name</th>
                <th className="text-left px-3">
                  Role / Department
                </th>
                <th className="text-center">Date</th>
                <th className="text-center">Check In</th>
                <th className="text-center">Check Out</th>
                <th className="text-center">Assigned</th>
                <th className="text-center">Completed</th>
                <th className="text-center">Score</th>
                <th className="text-center">Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-10 text-center text-slate-500"
                  >
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record: any) => (
                  <tr
                    key={record._id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="py-3 px-3 font-medium">
                      {record.attendanceType === "EMPLOYEE"
                        ? record.employee?.name || "-"
                        : record.labour?.name || "-"}
                    </td>

                    <td className="px-3">
                      {record.attendanceType === "EMPLOYEE"
                        ? record.employee?.role || "-"
                        : record.labour?.department || "-"}
                    </td>

                    <td className="text-center">
                      {new Date(record.date).toLocaleDateString()}
                    </td>

                    <td className="text-center">
                      {record.checkIn || "-"}
                    </td>

                    <td className="text-center">
                      {record.checkOut || "-"}
                    </td>

                    <td className="text-center">
                      {record.tasksAssigned}
                    </td>

                    <td className="text-center">
                      {record.tasksCompleted}
                    </td>

                    <td className="text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${record.score >= 90
                          ? "bg-green-100 text-green-700"
                          : record.score >= 70
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {record.score}%
                      </span>
                    </td>

                    <td className="text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${record.status === "Present"
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

                    <td>
                      <div className="flex justify-center gap-4">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            setEditingAttendance(record);
                            setShowAttendanceModal(true);
                          }}
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Delete attendance?"
                              )
                            )
                              return;

                            await deleteAttendance(record._id);
                            loadAttendance();
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left py-3 px-3">Name</th>

                <th className="text-left px-3">
                  Department
                </th>

                <th className="text-center">
                  Daily Wage
                </th>

                <th className="text-center">
                  Phone
                </th>

                <th className="text-center">
                  Status
                </th>

                <th className="text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredLabours.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-slate-500"
                  >
                    No labour records found.
                  </td>
                </tr>
              ) : (
                filteredLabours.map((labour: any) => (
                  <tr
                    key={labour._id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="py-3 px-3 font-medium">
                      {labour.name}
                    </td>

                    <td className="px-3">
                      {labour.department}
                    </td>

                    <td className="text-center">
                      ₹{labour.dailyWage}
                    </td>

                    <td className="text-center">
                      {labour.phone || "-"}
                    </td>

                    <td className="text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${labour.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {labour.status}
                      </span>
                    </td>

                    <td>
                      <div className="flex justify-center gap-4">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            setEditingLabour(labour);
                            setShowLabourModal(true);
                          }}
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Delete labour?"
                              )
                            )
                              return;

                            await deleteLabour(labour._id);

                            loadLabours();
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

      </div>

      <AttendanceModal
        open={showAttendanceModal}
        attendance={editingAttendance}
        onClose={() => {
          setShowAttendanceModal(false);
          setEditingAttendance(null);
        }}
        onSuccess={loadAttendance}
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