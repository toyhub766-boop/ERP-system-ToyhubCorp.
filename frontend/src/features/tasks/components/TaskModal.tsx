import { useEffect, useState } from "react";
import api from "../../../services/api/axios";
import {
  createTask,
  updateTask,
} from "../services/task.service";

interface Props {
  open: boolean;
  task?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const TaskModal = ({
  open,
  task,
  onClose,
  onSuccess,
}: Props) => {
  const [users, setUsers] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    assignedBy: JSON.parse(
      localStorage.getItem("user") || "{}"
    ).id,
    priority: "Medium",
    status: "Pending",
    dueDate: "",
    remarks: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || "",
        assignedTo: task.assignedTo?._id,
        assignedBy: task.assignedBy?._id,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate?.substring(0, 10) || "",
        remarks: task.remarks || "",
      });
    }
  }, [task]);

  const fetchUsers = async () => {
    const { data } = await api.get(
      "/users/attendance-users"
    );

    setUsers(data);
  };

  const handleSubmit = async () => {
    console.log(form);
    if (!form.title)
      return alert("Task title required");

    if (!form.assignedTo)
      return alert("Assign a user");

    if (task) {
      await updateTask(task._id, form);
    } else {
      await createTask(form);
    }


    onSuccess();
    onClose();
  };

  if (!open) return null;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

    <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">

      {/* Header */}

      <div className="border-b border-slate-200 px-8 py-6">

        <h2 className="text-2xl font-bold text-slate-900">
          {task ? "Edit Task" : "Assign Task"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Assign work, manage priorities and track employee progress.
        </p>

      </div>

      {/* Body */}

      <div className="space-y-6 p-8">

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Task Title
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
            placeholder="Enter task title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
            placeholder="Task description..."
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Assign Employee
          </label>

          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
            value={form.assignedTo}
            onChange={(e) =>
              setForm({
                ...form,
                assignedTo: e.target.value,
              })
            }
          >
            <option value="">
              Select Employee
            </option>

            {users.map((u) => (
              <option
                key={u._id}
                value={u._id}
              >
                {u.name} • {u.role}
              </option>
            ))}

          </select>

        </div>

        <div className="grid grid-cols-3 gap-5">

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Priority
            </label>

            <select
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              value={form.priority}
              onChange={(e) =>
                setForm({
                  ...form,
                  priority: e.target.value,
                })
              }
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Due Date
            </label>

            <input
              type="date"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              value={form.dueDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  dueDate: e.target.value,
                })
              }
            />

          </div>

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Remarks
          </label>

          <textarea
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
            placeholder="Additional remarks..."
            value={form.remarks}
            onChange={(e) =>
              setForm({
                ...form,
                remarks: e.target.value,
              })
            }
          />

        </div>

      </div>

      {/* Footer */}

      <div className="flex justify-end gap-3 border-t border-slate-200 px-8 py-6">

        <button
          onClick={onClose}
          className="rounded-xl border border-slate-300 px-6 py-3 font-medium transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="rounded-xl bg-[#17357A] px-6 py-3 font-medium text-white transition hover:bg-[#21469E]"
        >
          {task ? "Update Task" : "Assign Task"}
        </button>

      </div>

    </div>

  </div>
);
};

export default TaskModal;