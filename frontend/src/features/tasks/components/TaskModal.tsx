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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[650px] p-6 space-y-4">

        <h2 className="text-2xl font-bold">
          {task ? "Edit Task" : "Assign Task"}
        </h2>

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Task Title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <textarea
          rows={3}
          className="w-full border rounded-lg p-3"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <select
          className="w-full border rounded-lg p-3"
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

        <div className="grid grid-cols-3 gap-4">

          <select
            className="border rounded-lg p-3"
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

          <select
            className="border rounded-lg p-3"
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

          <input
            type="date"
            className="border rounded-lg p-3"
            value={form.dueDate}
            onChange={(e) =>
              setForm({
                ...form,
                dueDate: e.target.value,
              })
            }
          />

        </div>

        <textarea
          rows={3}
          className="w-full border rounded-lg p-3"
          placeholder="Remarks"
          value={form.remarks}
          onChange={(e) =>
            setForm({
              ...form,
              remarks: e.target.value,
            })
          }
        />

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
            {task ? "Update" : "Save"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default TaskModal;