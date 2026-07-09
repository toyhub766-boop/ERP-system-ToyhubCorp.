import { useEffect, useState } from "react";

import {
  createAttendance,
  updateAttendance,
} from "../services/attendance.service";

import api from "../../../services/api/axios";

interface Props {
  open: boolean;
  attendance?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const AttendanceModal = ({
  open,
  attendance,
  onClose,
  onSuccess,
}: Props) => {
  const [employees, setEmployees] = useState<any[]>([]);

  const [labours, setLabours] = useState<any[]>([]);

  const [form, setForm] = useState({
    attendanceType: "EMPLOYEE",

    employee: "",

    labour: "",

    date: "",

    checkIn: "",

    checkOut: "",

    status: "Present",

    tasksAssigned: 0,

    tasksCompleted: 0,

    remarks: "",
  });

  useEffect(() => {
    if (attendance) {
      setForm({
        attendanceType:
          attendance.attendanceType || "EMPLOYEE",

        employee: attendance.employee?._id || "",

        labour: attendance.labour?._id || "",

        date: attendance.date?.substring(0, 10) || "",

        checkIn: attendance.checkIn || "",

        checkOut: attendance.checkOut || "",

        status: attendance.status || "Present",

        tasksAssigned: attendance.tasksAssigned || 0,

        tasksCompleted: attendance.tasksCompleted || 0,

        remarks: attendance.remarks || "",
      });
    } else {
      setForm({
        attendanceType: "EMPLOYEE",

        employee: "",

        labour: "",

        date: "",

        checkIn: "",

        checkOut: "",

        status: "Present",

        tasksAssigned: 0,

        tasksCompleted: 0,

        remarks: "",
      });
    }
  }, [attendance]);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get("/users/employees");

      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

    const fetchLabours = async () => {
    try {
      const { data } = await api.get("/labour/active");

      setLabours(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLabours();
  }, []);
  
const handleSubmit = async () => {
  try {
    const payload = {
      ...form,
      employee:
        form.attendanceType === "EMPLOYEE" && form.employee
          ? form.employee
          : null,

      labour:
        form.attendanceType === "LABOUR" && form.labour
          ? form.labour
          : null,
    };

    if (attendance) {
      await updateAttendance(attendance._id, payload);
    } else {
      await createAttendance(payload);
    }

    onSuccess();
    onClose();
  } catch (err) {
    console.error(err);
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[650px] p-6 space-y-4">

        <h2 className="text-2xl font-bold">
          {attendance
            ? "Edit Attendance"
            : "Add Attendance"}
        </h2>

        <select
          className="w-full border rounded-lg p-3"
          value={form.attendanceType}
          onChange={(e) =>
            setForm({
              ...form,
              attendanceType: e.target.value,
              employee: "",
              labour: "",
            })
          }
        >
          <option value="EMPLOYEE">
            Employee
          </option>

          <option value="LABOUR">
            Labour
          </option>
        </select>

        {form.attendanceType === "EMPLOYEE" && (

          <select
            className="w-full border rounded-lg p-3"
            value={form.employee}
            onChange={(e) =>
              setForm({
                ...form,
                employee: e.target.value,
              })
            }
          >

            <option value="">
              Select Employee
            </option>

            {employees.map((emp) => (
              <option
                key={emp._id}
                value={emp._id}
              >
                {emp.name} ({emp.role})
              </option>
            ))}

          </select>

        )}

        {form.attendanceType === "LABOUR" && (

          <select
            className="w-full border rounded-lg p-3"
            value={form.labour}
            onChange={(e) =>
              setForm({
                ...form,
                labour: e.target.value,
              })
            }
          >

            <option value="">
              Select Labour
            </option>

            {labours.map((labour) => (
              <option
                key={labour._id}
                value={labour._id}
              >
                {labour.name}
              </option>
            ))}

          </select>

        )}

        <input
          type="date"
          className="w-full border rounded-lg p-3"
          value={form.date}
          onChange={(e) =>
            setForm({
              ...form,
              date: e.target.value,
            })
          }
        />

        <div className="grid grid-cols-2 gap-4">

          <input
            type="time"
            className="border rounded-lg p-3"
            value={form.checkIn}
            onChange={(e) =>
              setForm({
                ...form,
                checkIn: e.target.value,
              })
            }
            placeholder="Check In"
          />

          <input
            type="time"
            className="border rounded-lg p-3"
            value={form.checkOut}
            onChange={(e) =>
              setForm({
                ...form,
                checkOut: e.target.value,
              })
            }
            placeholder="Check Out"
          />

        </div>

        <select
          className="w-full border rounded-lg p-3"
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value,
            })
          }
        >
          <option>Present</option>
          <option>Absent</option>
          <option>Half Day</option>
          <option>Leave</option>
        </select>

        <div className="grid grid-cols-2 gap-4">

          <input
            type="number"
            className="border rounded-lg p-3"
            placeholder="Tasks Assigned"
            value={form.tasksAssigned}
            onChange={(e) =>
              setForm({
                ...form,
                tasksAssigned: Number(
                  e.target.value
                ),
              })
            }
          />

          <input
            type="number"
            className="border rounded-lg p-3"
            placeholder="Tasks Completed"
            value={form.tasksCompleted}
            onChange={(e) =>
              setForm({
                ...form,
                tasksCompleted: Number(
                  e.target.value
                ),
              })
            }
          />

        </div>

        <textarea
          rows={4}
          className="w-full border rounded-lg p-3"
          placeholder="Remarks"
          value={form.remarks}
          onChange={(e) =>
            setForm({
              ...form,
              remarks: e.target.value,
            })
          }
        />

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="border px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-[#172B6B] text-white px-5 py-2 rounded-lg"
          >
            {attendance ? "Update" : "Save"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default AttendanceModal;