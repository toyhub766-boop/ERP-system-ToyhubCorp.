import { useEffect, useState } from "react";
import {
  createLabour,
  updateLabour,
} from "../services/labour.service";
import {
  getAttendanceShifts,
} from "../../attendance/services/attendanceShift.service";

interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  graceMinutes: number;
  status: "ACTIVE" | "INACTIVE";
}

interface Props {
  open: boolean;
  labour?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const LabourModal = ({
  open,
  labour,
  onClose,
  onSuccess,
}: Props) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    department: "",
    dailyWage: 0,
    phone: "",
    status: "ACTIVE",
    wageType: "DAILY",
    wageAmount: 0,
    attendanceShift: "",
  });

  useEffect(() => {
    if (!open) return;

    if (labour) {
      setForm({
        name: labour.name || "",
        department: labour.department || "",
        dailyWage: labour.dailyWage || 0,
        phone: labour.phone || "",
        status: labour.status || "ACTIVE",
        wageType: labour.wageType || "DAILY",
        wageAmount:
          labour.wageAmount ??
          labour.dailyWage ??
          0,
        attendanceShift:
          typeof labour.attendanceShift === "object"
            ? labour.attendanceShift?._id || ""
            : labour.attendanceShift || "",
      });
    } else {
      setForm({
        name: "",
        department: "",
        dailyWage: 0,
        phone: "",
        status: "ACTIVE",
        wageType: "DAILY",
        wageAmount: 0,
        attendanceShift: "",
      });
    }
  }, [labour, open]);

  useEffect(() => {
    if (!open) return;

    const loadShifts = async () => {
      try {
        setLoadingShifts(true);

        const data = await getAttendanceShifts();

        setShifts(
          Array.isArray(data)
            ? data.filter(
                (shift: Shift) =>
                  shift.status === "ACTIVE"
              )
            : data?.shifts?.filter(
                (shift: Shift) =>
                  shift.status === "ACTIVE"
              ) || []
        );
      } catch (error) {
        console.error(
          "Failed to load attendance shifts:",
          error
        );
      } finally {
        setLoadingShifts(false);
      }
    };

    loadShifts();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.name.trim()) return;

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        department: form.department.trim(),
        phone: form.phone.trim(),
        status: form.status,
        wageType: form.wageType,
        wageAmount: Number(form.wageAmount),
        dailyWage:
          form.wageType === "DAILY"
            ? Number(form.wageAmount)
            : Number(form.dailyWage),
        attendanceShift:
          form.attendanceShift || null,
      };

      if (labour) {
        await updateLabour(
          labour._id,
          payload
        );
      } else {
        await createLabour(payload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(
        "Failed to save labour:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-2xl font-bold text-slate-900">
            {labour
              ? "Edit Labour"
              : "Add Labour"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage labour information, wages and attendance shift.
          </p>
        </div>

        <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Labour Name
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              placeholder="Enter labour name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Department
            </label>

            <input
              value={form.department}
              onChange={(e) =>
                setForm({
                  ...form,
                  department: e.target.value,
                })
              }
              placeholder="Production"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Phone Number
            </label>

            <input
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              placeholder="9876543210"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Wage Type
              </label>

              <select
                value={form.wageType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    wageType: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
              >
                <option value="DAILY">
                  Daily
                </option>

                <option value="MONTHLY">
                  Monthly
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Wage Amount
              </label>

              <input
                type="number"
                min="0"
                value={form.wageAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    wageAmount: Number(
                      e.target.value
                    ),
                  })
                }
                placeholder="0"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Attendance Shift
            </label>

            <select
              value={form.attendanceShift}
              onChange={(e) =>
                setForm({
                  ...form,
                  attendanceShift:
                    e.target.value,
                })
              }
              disabled={loadingShifts}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A] disabled:bg-slate-100"
            >
              <option value="">
                {loadingShifts
                  ? "Loading shifts..."
                  : "No shift assigned"}
              </option>

              {shifts.map((shift) => (
                <option
                  key={shift._id}
                  value={shift._id}
                >
                  {shift.name} —{" "}
                  {shift.startTime} to{" "}
                  {shift.endTime}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
              >
                <option value="ACTIVE">
                  ACTIVE
                </option>

                <option value="INACTIVE">
                  INACTIVE
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Shift Hours
              </label>

              <div className="flex h-[50px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                {form.attendanceShift
                  ? (() => {
                      const shift =
                        shifts.find(
                          (item) =>
                            item._id ===
                            form.attendanceShift
                        );

                      if (!shift) {
                        return "—";
                      }

                      return `${Math.floor(
                        shift.durationMinutes / 60
                      )}h ${
                        shift.durationMinutes % 60
                      }m`;
                    })()
                  : "No shift"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-300 px-5 py-3 font-medium transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              saving ||
              !form.name.trim()
            }
            className="rounded-xl bg-[#17357A] px-6 py-3 font-medium text-white transition hover:bg-[#24479d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : labour
              ? "Update Labour"
              : "Save Labour"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabourModal;