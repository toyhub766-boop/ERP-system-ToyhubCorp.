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

  const [photo, setPhoto] =
    useState<File | null>(null);

  const [photoPreview, setPhotoPreview] =
    useState("");

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
      setPhoto(null);

      setPhotoPreview(
        attendance.photo || ""
      );
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
      setPhoto(null);
      setPhotoPreview("");
    }
  }, [attendance]);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get("/users/attendance-users");

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
    if (
      form.attendanceType === "EMPLOYEE" &&
      !form.employee
    ) {
      return alert("Please select an employee.");
    }

    if (
      form.attendanceType === "LABOUR" &&
      !form.labour
    ) {
      return alert("Please select a labour.");
    }

    if (!form.date) {
      return alert("Please select a date.");
    }

    if (!form.checkIn) {
      return alert("Please enter check-in time.");
    }

    if (!form.checkOut) {
      return alert("Please enter check-out time.");
    }

    if (form.tasksAssigned < 0) {
      return alert("Tasks assigned cannot be negative.");
    }

    if (form.tasksCompleted < 0) {
      return alert("Tasks completed cannot be negative.");
    }

    if (form.tasksCompleted > form.tasksAssigned) {
      return alert(
        "Completed tasks cannot exceed assigned tasks."
      );
    }

    try {
      const formData = new FormData();

      formData.append(
        "attendanceType",
        form.attendanceType
      );

      formData.append(
        "date",
        form.date
      );

      formData.append(
        "checkIn",
        form.checkIn
      );

      formData.append(
        "checkOut",
        form.checkOut
      );

      formData.append(
        "status",
        form.status
      );

      formData.append(
        "tasksAssigned",
        String(form.tasksAssigned)
      );

      formData.append(
        "tasksCompleted",
        String(form.tasksCompleted)
      );

      formData.append(
        "remarks",
        form.remarks
      );

      if (
        form.attendanceType === "EMPLOYEE" &&
        form.employee
      ) {
        formData.append(
          "employee",
          form.employee
        );
      }

      if (
        form.attendanceType === "LABOUR" &&
        form.labour
      ) {
        formData.append(
          "labour",
          form.labour
        );
      }

      if (photo) {
        formData.append(
          "photo",
          photo
        );
      }

      if (attendance) {
        await updateAttendance(
          attendance._id,
          formData
        );
      } else {
        await createAttendance(
          formData
        );
      }

      onSuccess();
      onClose();

    } catch (err) {
      console.error(
        "Attendance save error:",
        err
      );

      alert(
        "Failed to save attendance."
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

      <div
        className="
        w-full
        max-w-2xl
        max-h-[92vh]
        overflow-hidden
        rounded-3xl
        bg-white
        shadow-2xl
      "
      >

        {/* Header */}

        <div className="border-b border-slate-200 px-8 py-6">

          <h2 className="text-2xl font-bold text-slate-900">

            {attendance
              ? "Edit Attendance"
              : "Add Attendance"}

          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Record employee or labour attendance with work details.
          </p>

        </div>

        {/* Body */}

        <div className="max-h-[70vh] overflow-y-auto px-8 py-7">

          <div className="space-y-7">

            {/* ================= BASIC INFORMATION ================= */}

            <div className="space-y-5">

              <div>

                <h3 className="text-base font-semibold text-slate-800">
                  Basic Information
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Choose the attendance type and person.
                </p>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Attendance Type
                </label>

                <select
                  className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  text-sm
                  transition
                  focus:border-[#172B6B]
                  focus:outline-none
                  focus:ring-4
                  focus:ring-blue-100
                "
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

              </div>

              {form.attendanceType === "EMPLOYEE" && (

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Employee
                  </label>

                  <select
                    className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-4
                    text-sm
                    transition
                    focus:border-[#172B6B]
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-100
                  "
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

                </div>

              )}

              {form.attendanceType === "LABOUR" && (

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Labour
                  </label>

                  <select
                    className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-4
                    text-sm
                    transition
                    focus:border-[#172B6B]
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-100
                  "
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

                </div>

              )}

            </div>

            {/* ================= ATTENDANCE DETAILS ================= */}

            <div className="space-y-5">

              <div>

                <h3 className="text-base font-semibold text-slate-800">
                  Attendance Details
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Fill in attendance timings and working status.
                </p>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Date
                </label>

                <input
                  type="date"
                  className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  text-sm
                  transition
                  focus:border-[#172B6B]
                  focus:outline-none
                  focus:ring-4
                  focus:ring-blue-100
                "
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                />

              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Check In
                  </label>

                  <input
                    type="time"
                    className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    text-sm
                    transition
                    focus:border-[#172B6B]
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-100
                  "
                    value={form.checkIn}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        checkIn: e.target.value,
                      })
                    }
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Check Out
                  </label>

                  <input
                    type="time"
                    className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    text-sm
                    transition
                    focus:border-[#172B6B]
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-100
                  "
                    value={form.checkOut}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        checkOut: e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Attendance Status
                </label>

                <select
                  className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  text-sm
                  transition
                  focus:border-[#172B6B]
                  focus:outline-none
                  focus:ring-4
                  focus:ring-blue-100
                "
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

              </div>

            </div>

            {/* ================= PRODUCTIVITY ================= */}

            <div className="space-y-5">

              <div>

                <h3 className="text-base font-semibold text-slate-800">
                  Productivity
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Track assigned work and completed work.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tasks Assigned
                  </label>

                  <input
                    type="number"
                    value={form.tasksAssigned}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tasksAssigned: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                    className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    text-sm
                    transition
                    focus:border-[#172B6B]
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-100
                  "
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tasks Completed
                  </label>

                  <input
                    type="number"
                    value={form.tasksCompleted}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tasksCompleted: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                    className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    text-sm
                    transition
                    focus:border-[#172B6B]
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-100
                  "
                  />

                </div>

              </div>

            </div>

            {/* ================= REMARKS ================= */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Attendance Photo
              </label>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (!file) return;

                  setPhoto(file);

                  setPhotoPreview(
                    URL.createObjectURL(file)
                  );
                }}
                className="w-full rounded-xl border border-slate-300 p-3"
              />

              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Attendance"
                  className="mt-4 h-40 w-40 rounded-xl border object-cover"
                />
              )}
            </div>

            <div className="space-y-4">

              <div>

                <h3 className="text-base font-semibold text-slate-800">
                  Additional Remarks
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add any notes related to this attendance record.
                </p>

              </div>

              <textarea
                rows={5}
                value={form.remarks}
                onChange={(e) =>
                  setForm({
                    ...form,
                    remarks: e.target.value,
                  })
                }
                placeholder="Write remarks here..."
                className="
                w-full
                rounded-xl
                border
                border-slate-300
                px-4
                py-3
                text-sm
                resize-none
                transition
                focus:border-[#172B6B]
                focus:outline-none
                focus:ring-4
                focus:ring-blue-100
              "
              />

            </div>

          </div>

        </div>

        {/* ================= FOOTER ================= */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-8 py-5 sm:flex-row sm:justify-end">

          <button
            onClick={onClose}
            className="
            h-11
            rounded-xl
            border
            border-slate-300
            bg-white
            px-6
            text-sm
            font-medium
            text-slate-700
            transition
            hover:bg-slate-100
          "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="
            h-11
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
            {attendance ? "Update Attendance" : "Save Attendance"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default AttendanceModal;