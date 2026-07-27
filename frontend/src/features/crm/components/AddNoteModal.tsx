import { useState } from "react";
import { X } from "lucide-react";

import { addCustomerNote } from "../services/customerNote.service";

interface Props {
  open: boolean;
  customerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

type NoteForm = {
  title: string;
  note: string;

  type:
    | "GENERAL"
    | "PAYMENT"
    | "MEETING"
    | "FOLLOW_UP"
    | "COMPLAINT"
    | "PRODUCT";

  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  reminderDate: string;

  completed: boolean;
};

const emptyForm: NoteForm = {
  title: "",
  note: "",
  type: "GENERAL",
  priority: "MEDIUM",
  reminderDate: "",
  completed: false,
};

const AddNoteModal = ({
  open,
  customerId,
  onClose,
  onSuccess,
}: Props) => {

  const [form, setForm] =
    useState<NoteForm>(emptyForm);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      await addCustomerNote(
        customerId,
        form
      );

      setForm(emptyForm);

      onSuccess();

      onClose();

    } catch (err) {

      console.error(err);

    }

  };

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              Add CRM Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record a meeting, follow-up, payment or customer note.
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-semibold">
                Activity Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border px-4"
              >
                <option value="GENERAL">General</option>
                <option value="MEETING">Meeting</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="PAYMENT">Payment</option>
                <option value="PRODUCT">Product</option>
                <option value="COMPLAINT">Complaint</option>
              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold">
                Priority
              </label>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border px-4"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>

            </div>

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold">
                Title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Meeting regarding Diwali collection..."
                className="h-12 w-full rounded-xl border px-4"
              />

            </div>

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold">
                Notes
              </label>

              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                rows={6}
                placeholder="Write everything discussed with the customer..."
                className="w-full rounded-xl border p-4"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold">
                Reminder Date
              </label>

              <input
                type="date"
                name="reminderDate"
                value={form.reminderDate}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border px-4"
              />

            </div>

          </div>

          <div className="flex justify-end gap-3 border-t pt-6">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-6 py-3 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[#172B6B] px-6 py-3 font-semibold text-white hover:bg-[#20398F]"
            >
              Save Activity
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default AddNoteModal;