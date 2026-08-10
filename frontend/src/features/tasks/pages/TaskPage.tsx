import { useEffect, useMemo, useState } from "react";
import {
  FiCheck,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

import AdminLayout from "../../../app/layouts/AdminLayout";

import api from "../../../services/api/axios";

import {
  getTasksByUser,
  toggleTaskCompletion,
  deleteTask,
} from "../services/task.service";

import TaskModal from "../components/TaskModal";

interface User {
  _id: string;
  name: string;
  role: string;
  employeeId?: string;
}

interface ChecklistItem {
  _id?: string;
  text: string;
  completed: boolean;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  assignedTo: User;
  assignedBy?: User;
  priority: "Low" | "Medium" | "High";
  dueDate?: string;
  remarks?: string;
  completed: boolean;
  checklist: ChecklistItem[];
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  score: number;
}

const TaskPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    score: 0,
  });

  const [search, setSearch] = useState("");

  const [userSearch, setUserSearch] =
    useState("");

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [loadingTasks, setLoadingTasks] =
    useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  // --------------------------------------------------
  // LOAD USERS
  // --------------------------------------------------

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);

      const { data } = await api.get(
        "/users/attendance-users"
      );

      setUsers(data);
    } catch (error) {
      console.error(
        "Failed to load users:",
        error
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // --------------------------------------------------
  // LOAD TASKS FOR SELECTED USER
  // --------------------------------------------------

  const loadUserTasks = async (
    userId: string
  ) => {
    try {
      setLoadingTasks(true);

      const data =
        await getTasksByUser(userId);

      setTasks(data.tasks || []);

      setStats(
        data.stats || {
          total: 0,
          completed: 0,
          pending: 0,
          score: 0,
        }
      );
    } catch (error) {
      console.error(
        "Failed to load tasks:",
        error
      );

      setTasks([]);

      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        score: 0,
      });
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // --------------------------------------------------
  // SELECT USER
  // --------------------------------------------------

  const handleSelectUser = (
    user: User
  ) => {
    setSelectedUser(user);

    setSearch("");

    loadUserTasks(user._id);
  };

  // --------------------------------------------------
  // FILTER USERS
  // --------------------------------------------------

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const value =
        userSearch.toLowerCase();

      return (
        user.name
          .toLowerCase()
          .includes(value) ||
        user.role
          .toLowerCase()
          .includes(value) ||
        user.employeeId
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [users, userSearch]);

  // --------------------------------------------------
  // FILTER TASKS
  // --------------------------------------------------

  const filteredTasks = useMemo(() => {
    const value =
      search.toLowerCase();

    return tasks.filter((task) =>
      task.title
        .toLowerCase()
        .includes(value)
    );
  }, [tasks, search]);

  // --------------------------------------------------
  // TOGGLE TASK
  // --------------------------------------------------

  const handleToggleTask = async (
    taskId: string
  ) => {
    if (!selectedUser) return;

    try {
      const updatedTask =
        await toggleTaskCompletion(
          taskId
        );

      setTasks((previous) =>
        previous.map((task) =>
          task._id === taskId
            ? updatedTask
            : task
        )
      );

      // Reload stats so score updates immediately.
      await loadUserTasks(
        selectedUser._id
      );
    } catch (error) {
      console.error(
        "Failed to update task:",
        error
      );
    }
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const handleDelete = async (
    taskId: string
  ) => {
    if (!selectedUser) return;

    const confirmed =
      window.confirm(
        "Delete this task?"
      );

    if (!confirmed) return;

    try {
      await deleteTask(taskId);

      await loadUserTasks(
        selectedUser._id
      );
    } catch (error) {
      console.error(
        "Failed to delete task:",
        error
      );
    }
  };

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------

  const handleEdit = (
    task: Task
  ) => {
    setEditingTask(task);
    setShowModal(true);
  };

  // --------------------------------------------------
  // ADD
  // --------------------------------------------------

  const handleAddTask = () => {
    if (!selectedUser) return;

    setEditingTask(null);
    setShowModal(true);
  };

  return (
    <AdminLayout>

      <div className="min-h-full bg-slate-50 p-6">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="mb-6">

          <p className="text-sm text-slate-500">
            Admin &gt; Task Management
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h1 className="text-3xl font-bold text-slate-900">
                Task Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Assign work and track employee
                task performance.
              </p>

            </div>

          </div>

        </div>

        {/* ========================================= */}
        {/* USER SELECTION */}
        {/* ========================================= */}

        {!selectedUser && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 p-5">

              <h2 className="text-lg font-semibold text-slate-900">
                Select Employee
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a user to view and manage
                their tasks and checklist.
              </p>

              <div className="relative mt-4 max-w-md">

                <input
                  value={userSearch}
                  onChange={(e) =>
                    setUserSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search employee..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-[#17357A] focus:ring-2 focus:ring-[#17357A]/10"
                />

              </div>

            </div>

            <div className="p-5">

              {loadingUsers ? (

                <div className="py-12 text-center text-sm text-slate-500">
                  Loading employees...
                </div>

              ) : filteredUsers.length === 0 ? (

                <div className="py-12 text-center text-sm text-slate-500">
                  No employees found.
                </div>

              ) : (

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  {filteredUsers.map(
                    (user) => (

                      <button
                        key={user._id}
                        onClick={() =>
                          handleSelectUser(
                            user
                          )
                        }
                        className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-[#17357A]/30 hover:bg-slate-50 hover:shadow-sm"
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#17357A] text-sm font-bold text-white">
                            {user.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <p className="font-semibold text-slate-900">
                              {user.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {user.role}
                              {user.employeeId
                                ? ` • ${user.employeeId}`
                                : ""}
                            </p>

                          </div>

                        </div>

                        <FiChevronRight
                          className="text-slate-300 transition group-hover:text-[#17357A]"
                        />

                      </button>

                    )
                  )}

                </div>

              )}

            </div>

          </section>
        )}

        {/* ========================================= */}
        {/* SELECTED USER WORKSPACE */}
        {/* ========================================= */}

        {selectedUser && (

          <div className="space-y-6">

            {/* USER HEADER */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#17357A] text-lg font-bold text-white">
                    {selectedUser.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      Task Workspace
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900">
                      {selectedUser.name}
                    </h2>

                    <p className="text-sm text-slate-500">
                      {selectedUser.role}
                    </p>

                  </div>

                </div>

                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      setSelectedUser(
                        null
                      )
                    }
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Change User
                  </button>

                  <button
                    onClick={
                      handleAddTask
                    }
                    className="flex items-center gap-2 rounded-xl bg-[#17357A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#21469E]"
                  >
                    <FiPlus />
                    Add Task
                  </button>

                </div>

              </div>

            </section>

            {/* ===================================== */}
            {/* PERFORMANCE */}
            {/* ===================================== */}

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

              <div className="rounded-2xl border border-slate-200 bg-white p-5">

                <p className="text-sm text-slate-500">
                  Total Tasks
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>

              </div>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-5">

                <p className="text-sm text-green-700">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold text-green-700">
                  {stats.completed}
                </p>

              </div>

              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">

                <p className="text-sm text-yellow-700">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-bold text-yellow-700">
                  {stats.pending}
                </p>

              </div>

              <div className="rounded-2xl border border-[#17357A]/20 bg-[#17357A]/5 p-5">

                <p className="text-sm text-[#17357A]">
                  Performance Score
                </p>

                <p className="mt-2 text-3xl font-bold text-[#17357A]">
                  {stats.score}%
                </p>

              </div>

            </section>

            {/* ===================================== */}
            {/* TASKS */}
            {/* ===================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="text-lg font-semibold text-slate-900">
                      Tasks & Checklist
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Manage work assigned to{" "}
                      {selectedUser.name}.
                    </p>

                  </div>

                  <div className="relative w-full sm:w-72">

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search tasks..."
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#17357A]"
                    />

                  </div>

                </div>

              </div>

              <div className="divide-y divide-slate-100">

                {loadingTasks ? (

                  <div className="py-16 text-center text-sm text-slate-500">
                    Loading tasks...
                  </div>

                ) : filteredTasks.length === 0 ? (

                  <div className="py-16 text-center">

                    <p className="font-medium text-slate-700">
                      No tasks yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Add the first task for{" "}
                      {selectedUser.name}.
                    </p>

                    <button
                      onClick={
                        handleAddTask
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#17357A] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      <FiPlus />
                      Add Task
                    </button>

                  </div>

                ) : (

                  filteredTasks.map(
                    (task) => (

                      <div
                        key={task._id}
                        className="flex gap-4 p-5 transition hover:bg-slate-50"
                      >

                        {/* COMPLETION CHECKBOX */}

                        <button
                          onClick={() =>
                            handleToggleTask(
                              task._id
                            )
                          }
                          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                            task.completed
                              ? "border-green-600 bg-green-600 text-white"
                              : "border-slate-300 bg-white hover:border-[#17357A]"
                          }`}
                        >
                          {task.completed && (
                            <FiCheck
                              size={15}
                            />
                          )}
                        </button>

                        {/* TASK CONTENT */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                            <div>

                              <h3
                                className={`font-semibold ${
                                  task.completed
                                    ? "text-slate-400 line-through"
                                    : "text-slate-900"
                                }`}
                              >
                                {task.title}
                              </h3>

                              {task.description && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {
                                    task.description
                                  }
                                </p>
                              )}

                            </div>

                            <div className="flex items-center gap-2">

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  task.priority ===
                                  "High"
                                    ? "bg-red-100 text-red-700"
                                    : task.priority ===
                                      "Medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {
                                  task.priority
                                }
                              </span>

                            </div>

                          </div>

                          {/* CHECKLIST */}

                          {task.checklist?.length >
                            0 && (

                            <div className="mt-4 space-y-2">

                              {task.checklist.map(
                                (
                                  item,
                                  index
                                ) => (

                                  <div
                                    key={
                                      item._id ||
                                      index
                                    }
                                    className="flex items-center gap-2 text-sm"
                                  >

                                    <span
                                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                                        item.completed
                                          ? "border-[#17357A] bg-[#17357A] text-white"
                                          : "border-slate-300"
                                      }`}
                                    >
                                      {item.completed && (
                                        <FiCheck
                                          size={10}
                                        />
                                      )}
                                    </span>

                                    <span
                                      className={
                                        item.completed
                                          ? "text-slate-400 line-through"
                                          : "text-slate-600"
                                      }
                                    >
                                      {
                                        item.text
                                      }
                                    </span>

                                  </div>

                                )
                              )}

                            </div>

                          )}

                          {/* META */}

                          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">

                            {task.dueDate && (
                              <span>
                                Due{" "}
                                {new Date(
                                  task.dueDate
                                ).toLocaleDateString()}
                              </span>
                            )}

                            <span>
                              {
                                task.checklist
                                  ?.filter(
                                    (
                                      item
                                    ) =>
                                      item.completed
                                  ).length
                              }
                              /
                              {
                                task.checklist
                                  ?.length
                              }{" "}
                              checklist
                            </span>

                          </div>

                        </div>

                        {/* ACTIONS */}

                        <div className="flex shrink-0 items-start gap-2">

                          <button
                            onClick={() =>
                              handleEdit(
                                task
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#17357A]"
                          >
                            <FiEdit2
                              size={16}
                            />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                task._id
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <FiTrash2
                              size={16}
                            />
                          </button>

                        </div>

                      </div>

                    )
                  )

                )}

              </div>

            </section>

          </div>
        )}

        {/* ========================================= */}
        {/* MODAL */}
        {/* ========================================= */}

        {selectedUser && (

          <TaskModal
            open={showModal}
            task={editingTask}
            assignedTo={
              selectedUser._id
            }
            onClose={() => {
              setShowModal(false);
              setEditingTask(null);
            }}
            onSuccess={() => {
              loadUserTasks(
                selectedUser._id
              );
            }}
          />

        )}

      </div>

    </AdminLayout>
  );
};

export default TaskPage;