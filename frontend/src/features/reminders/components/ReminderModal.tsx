import { useEffect, useState } from "react";

import {
  createReminder,
  updateReminder,
} from "../services/reminder.service";

interface Props {
  open: boolean;

  editReminder?: any;

  onClose: () => void;

  onSuccess: () => void;
}

const ReminderModal = ({
  open,
  editReminder,
  onClose,
  onSuccess,
}: Props) => {
  const [saving, setSaving] =
    useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    module: "ACCOUNTS",
    relatedId: "",
    assignedTo: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  useEffect(() => {
    if (editReminder) {
      setForm({
        title: editReminder.title,
        description:
          editReminder.description || "",
        module: editReminder.module,
        relatedId:
          editReminder.relatedId || "",
        assignedTo:
          editReminder.assignedTo?._id ||
          "",
        priority: editReminder.priority,
        dueDate:
          editReminder.dueDate?.slice(0, 10) ||
          "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        module: "ACCOUNTS",
        relatedId: "",
        assignedTo: "",
        priority: "MEDIUM",
        dueDate: "",
      });
    }
  }, [editReminder, open]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert("Please enter reminder title.");
      return;
    }

    if (!form.dueDate) {
      alert("Please select due date.");
      return;
    }

    try {
      setSaving(true);

      if (editReminder) {
        await updateReminder(
          editReminder._id,
          form
        );
      } else {
        await createReminder(form);
      }

      onSuccess();
    } catch (error) {
      console.error(error);

      alert("Failed to save reminder.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-slate-950/45
        p-3
        backdrop-blur-[2px]
        sm:p-5
      "
    >
      <div
        className="
          flex
          max-h-[calc(100vh-24px)]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-[0_20px_60px_rgba(15,23,42,0.18)]
          sm:max-h-[calc(100vh-40px)]
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            shrink-0
            border-b
            border-slate-100
            px-4
            py-4
            sm:px-6
            sm:py-5
          "
        >
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.1em]
              text-[#17357A]
            "
          >
            Reminder
          </p>

          <h2
            className="
              mt-1
              text-lg
              font-bold
              tracking-tight
              text-slate-900
              sm:text-xl
            "
          >
            {editReminder
              ? "Edit Reminder"
              : "Add Reminder"}
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-slate-400
              sm:text-sm
            "
          >
            {editReminder
              ? "Update the reminder details below."
              : "Create a reminder for an upcoming task."}
          </p>
        </div>

        {/* =====================================================
            BODY
        ===================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-4
            py-4
            sm:px-6
            sm:py-5
          "
        >
          <div className="space-y-4">

            {/* TITLE */}

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-slate-600
                "
              >
                Reminder Title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter reminder title"
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  hover:border-slate-300
                  focus:border-[#17357A]
                  focus:ring-2
                  focus:ring-[#17357A]/10
                "
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-slate-600
                "
              >
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Add some context for this reminder..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  py-3
                  text-sm
                  leading-5
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  hover:border-slate-300
                  focus:border-[#17357A]
                  focus:ring-2
                  focus:ring-[#17357A]/10
                "
              />
            </div>

            {/* MODULE + PRIORITY */}

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-semibold
                    text-slate-600
                  "
                >
                  Module
                </label>

                <select
                  name="module"
                  value={form.module}
                  onChange={handleChange}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3
                    text-sm
                    font-medium
                    text-slate-700
                    outline-none
                    transition
                    hover:border-slate-300
                    focus:border-[#17357A]
                    focus:ring-2
                    focus:ring-[#17357A]/10
                  "
                >
                  <option value="ACCOUNTS">
                    Accounts
                  </option>

                  <option value="CRM">
                    CRM
                  </option>
                </select>
              </div>

              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-semibold
                    text-slate-600
                  "
                >
                  Priority
                </label>

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3
                    text-sm
                    font-medium
                    text-slate-700
                    outline-none
                    transition
                    hover:border-slate-300
                    focus:border-[#17357A]
                    focus:ring-2
                    focus:ring-[#17357A]/10
                  "
                >
                  <option value="LOW">
                    Low
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="HIGH">
                    High
                  </option>
                </select>
              </div>
            </div>

            {/* DUE DATE */}

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-slate-600
                "
              >
                Due Date
              </label>

              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  transition
                  hover:border-slate-300
                  focus:border-[#17357A]
                  focus:ring-2
                  focus:ring-[#17357A]/10
                "
              />
            </div>

          </div>
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div
          className="
            flex
            shrink-0
            flex-col-reverse
            gap-2
            border-t
            border-slate-100
            bg-slate-50/50
            px-4
            py-3
            sm:flex-row
            sm:justify-end
            sm:px-6
            sm:py-4
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              h-10
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:border-slate-300
              hover:bg-slate-50
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:w-auto
            "
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="
              h-10
              w-full
              rounded-xl
              bg-[#17357A]
              px-5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#10295d]
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:w-auto
            "
          >
            {saving
              ? "Saving..."
              : editReminder
                ? "Update Reminder"
                : "Create Reminder"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;