import { useEffect, useMemo, useState } from "react";
import {
  FiClock,
  FiEdit3,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  createAttendanceShift,
  deleteAttendanceShift,
  getAttendanceShifts,
  updateAttendanceShift,
} from "../services/attendanceShift.service";

interface AttendanceShift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  graceMinutes: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

interface ShiftForm {
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  status: "ACTIVE" | "INACTIVE";
}

const emptyForm: ShiftForm = {
  name: "",
  startTime: "09:00",
  endTime: "18:00",
  graceMinutes: 0,
  status: "ACTIVE",
};

const calculateDuration = (
  startTime: string,
  endTime: string
) => {
  if (!startTime || !endTime) {
    return 0;
  }

  const [startHour, startMinute] =
    startTime.split(":").map(Number);

  const [endHour, endMinute] =
    endTime.split(":").map(Number);

  let start =
    startHour * 60 + startMinute;

  let end =
    endHour * 60 + endMinute;

  if (end <= start) {
    end += 24 * 60;
  }

  return end - start;
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

const AttendanceShiftPage = () => {
  const [shifts, setShifts] = useState<
    AttendanceShift[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingShift, setEditingShift] =
    useState<AttendanceShift | null>(null);

  const [form, setForm] =
    useState<ShiftForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const durationMinutes = useMemo(
    () =>
      calculateDuration(
        form.startTime,
        form.endTime
      ),
    [form.startTime, form.endTime]
  );

  const loadShifts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAttendanceShifts();

      const records = Array.isArray(response)
        ? response
        : response?.shifts || [];

      setShifts(records);
    } catch (err: any) {
      console.error(
        "Failed to load attendance shifts:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load shifts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const openCreateModal = () => {
    setEditingShift(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (
    shift: AttendanceShift
  ) => {
    setEditingShift(shift);

    setForm({
      name: shift.name || "",
      startTime: shift.startTime || "09:00",
      endTime: shift.endTime || "18:00",
      graceMinutes:
        shift.graceMinutes ?? 0,
      status:
        shift.status || "ACTIVE",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingShift(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Shift name is required.");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError(
        "Start time and end time are required."
      );
      return;
    }

    if (durationMinutes <= 0) {
      setError(
        "Shift duration must be greater than zero."
      );
      return;
    }

    if (form.graceMinutes < 0) {
      setError(
        "Grace period cannot be negative."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        durationMinutes,
        graceMinutes:
          Number(form.graceMinutes),
        status: form.status,
      };

      if (editingShift) {
        await updateAttendanceShift(
          editingShift._id,
          payload
        );

        setSuccess(
          "Shift updated successfully."
        );
      } else {
        await createAttendanceShift(
          payload
        );

        setSuccess(
          "Shift created successfully."
        );
      }

      await loadShifts();

      setModalOpen(false);
      setEditingShift(null);
      setForm(emptyForm);
    } catch (err: any) {
      console.error(
        "Failed to save attendance shift:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save shift."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    shift: AttendanceShift
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${shift.name}"? This cannot be undone.`
      );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteAttendanceShift(
        shift._id
      );

      setSuccess(
        "Shift deleted successfully."
      );

      await loadShifts();
    } catch (err: any) {
      console.error(
        "Failed to delete shift:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete shift."
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#17357A]">
              <FiClock size={16} />
              Attendance
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Shift Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Create and manage working shifts that
              can be assigned individually to employees
              and labours.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadShifts}
              disabled={loading}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <FiRefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#17357A] px-5 text-sm font-semibold text-white transition hover:bg-[#24479d]"
            >
              <FiPlus size={17} />
              Add Shift
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Working Shifts
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {shifts.length}{" "}
                {shifts.length === 1
                  ? "shift"
                  : "shifts"}{" "}
                configured
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <FiRefreshCw
                className="animate-spin"
                size={17}
              />
              Loading shifts...
            </div>
          </div>
        ) : shifts.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FiClock size={24} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No shifts configured
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-400">
              Create your first attendance shift
              to start assigning working hours.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#17357A] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <FiPlus size={15} />
              Add Shift
            </button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Shift
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Working Time
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Duration
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Grace
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {shifts.map((shift) => (
                    <tr
                      key={shift._id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-900">
                          {shift.name}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-slate-700">
                          {shift.startTime}{" "}
                          —{" "}
                          {shift.endTime}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {formatDuration(
                            shift.durationMinutes
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {shift.graceMinutes} min
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-bold
                            ${
                              shift.status ===
                              "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }
                          `}
                        >
                          {shift.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                shift
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-[#17357A]"
                            title="Edit shift"
                          >
                            <FiEdit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                shift
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete shift"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {shifts.map((shift) => (
                <div
                  key={shift._id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {shift.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {shift.startTime} —{" "}
                        {shift.endTime}
                      </p>
                    </div>

                    <span
                      className={`
                        rounded-full
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        ${
                          shift.status ===
                          "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }
                      `}
                    >
                      {shift.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-400">
                        Duration
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {formatDuration(
                          shift.durationMinutes
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-400">
                        Grace
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {shift.graceMinutes} min
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(shift)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600"
                    >
                      <FiEdit3 size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(shift)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 py-2.5 text-sm font-semibold text-red-500"
                    >
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingShift
                    ? "Edit Shift"
                    : "Create Shift"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure working hours and grace
                  period.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Shift Name
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Morning Shift"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#17357A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Start Time
                  </label>

                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        startTime:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#17357A]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    End Time
                  </label>

                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        endTime:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#17357A]"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Calculated shift duration
                  </span>

                  <span className="text-lg font-bold text-[#17357A]">
                    {formatDuration(
                      durationMinutes
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Grace Period
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={form.graceMinutes}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          graceMinutes:
                            Number(
                              e.target.value
                            ),
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-14 text-sm outline-none transition focus:border-[#17357A]"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      min
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status:
                          e.target.value as
                            | "ACTIVE"
                            | "INACTIVE",
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#17357A]"
                  >
                    <option value="ACTIVE">
                      ACTIVE
                    </option>

                    <option value="INACTIVE">
                      INACTIVE
                    </option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-[#17357A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24479d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <FiRefreshCw
                    size={15}
                    className="animate-spin"
                  />
                )}

                {saving
                  ? "Saving..."
                  : editingShift
                  ? "Update Shift"
                  : "Create Shift"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceShiftPage;