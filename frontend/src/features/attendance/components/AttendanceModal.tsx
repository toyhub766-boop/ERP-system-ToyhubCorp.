import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  FileText,
  ImagePlus,
  UserRound,
  UsersRound,
  X,
  Check,
} from "lucide-react";

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

  const [saving, setSaving] =
    useState(false);

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
          attendance.attendanceType ||
          "EMPLOYEE",

        employee:
          attendance.employee?._id || "",

        labour:
          attendance.labour?._id || "",

        date:
          attendance.date?.substring(0, 10) ||
          "",

        checkIn:
          attendance.checkIn || "",

        checkOut:
          attendance.checkOut || "",

        status:
          attendance.status || "Present",

        tasksAssigned:
          attendance.tasksAssigned || 0,

        tasksCompleted:
          attendance.tasksCompleted || 0,

        remarks:
          attendance.remarks || "",
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

  useEffect(() => {
    if (!open) return;

    const fetchEmployees =
      async () => {
        try {
          const { data } =
            await api.get(
              "/users/attendance-users"
            );

          setEmployees(data);
        } catch (err) {
          console.error(err);
        }
      };

    const fetchLabours =
      async () => {
        try {
          const { data } =
            await api.get(
              "/labour/active"
            );

          setLabours(data);
        } catch (err) {
          console.error(err);
        }
      };

    fetchEmployees();
    fetchLabours();
  }, [open]);

  const handleSubmit = async () => {
    if (
      form.attendanceType ===
        "EMPLOYEE" &&
      !form.employee
    ) {
      return alert(
        "Please select an employee."
      );
    }

    if (
      form.attendanceType === "LABOUR" &&
      !form.labour
    ) {
      return alert(
        "Please select a labour."
      );
    }

    if (!form.date) {
      return alert(
        "Please select a date."
      );
    }

    if (!form.checkIn) {
      return alert(
        "Please enter check-in time."
      );
    }

    if (!form.checkOut) {
      return alert(
        "Please enter check-out time."
      );
    }

    if (form.tasksAssigned < 0) {
      return alert(
        "Tasks assigned cannot be negative."
      );
    }

    if (form.tasksCompleted < 0) {
      return alert(
        "Tasks completed cannot be negative."
      );
    }

    if (
      form.tasksCompleted >
      form.tasksAssigned
    ) {
      return alert(
        "Completed tasks cannot exceed assigned tasks."
      );
    }

    try {
      setSaving(true);

      const formData =
        new FormData();

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
        String(
          form.tasksAssigned
        )
      );

      formData.append(
        "tasksCompleted",
        String(
          form.tasksCompleted
        )
      );

      formData.append(
        "remarks",
        form.remarks
      );

      if (
        form.attendanceType ===
          "EMPLOYEE" &&
        form.employee
      ) {
        formData.append(
          "employee",
          form.employee
        );
      }

      if (
        form.attendanceType ===
          "LABOUR" &&
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
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const inputClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-800 outline-none transition hover:border-slate-300 hover:bg-white focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-[#17357A]/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-5">

      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="shrink-0 border-b border-slate-100 px-5 py-5 sm:px-7">

          <div className="flex items-start justify-between gap-4">

            <div className="flex min-w-0 items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#17357A]/10 text-[#17357A]">
                <CalendarDays
                  size={21}
                />
              </div>

              <div className="min-w-0">

                <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {attendance
                    ? "Edit Attendance"
                    : "Add Attendance"}
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                  Record attendance, working
                  hours and productivity.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            >
              <X size={19} />
            </button>

          </div>

        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#FBFCFE] px-5 py-6 sm:px-7">

          <div className="space-y-5">

            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">

              <div className="mb-5 flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <UserRound
                    size={17}
                  />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Basic Information
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Select who this attendance
                    record belongs to.
                  </p>

                </div>

              </div>

              {/* Attendance type */}

              <div className="mb-5">

                <label className={labelClass}>
                  Attendance Type
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        attendanceType:
                          "EMPLOYEE",
                        employee: "",
                        labour: "",
                      })
                    }
                    className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                      form.attendanceType ===
                      "EMPLOYEE"
                        ? "border-[#17357A] bg-[#17357A] text-white shadow-[0_5px_14px_rgba(23,53,122,0.15)]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <UserRound
                      size={16}
                    />
                    Employee
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        attendanceType:
                          "LABOUR",
                        employee: "",
                        labour: "",
                      })
                    }
                    className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                      form.attendanceType ===
                      "LABOUR"
                        ? "border-[#17357A] bg-[#17357A] text-white shadow-[0_5px_14px_rgba(23,53,122,0.15)]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <UsersRound
                      size={16}
                    />
                    Labour
                  </button>

                </div>

              </div>

              {/* Person */}

              {form.attendanceType ===
                "EMPLOYEE" && (
                <div>

                  <label
                    className={labelClass}
                  >
                    Employee
                  </label>

                  <select
                    className={inputClass}
                    value={form.employee}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        employee:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select Employee
                    </option>

                    {employees.map(
                      (emp) => (
                        <option
                          key={emp._id}
                          value={emp._id}
                        >
                          {emp.name} (
                          {emp.role})
                        </option>
                      )
                    )}
                  </select>

                </div>
              )}

              {form.attendanceType ===
                "LABOUR" && (
                <div>

                  <label
                    className={labelClass}
                  >
                    Labour
                  </label>

                  <select
                    className={inputClass}
                    value={form.labour}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        labour:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select Labour
                    </option>

                    {labours.map(
                      (labour) => (
                        <option
                          key={labour._id}
                          value={labour._id}
                        >
                          {labour.name}
                        </option>
                      )
                    )}
                  </select>

                </div>
              )}

            </section>

            {/* =================================================
                ATTENDANCE DETAILS
            ================================================= */}

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">

              <div className="mb-5 flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#17357A]">
                  <Clock3
                    size={17}
                  />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Attendance Details
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Record date, working hours
                    and attendance status.
                  </p>

                </div>

              </div>

              <div className="space-y-5">

                <div>

                  <label
                    className={labelClass}
                  >
                    Date
                  </label>

                  <input
                    type="date"
                    className={inputClass}
                    value={form.date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>

                    <label
                      className={labelClass}
                    >
                      Check In
                    </label>

                    <input
                      type="time"
                      className={inputClass}
                      value={
                        form.checkIn
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          checkIn:
                            e.target.value,
                        })
                      }
                    />

                  </div>

                  <div>

                    <label
                      className={labelClass}
                    >
                      Check Out
                    </label>

                    <input
                      type="time"
                      className={inputClass}
                      value={
                        form.checkOut
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          checkOut:
                            e.target.value,
                        })
                      }
                    />

                  </div>

                </div>

                <div>

                  <label
                    className={labelClass}
                  >
                    Attendance Status
                  </label>

                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status:
                          e.target.value,
                      })
                    }
                  >
                    <option>
                      Present
                    </option>

                    <option>
                      Absent
                    </option>

                    <option>
                      Half Day
                    </option>

                    <option>
                      Leave
                    </option>
                  </select>

                </div>

              </div>

            </section>

            {/* =================================================
                PRODUCTIVITY
            ================================================= */}

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">

              <div className="mb-5 flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Check
                    size={17}
                  />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Productivity
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Track assigned and completed
                    work.
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label
                    className={labelClass}
                  >
                    Tasks Assigned
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.tasksAssigned
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tasksAssigned:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                    placeholder="0"
                    className={inputClass}
                  />

                </div>

                <div>

                  <label
                    className={labelClass}
                  >
                    Tasks Completed
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.tasksCompleted
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tasksCompleted:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                    placeholder="0"
                    className={inputClass}
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                PHOTO
            ================================================= */}

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">

              <div className="mb-5 flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <ImagePlus
                    size={17}
                  />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Attendance Photo
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Attach a photo to support the
                    attendance record.
                  </p>

                </div>

              </div>

              <label className="group flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-5 text-center transition hover:border-[#17357A]/40 hover:bg-[#17357A]/[0.025]">

                <ImagePlus
                  size={23}
                  className="mb-2 text-slate-400 transition group-hover:text-[#17357A]"
                />

                <p className="text-sm font-semibold text-slate-700">
                  Choose attendance photo
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  JPG, PNG or other image
                </p>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (!file) return;

                    setPhoto(file);

                    setPhotoPreview(
                      URL.createObjectURL(
                        file
                      )
                    );
                  }}
                />

              </label>

              {photoPreview && (
                <div className="mt-4 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">

                  <img
                    src={photoPreview}
                    alt="Attendance"
                    className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
                  />

                  <div className="min-w-0">

                    <p className="text-sm font-semibold text-slate-800">
                      Photo attached
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Attendance evidence
                    </p>

                  </div>

                </div>
              )}

            </section>

            {/* =================================================
                REMARKS
            ================================================= */}

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">

              <div className="mb-5 flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <FileText
                    size={17}
                  />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Additional Remarks
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Add any relevant notes.
                  </p>

                </div>

              </div>

              <textarea
                rows={4}
                value={form.remarks}
                onChange={(e) =>
                  setForm({
                    ...form,
                    remarks:
                      e.target.value,
                  })
                }
                placeholder="Write remarks here..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-[#17357A]/10"
              />

            </section>

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">

          <p className="hidden text-xs text-slate-400 sm:block">
            All required attendance details
            must be completed.
          </p>

          <div className="flex w-full gap-3 sm:w-auto">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 sm:flex-none"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#17357A] px-6 text-sm font-semibold text-white shadow-[0_5px_16px_rgba(23,53,122,0.16)] transition hover:bg-[#10295D] hover:shadow-[0_7px_20px_rgba(23,53,122,0.22)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >

              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  {attendance
                    ? "Update Attendance"
                    : "Save Attendance"}
                </>
              )}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AttendanceModal;