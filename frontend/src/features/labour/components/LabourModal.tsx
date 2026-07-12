import { useEffect, useState } from "react";

import {
  createLabour,
  updateLabour,
} from "../services/labour.service";

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
  const [form, setForm] = useState({
    name: "",
    department: "",
    dailyWage: 0,
    phone: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (labour) {
      setForm({
        name: labour.name,
        department: labour.department,
        dailyWage: labour.dailyWage,
        phone: labour.phone || "",
        status: labour.status,
      });
    } else {
      setForm({
        name: "",
        department: "",
        dailyWage: 0,
        phone: "",
        status: "ACTIVE",
      });
    }
  }, [labour, open]);

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      if (labour) {
        await updateLabour(labour._id, form);
      } else {
        await createLabour(form);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">

    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">

      {/* Header */}

      <div className="border-b border-slate-200 px-6 py-5">

        <h2 className="text-2xl font-bold text-slate-900">
          {labour ? "Edit Labour" : "Add Labour"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage labour information and daily wages.
        </p>

      </div>

      {/* Body */}

      <div className="space-y-5 p-6">

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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Daily Wage
            </label>

            <input
              type="number"
              value={form.dailyWage}
              onChange={(e) =>
                setForm({
                  ...form,
                  dailyWage: Number(e.target.value),
                })
              }
              placeholder="0"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
            />
          </div>

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
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

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

      </div>

      {/* Footer */}

      <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">

        <button
          onClick={onClose}
          className="rounded-xl border border-slate-300 px-5 py-3 font-medium transition hover:bg-slate-100"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="rounded-xl bg-[#17357A] px-6 py-3 font-medium text-white transition hover:bg-[#24479d]"
        >
          {labour ? "Update Labour" : "Save Labour"}
        </button>

      </div>

    </div>

  </div>
);
};

export default LabourModal;