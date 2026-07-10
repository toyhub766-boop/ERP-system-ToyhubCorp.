import { useEffect, useMemo, useState } from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";

import {
  getTasks,
  deleteTask,
} from "../services/task.service";

import TaskModal from "../components/TaskModal";

import {
  FiEdit2,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";

const TaskPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState<any>(null);

  const loadTasks = async () => {
    try {
      const data = await getTasks();

      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task: any) =>
      (task.title || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [tasks, search]);

  return (
    <AdminLayout>

      <div className="p-6 space-y-6">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-slate-500">
              Admin &gt; Task Management
            </p>

            <h1 className="text-3xl font-bold mt-2">
              Task Management
            </h1>

          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setShowModal(true);
            }}
            className="bg-[#172B6B] text-white px-5 py-3 rounded-xl flex items-center gap-2"
          >
            <FiPlus />

            Assign Task
          </button>

        </div>

        {/* Search */}

        <div className="bg-white rounded-xl shadow p-5">

          <input
            placeholder="Search tasks..."
            className="border rounded-lg px-3 py-2 w-72"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <div className="overflow-x-auto">

  <table className="w-full min-w-[900px]">

    <thead>

      <tr className="border-b bg-slate-50">

        <th className="text-left py-3 px-3">
          Task
        </th>

        <th className="text-left px-3">
          Assigned To
        </th>

        <th className="text-center">
          Priority
        </th>

        <th className="text-center">
          Status
        </th>

        <th className="text-center">
          Due Date
        </th>

        <th className="text-center">
          Actions
        </th>

      </tr>

    </thead>

    <tbody>

      {filteredTasks.length === 0 ? (

        <tr>

          <td
            colSpan={6}
            className="py-12 text-center text-slate-500"
          >
            No tasks found.
          </td>

        </tr>

      ) : (

        filteredTasks.map((task: any) => (

          <tr
            key={task._id}
            className="border-b hover:bg-slate-50 transition"
          >

            <td className="py-4 px-3 font-medium">
              {task.title}
            </td>

            <td className="px-3">
              {task.assignedTo?.name || "-"}
            </td>

            <td className="text-center">

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  task.priority === "High"
                    ? "bg-red-100 text-red-700"
                    : task.priority === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {task.priority}
              </span>

            </td>

            <td className="text-center">

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  task.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : task.status === "In Progress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {task.status}
              </span>

            </td>

            <td className="text-center">

              {task.dueDate
                ? new Date(
                    task.dueDate
                  ).toLocaleDateString()
                : "-"}

            </td>

            <td>

              <div className="flex justify-center gap-4">

                <button
                  className="text-blue-600 hover:text-blue-800 transition"
                  onClick={() => {
                    setEditingTask(task);
                    setShowModal(true);
                  }}
                >
                  <FiEdit2 />
                </button>

                <button
                  className="text-red-600 hover:text-red-800 transition"
                  onClick={async () => {

                    if (
                      !window.confirm(
                        "Delete this task?"
                      )
                    )
                      return;

                    await deleteTask(task._id);

                    loadTasks();

                  }}
                >
                  <FiTrash2 />
                </button>

              </div>

            </td>

          </tr>

        ))

      )}

    </tbody>

  </table>

</div>

        </div>

        <TaskModal
          open={showModal}
          task={editingTask}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSuccess={loadTasks}
        />

      </div>

    </AdminLayout>
  );
};

export default TaskPage;
