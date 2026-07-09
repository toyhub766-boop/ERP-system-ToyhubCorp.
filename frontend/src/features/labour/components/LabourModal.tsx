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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[500px] p-6 space-y-4">

        <h2 className="text-2xl font-bold">
          {labour ? "Edit Labour" : "Add Labour"}
        </h2>

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Department"
          value={form.department}
          onChange={(e) =>
            setForm({
              ...form,
              department: e.target.value,
            })
          }
        />

        <input
          type="number"
          className="w-full border rounded-lg p-3"
          placeholder="Daily Wage"
          value={form.dailyWage}
          onChange={(e) =>
            setForm({
              ...form,
              dailyWage: Number(e.target.value),
            })
          }
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value,
            })
          }
        />

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
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>

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
            {labour ? "Update" : "Save"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default LabourModal;