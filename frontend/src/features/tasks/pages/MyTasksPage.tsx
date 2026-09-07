import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiTarget,
  FiX,
} from "react-icons/fi";

import {
  getMyTasks,
  toggleMyChecklistItem,
} from "../services/task.service";

// ============================================================
// TYPES
// ============================================================

interface User {
  _id: string;
  name: string;
  role: string;
  employeeId?: string;
}

interface ChecklistItem {
  _id: string;
  text: string;
  completed: boolean;
}

interface Task {
  _id: string;
  title: string;
  description?: string;

  assignedTo: User;
  assignedBy?: User;

  priority:
    | "Low"
    | "Medium"
    | "High";

  dueDate?: string;
  remarks?: string;

  completed: boolean;

  checklist: ChecklistItem[];

  createdAt?: string;
  updatedAt?: string;
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  score: number;

  checklistTotal: number;
  checklistCompleted: number;
  checklistPending: number;
  checklistScore: number;
}

const EMPTY_STATS: TaskStats = {
  total: 0,
  completed: 0,
  pending: 0,
  score: 0,
  checklistTotal: 0,
  checklistCompleted: 0,
  checklistPending: 0,
  checklistScore: 0,
};

// ============================================================
// HELPERS
// ============================================================

const calculateStats = (
  taskList: Task[]
): TaskStats => {
  const total = taskList.length;

  const completed = taskList.filter(
    (task) => task.completed
  ).length;

  const pending =
    total - completed;

  const checklistTotal =
    taskList.reduce(
      (sum, task) =>
        sum +
        (Array.isArray(task.checklist)
          ? task.checklist.length
          : 0),
      0
    );

  const checklistCompleted =
    taskList.reduce(
      (sum, task) =>
        sum +
        (Array.isArray(task.checklist)
          ? task.checklist.filter(
              (item) => item.completed
            ).length
          : 0),
      0
    );

  const checklistPending =
    checklistTotal -
    checklistCompleted;

  const score =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  const checklistScore =
    checklistTotal === 0
      ? 0
      : Math.round(
          (checklistCompleted /
            checklistTotal) *
            100
        );

  return {
    total,
    completed,
    pending,
    score,
    checklistTotal,
    checklistCompleted,
    checklistPending,
    checklistScore,
  };
};

// ============================================================
// PAGE
// ============================================================

const MyTasksPage = () => {
  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [stats, setStats] =
    useState<TaskStats>(
      EMPTY_STATS
    );

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [updatingItem, setUpdatingItem] =
    useState<string | null>(null);

  // ==========================================================
  // LOAD TASKS
  // ==========================================================

  const loadTasks = async () => {
    try {
      setLoading(true);

      const response =
        await getMyTasks();

      const loadedTasks: Task[] =
        Array.isArray(response?.tasks)
          ? response.tasks
          : [];

      setTasks(loadedTasks);

      setStats(
        calculateStats(
          loadedTasks
        )
      );
    } catch (error) {
      console.error(
        "Failed to load my tasks:",
        error
      );

      setTasks([]);

      setStats(
        EMPTY_STATS
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredTasks =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return tasks;
      }

      return tasks.filter(
        (task) =>
          task.title
            ?.toLowerCase()
            .includes(query) ||
          task.description
            ?.toLowerCase()
            .includes(query) ||
          task.priority
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      tasks,
      search,
    ]);

  // ==========================================================
  // CHECKLIST TOGGLE
  // ==========================================================

  const handleToggleChecklist = async (
    taskId: string,
    itemId: string
  ) => {
    const updateKey =
      `${taskId}-${itemId}`;

    if (updatingItem) {
      return;
    }

    /*
     * Save current state for rollback.
     */
    const previousTasks =
      tasks;

    const previousSelectedTask =
      selectedTask;

    /*
     * Find the task.
     */
    const currentTask =
      tasks.find(
        (task) =>
          task._id === taskId
      );

    if (!currentTask) {
      return;
    }

    /*
     * Find the checklist item.
     */
    const currentItem =
      currentTask.checklist.find(
        (item) =>
          String(item._id) ===
          String(itemId)
      );

    if (!currentItem) {
      return;
    }

    /*
     * New checkbox state.
     */
    const newCompleted =
      !currentItem.completed;

    /*
     * ========================================================
     * OPTIMISTIC TASK UPDATE
     * ========================================================
     */

    const optimisticTasks =
      tasks.map((task) => {
        if (
          task._id !== taskId
        ) {
          return task;
        }

        const newChecklist =
          task.checklist.map(
            (item) =>
              String(item._id) ===
              String(itemId)
                ? {
                    ...item,
                    completed:
                      newCompleted,
                  }
                : item
          );

        const newTaskCompleted =
          newChecklist.length > 0 &&
          newChecklist.every(
            (item) =>
              item.completed
          );

        return {
          ...task,
          checklist:
            newChecklist,
          completed:
            newTaskCompleted,
        };
      });

    /*
     * Update the main list immediately.
     */
    setTasks(
      optimisticTasks
    );

    /*
     * Update statistics immediately.
     */
    setStats(
      calculateStats(
        optimisticTasks
      )
    );

    /*
     * Update open modal immediately.
     */
    if (
      selectedTask &&
      selectedTask._id === taskId
    ) {
      const updatedSelectedTask =
        optimisticTasks.find(
          (task) =>
            task._id === taskId
        );

      if (updatedSelectedTask) {
        setSelectedTask(
          updatedSelectedTask
        );
      }
    }

    /*
     * Show saving state.
     */
    setUpdatingItem(
      updateKey
    );

    // ========================================================
    // SAVE TO BACKEND
    // ========================================================

    try {
      const response =
        await toggleMyChecklistItem(
          taskId,
          itemId
        );

      /*
       * Backend currently returns
       * the updated Task directly.
       */
      const serverTask: Task =
        response?.task ??
        response;

      /*
       * Replace optimistic version
       * with backend version.
       */
      const finalTasks =
        optimisticTasks.map(
          (task) =>
            task._id === taskId
              ? serverTask
              : task
        );

      setTasks(
        finalTasks
      );

      setStats(
        calculateStats(
          finalTasks
        )
      );

      /*
       * Keep modal synchronized.
       */
      setSelectedTask(
        (current) =>
          current &&
          current._id === taskId
            ? serverTask
            : current
      );
    } catch (error) {
      console.error(
        "Failed to update checklist item:",
        error
      );

      /*
       * Roll back everything.
       */
      setTasks(
        previousTasks
      );

      setStats(
        calculateStats(
          previousTasks
        )
      );

      setSelectedTask(
        previousSelectedTask
      );
    } finally {
      setUpdatingItem(
        null
      );
    }
  };

  // ==========================================================
  // OPEN / CLOSE TASK
  // ==========================================================

  const openTask = (
    task: Task
  ) => {
    setSelectedTask(
      task
    );
  };

  const closeTask = () => {
    setSelectedTask(
      null
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1400px]
        space-y-6
        pb-8
      "
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <section
        className="
          rounded-[28px]
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          sm:p-7
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#17357A]
              "
            >
              My Workspace
            </p>

            <h1
              className="
                mt-2
                text-2xl
                font-bold
                tracking-tight
                text-slate-900
                sm:text-3xl
              "
            >
              My Tasks
            </h1>

            <p
              className="
                mt-1
                max-w-xl
                text-sm
                text-slate-500
              "
            >
              Complete your assigned work
              and keep your checklist progress
              updated.
            </p>
          </div>

          <div
            className="
              flex
              h-14
              items-center
              gap-3
              rounded-2xl
              bg-blue-50
              px-4
              text-[#17357A]
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-white
              "
            >
              <FiTarget size={18} />
            </div>

            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                "
              >
                Performance
              </p>

              <p
                className="
                  text-lg
                  font-bold
                "
              >
                {stats.score}%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          PERFORMANCE CARDS
      ====================================================== */}

      <section
        className="
          grid
          grid-cols-2
          gap-3
          lg:grid-cols-4
        "
      >
        <StatCard
          label="Assigned"
          value={stats.total}
          icon={<FiTarget />}
        />

        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<FiCheckCircle />}
        />

        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<FiClock />}
        />

        <StatCard
          label="Checklist"
          value={`${stats.checklistScore}%`}
          icon={<FiCheck />}
          highlight
        />
      </section>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
        "
      >
        <div
          className="
            relative
            max-w-xl
          "
        >
          <FiSearch
            size={17}
            className="
              pointer-events-none
              absolute
              left-3.5
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search your tasks..."
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pl-10
              pr-4
              text-sm
              outline-none
              transition
              focus:border-[#17357A]
              focus:bg-white
              focus:ring-4
              focus:ring-blue-50
            "
          />
        </div>
      </section>

      {/* ======================================================
          TASK LIST
      ====================================================== */}

      <section
        className="
          overflow-hidden
          rounded-[28px]
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            border-b
            border-slate-100
            px-5
            py-5
            sm:px-6
          "
        >
          <div>
            <h2
              className="
                text-lg
                font-bold
                text-slate-900
              "
            >
              Assigned Tasks
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Work through your assigned
              checklist items.
            </p>
          </div>

          <span
            className="
              rounded-full
              bg-slate-100
              px-3
              py-1.5
              text-xs
              font-bold
              text-slate-600
            "
          >
            {filteredTasks.length}
          </span>
        </div>

        <div
          className="
            divide-y
            divide-slate-100
          "
        >
          {loading ? (
            <div
              className="
                px-5
                py-16
                text-center
                text-sm
                text-slate-500
              "
            >
              Loading your tasks...
            </div>
          ) : filteredTasks.length ===
            0 ? (
            <EmptyTasks />
          ) : (
            filteredTasks.map(
              (task) => (
                <TaskListItem
                  key={task._id}
                  task={task}
                  onOpen={() =>
                    openTask(task)
                  }
                />
              )
            )
          )}
        </div>
      </section>

      {/* ======================================================
          DETAIL MODAL
      ====================================================== */}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          updatingItem={updatingItem}
          onToggle={
            handleToggleChecklist
          }
          onClose={closeTask}
        />
      )}
    </div>
  );
};

export default MyTasksPage;

// ============================================================
// STAT CARD
// ============================================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  highlight?: boolean;
}

const StatCard = ({
  label,
  value,
  icon,
  highlight = false,
}: StatCardProps) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        transition
        hover:shadow-md
        sm:p-5
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            ${
              highlight
                ? "bg-blue-50 text-[#17357A]"
                : "bg-slate-50 text-slate-400"
            }
          `}
        >
          {icon}
        </div>

        <div>
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            {label}
          </p>

          <p
            className="
              mt-0.5
              text-xl
              font-bold
              text-slate-900
            "
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyTasks = () => {
  return (
    <div
      className="
        px-5
        py-16
        text-center
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-slate-100
          text-slate-400
        "
      >
        <FiCheck size={22} />
      </div>

      <p
        className="
          mt-4
          text-sm
          font-semibold
          text-slate-700
        "
      >
        No tasks found
      </p>

      <p
        className="
          mt-1
          text-xs
          text-slate-400
        "
      >
        Your assigned tasks will appear here.
      </p>
    </div>
  );
};

// ============================================================
// TASK LIST ITEM
// ============================================================

interface TaskListItemProps {
  task: Task;
  onOpen: () => void;
}

const TaskListItem = ({
  task,
  onOpen,
}: TaskListItemProps) => {
  const total =
    task.checklist?.length || 0;

  const completed =
    task.checklist?.filter(
      (item) => item.completed
    ).length || 0;

  const progress =
    total === 0
      ? task.completed
        ? 100
        : 0
      : Math.round(
          (completed / total) * 100
        );

  return (
    <button
      type="button"
      onClick={onOpen}
      className="
        flex
        w-full
        flex-col
        gap-4
        px-5
        py-5
        text-left
        transition
        hover:bg-slate-50
        active:bg-slate-100
        sm:px-6
      "
    >
      <div
        className="
          flex
          items-start
          gap-4
        "
      >
        <div
          className={`
            mt-0.5
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${
              task.completed
                ? "bg-green-50 text-green-600"
                : "bg-blue-50 text-[#17357A]"
            }
          `}
        >
          {task.completed ? (
            <FiCheckCircle size={18} />
          ) : (
            <FiTarget size={18} />
          )}
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              flex-col
              gap-2
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >
            <div>
              <h3
                className={`
                  text-sm
                  font-bold
                  ${
                    task.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-900"
                  }
                `}
              >
                {task.title}
              </h3>

              {task.description && (
                <p
                  className="
                    mt-1
                    line-clamp-2
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  {task.description}
                </p>
              )}
            </div>

            <span
              className={`
                w-fit
                rounded-full
                px-2.5
                py-1
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                ${
                  task.priority ===
                  "High"
                    ? "bg-red-50 text-red-600"
                    : task.priority ===
                      "Medium"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-slate-100 text-slate-500"
                }
              `}
            >
              {task.priority}
            </span>
          </div>

          {/* Progress */}

          <div className="mt-4">
            <div
              className="
                flex
                items-center
                justify-between
                text-xs
              "
            >
              <span className="font-medium text-slate-400">
                Checklist
              </span>

              <span className="font-bold text-slate-600">
                {completed}/{total}
              </span>
            </div>

            <div
              className="
                mt-2
                h-1.5
                overflow-hidden
                rounded-full
                bg-slate-100
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-[#17357A]
                  transition-all
                  duration-300
                "
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {/* Meta */}

          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-4
              text-xs
              text-slate-400
            "
          >
            {task.dueDate && (
              <span className="flex items-center gap-1.5">
                <FiCalendar size={12} />

                Due{" "}
                {new Date(
                  task.dueDate
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </span>
            )}

            <span>
              {progress}% checklist
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

// ============================================================
// TASK DETAIL MODAL
// ============================================================

interface TaskDetailModalProps {
  task: Task;

  updatingItem:
    | string
    | null;

  onToggle: (
    taskId: string,
    itemId: string
  ) => void;

  onClose: () => void;
}

const TaskDetailModal = ({
  task,
  updatingItem,
  onToggle,
  onClose,
}: TaskDetailModalProps) => {
  const completed =
    task.checklist.filter(
      (item) => item.completed
    ).length;

  const total =
    task.checklist.length;

  const progress =
    total === 0
      ? task.completed
        ? 100
        : 0
      : Math.round(
          (completed / total) * 100
        );

  return (
    <div
      className="
        fixed
        inset-0
        z-[80]
        flex
        items-center
        justify-center
        bg-slate-950/50
        p-3
        backdrop-blur-sm
        sm:p-5
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-2xl
          overflow-hidden
          rounded-[26px]
          bg-white
          shadow-2xl
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* Header */}

        <div
          className="
            border-b
            border-slate-200
            px-5
            py-5
            sm:px-6
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`
                    rounded-full
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    ${
                      task.priority ===
                      "High"
                        ? "bg-red-50 text-red-600"
                        : task.priority ===
                          "Medium"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                    }
                  `}
                >
                  {task.priority}
                </span>

                {task.completed && (
                  <span
                    className="
                      rounded-full
                      bg-green-50
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      uppercase
                      text-green-600
                    "
                  >
                    Completed
                  </span>
                )}
              </div>

              <h2
                className="
                  mt-3
                  break-words
                  text-xl
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                {task.title}
              </h2>

              {task.description && (
                <p
                  className="
                    mt-1.5
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  {task.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close task"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-700
              "
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Progress */}

          <div className="mt-5">
            <div
              className="
                flex
                items-center
                justify-between
                text-xs
              "
            >
              <span
                className="
                  font-semibold
                  text-slate-500
                "
              >
                Checklist Progress
              </span>

              <span
                className="
                  font-bold
                  text-[#17357A]
                "
              >
                {completed}/{total}
              </span>
            </div>

            <div
              className="
                mt-2
                h-2
                overflow-hidden
                rounded-full
                bg-slate-100
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-[#17357A]
                  transition-all
                  duration-300
                "
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p
              className="
                mt-2
                text-right
                text-[11px]
                font-semibold
                text-slate-400
              "
            >
              {progress}% complete
            </p>
          </div>
        </div>

        {/* Checklist */}

        <div
          className="
            max-h-[55vh]
            overflow-y-auto
            px-5
            py-5
            sm:px-6
          "
        >
          {total === 0 ? (
            <div
              className="
                rounded-2xl
                border
                border-dashed
                border-slate-300
                px-5
                py-10
                text-center
              "
            >
              <FiTarget
                className="mx-auto text-slate-300"
                size={25}
              />

              <p
                className="
                  mt-3
                  text-sm
                  font-semibold
                  text-slate-600
                "
              >
                No checklist items
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {task.checklist.map(
                (item, index) => {
                  const itemKey =
                    `${task._id}-${item._id}`;

                  const isSaving =
                    updatingItem ===
                    itemKey;

                  return (
                    <button
                      key={item._id}
                      type="button"
                      disabled={
                        Boolean(
                          updatingItem
                        )
                      }
                      onClick={() =>
                        onToggle(
                          task._id,
                          item._id
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-3
                        text-left
                        transition
                        hover:border-[#17357A]/20
                        hover:bg-blue-50/40
                        disabled:cursor-wait
                        disabled:opacity-70
                      "
                    >
                      {/* Checkbox */}

                      <span
                        className={`
                          flex
                          h-6
                          w-6
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          border-2
                          transition-all
                          duration-200
                          ${
                            item.completed
                              ? "border-[#17357A] bg-[#17357A] text-white"
                              : "border-slate-300 bg-white"
                          }
                        `}
                      >
                        {item.completed && (
                          <FiCheck
                            size={14}
                          />
                        )}
                      </span>

                      {/* Number */}

                      <span
                        className="
                          w-6
                          shrink-0
                          text-[10px]
                          font-bold
                          text-slate-300
                        "
                      >
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      {/* Text */}

                      <span
                        className={`
                          flex-1
                          text-sm
                          ${
                            item.completed
                              ? "text-slate-400 line-through"
                              : "text-slate-700"
                          }
                        `}
                      >
                        {item.text}
                      </span>

                      {/* Saving */}

                      {isSaving && (
                        <span
                          className="
                            shrink-0
                            text-[10px]
                            font-semibold
                            text-slate-400
                          "
                        >
                          Saving...
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          )}

          {/* Remarks */}

          {task.remarks && (
            <div
              className="
                mt-5
                rounded-2xl
                bg-slate-50
                p-4
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Remarks
              </p>

              <p
                className="
                  mt-1.5
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                {task.remarks}
              </p>
            </div>
          )}

          {/* Due Date */}

          {task.dueDate && (
            <div
              className="
                mt-4
                flex
                items-center
                gap-2
                text-xs
                text-slate-400
              "
            >
              <FiCalendar size={13} />

              Due{" "}
              {new Date(
                task.dueDate
              ).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};