import { useEffect, useState } from "react";
import {
  FiCheck,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  createTask,
  updateTask,
} from "../services/task.service";

interface ChecklistItem {
  _id?: string;
  text: string;
  completed: boolean;
}

interface Task {
  _id?: string;
  title: string;
  description?: string;
  assignedTo?: any;
  priority: "Low" | "Medium" | "High";
  dueDate?: string;
  remarks?: string;
  completed: boolean;
  checklist: ChecklistItem[];
}

interface Props {
  open: boolean;
  task?: Task | null;

  // Selected user comes from the parent workspace.
  assignedTo: string;

  onClose: () => void;
  onSuccess: () => void;
}

const TaskModal = ({
  open,
  task,
  assignedTo,
  onClose,
  onSuccess,
}: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState<"Low" | "Medium" | "High">(
      "Medium"
    );

  const [dueDate, setDueDate] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  const [completed, setCompleted] =
    useState(false);

  const [checklist, setChecklist] =
    useState<ChecklistItem[]>([]);

  const [newChecklistItem, setNewChecklistItem] =
    useState("");

  useEffect(() => {
    if (!task) {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");
      setRemarks("");
      setCompleted(false);
      setChecklist([]);

      return;
    }

    setTitle(task.title || "");
    setDescription(task.description || "");
    setPriority(task.priority || "Medium");

    setDueDate(
      task.dueDate
        ? task.dueDate.substring(0, 10)
        : ""
    );

    setRemarks(task.remarks || "");
    setCompleted(task.completed || false);

    setChecklist(
      task.checklist || []
    );
  }, [task, open]);

  const addChecklistItem = () => {
    const text =
      newChecklistItem.trim();

    if (!text) return;

    setChecklist((previous) => [
      ...previous,
      {
        text,
        completed: false,
      },
    ]);

    setNewChecklistItem("");
  };

  const toggleChecklistItem = (
    index: number
  ) => {
    setChecklist((previous) =>
      previous.map((item, i) =>
        i === index
          ? {
              ...item,
              completed:
                !item.completed,
            }
          : item
      )
    );
  };

  const removeChecklistItem = (
    index: number
  ) => {
    setChecklist((previous) =>
      previous.filter(
        (_, i) => i !== index
      )
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Task title is required.");
      return;
    }

    if (!assignedTo) {
      alert("No user selected.");
      return;
    }

    const payload = {
      title: title.trim(),
      description,
      assignedTo,
      priority,
      dueDate: dueDate || null,
      remarks,
      completed,
      checklist,
    };

    try {
      if (task?._id) {
        await updateTask(
          task._id,
          payload
        );
      } else {
        await createTask(payload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to save task."
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-start justify-between border-b border-slate-200 px-7 py-6">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {task
                ? "Edit Task"
                : "Add Task"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage work for the selected user.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX size={20} />
          </button>

        </div>

        {/* Body */}

        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-7 py-6">

          {/* Task completion */}

          <div
            className={`flex items-center justify-between rounded-2xl border p-4 ${
              completed
                ? "border-green-200 bg-green-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >

            <div>
              <p className="font-semibold text-slate-900">
                Task completed
              </p>

              <p className="text-sm text-slate-500">
                Marking this complete will count it toward the user's performance score.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setCompleted(
                  !completed
                )
              }
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                completed
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-slate-300 bg-white"
              }`}
            >
              {completed && (
                <FiCheck size={17} />
              )}
            </button>

          </div>

          {/* Title */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Task Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="What needs to be done?"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A] focus:ring-2 focus:ring-[#17357A]/10"
            />
          </div>

          {/* Description */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Add more details..."
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A] focus:ring-2 focus:ring-[#17357A]/10"
            />
          </div>

          {/* Checklist */}

          <div>

            <div className="mb-3 flex items-center justify-between">

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Checklist
                </label>

                <p className="text-xs text-slate-400">
                  Break the task into smaller steps.
                </p>
              </div>

            </div>

            <div className="space-y-2">

              {checklist.map(
                (item, index) => (
                  <div
                    key={
                      item._id ||
                      index
                    }
                    className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2"
                  >

                    <button
                      type="button"
                      onClick={() =>
                        toggleChecklistItem(
                          index
                        )
                      }
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        item.completed
                          ? "border-[#17357A] bg-[#17357A] text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {item.completed && (
                        <FiCheck
                          size={13}
                        />
                      )}
                    </button>

                    <span
                      className={`flex-1 text-sm ${
                        item.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-700"
                      }`}
                    >
                      {item.text}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeChecklistItem(
                          index
                        )
                      }
                      className="text-slate-400 hover:text-red-600"
                    >
                      <FiTrash2
                        size={16}
                      />
                    </button>

                  </div>
                )
              )}

              {/* Add checklist item */}

              <div className="flex gap-2">

                <input
                  value={
                    newChecklistItem
                  }
                  onChange={(e) =>
                    setNewChecklistItem(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      e.preventDefault();
                      addChecklistItem();
                    }
                  }}
                  placeholder="Add checklist item..."
                  className="flex-1 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#17357A]"
                />

                <button
                  type="button"
                  onClick={
                    addChecklistItem
                  }
                  className="flex items-center gap-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  <FiPlus />
                  Add
                </button>

              </div>

            </div>
          </div>

          {/* Priority + Due date */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value as
                      | "Low"
                      | "Medium"
                      | "High"
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              >
                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Due Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              />
            </div>

          </div>

          {/* Remarks */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Remarks
            </label>

            <textarea
              rows={3}
              value={remarks}
              onChange={(e) =>
                setRemarks(
                  e.target.value
                )
              }
              placeholder="Additional remarks..."
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none"
            />
          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-200 px-7 py-5">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-xl bg-[#17357A] px-6 py-2.5 font-semibold text-white hover:bg-[#21469E]"
          >
            {task
              ? "Save Changes"
              : "Create Task"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default TaskModal;