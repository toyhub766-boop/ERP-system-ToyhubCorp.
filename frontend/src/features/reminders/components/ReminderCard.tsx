interface Props {
  reminder: any;

  onEdit: () => void;

  onDelete: () => void;

  onComplete: () => void;
}

const ReminderCard = ({
  reminder,
  onEdit,
  onDelete,
  onComplete,
}: Props) => {
  const overdue =
    reminder.status === "PENDING" &&
    new Date(reminder.dueDate) < new Date();

  const priorityStyles =
    reminder.priority === "HIGH"
      ? "bg-red-50 text-red-700 border-red-100"
      : reminder.priority === "MEDIUM"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-emerald-50 text-emerald-700 border-emerald-100";

  const statusStyles =
    reminder.status === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : overdue
        ? "bg-red-50 text-red-700 border-red-100"
        : "bg-blue-50 text-blue-700 border-blue-100";

  const formattedDate = reminder.dueDate
    ? new Date(reminder.dueDate).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "--";

  return (
    <article
      className="
        group
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
        transition-all
        duration-200
        hover:border-slate-300
        hover:shadow-[0_6px_24px_rgba(15,23,42,0.07)]
        sm:p-5
        lg:p-6
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        {/* TITLE */}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`
                h-2
                w-2
                shrink-0
                rounded-full
                ${
                  reminder.status === "COMPLETED"
                    ? "bg-emerald-500"
                    : overdue
                      ? "bg-red-500"
                      : "bg-blue-500"
                }
              `}
            />

            <h2
              className="
                min-w-0
                truncate
                text-base
                font-bold
                tracking-tight
                text-slate-900
                sm:text-lg
              "
            >
              {reminder.title}
            </h2>
          </div>

          <p
            className="
              mt-1.5
              break-words
              text-sm
              leading-5
              text-slate-500
            "
          >
            {reminder.description || "No description provided"}
          </p>
        </div>

        {/* BADGES */}

        <div
          className="
            flex
            shrink-0
            flex-wrap
            items-center
            gap-2
          "
        >
          <span
            className={`
              rounded-lg
              border
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              ${priorityStyles}
            `}
          >
            {reminder.priority}
          </span>

          <span
            className={`
              rounded-lg
              border
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              ${statusStyles}
            `}
          >
            {overdue &&
            reminder.status !== "COMPLETED"
              ? "OVERDUE"
              : reminder.status}
          </span>
        </div>
      </div>

      {/* =====================================================
          DETAILS
      ===================================================== */}

      <div
        className="
          mt-5
          grid
          grid-cols-1
          overflow-hidden
          rounded-xl
          border
          border-slate-100
          bg-slate-50/60
          sm:grid-cols-2
        "
      >
        {/* MODULE */}

        <div
          className="
            min-w-0
            border-b
            border-slate-100
            px-4
            py-3.5
            sm:border-r
          "
        >
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-slate-400
            "
          >
            Module
          </p>

          <p
            className="
              mt-1
              truncate
              text-sm
              font-semibold
              text-slate-800
            "
          >
            {reminder.module || "--"}
          </p>
        </div>

        {/* DUE DATE */}

        <div
          className="
            min-w-0
            border-b
            border-slate-100
            px-4
            py-3.5
            sm:border-b
          "
        >
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-slate-400
            "
          >
            Due Date
          </p>

          <p
            className={`
              mt-1
              text-sm
              font-semibold
              ${
                overdue &&
                reminder.status !== "COMPLETED"
                  ? "text-red-600"
                  : "text-slate-800"
              }
            `}
          >
            {formattedDate}
          </p>
        </div>

        {/* ASSIGNED TO */}

        <div
          className="
            min-w-0
            border-b
            border-slate-100
            px-4
            py-3.5
            sm:border-r
            sm:border-b-0
          "
        >
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-slate-400
            "
          >
            Assigned To
          </p>

          <p
            className="
              mt-1
              truncate
              text-sm
              font-semibold
              text-slate-800
            "
          >
            {reminder.assignedTo?.name || "--"}
          </p>
        </div>

        {/* CREATED BY */}

        <div
          className="
            min-w-0
            px-4
            py-3.5
          "
        >
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-slate-400
            "
          >
            Created By
          </p>

          <p
            className="
              mt-1
              truncate
              text-sm
              font-semibold
              text-slate-800
            "
          >
            {reminder.createdBy?.name || "--"}
          </p>
        </div>
      </div>

      {/* =====================================================
          FOOTER ACTIONS
      ===================================================== */}

      <div
        className="
          mt-5
          flex
          flex-col-reverse
          gap-2
          sm:flex-row
          sm:items-center
          sm:justify-end
        "
      >
        <button
          type="button"
          onClick={onDelete}
          className="
            inline-flex
            h-10
            w-full
            items-center
            justify-center
            rounded-xl
            border
            border-red-100
            bg-red-50
            px-4
            text-sm
            font-semibold
            text-red-600
            transition
            hover:border-red-200
            hover:bg-red-100
            hover:text-red-700
            active:scale-[0.98]
            sm:w-auto
          "
        >
          Delete
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="
            inline-flex
            h-10
            w-full
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            text-sm
            font-semibold
            text-slate-700
            transition
            hover:border-slate-300
            hover:bg-slate-50
            active:scale-[0.98]
            sm:w-auto
          "
        >
          Edit
        </button>

        {reminder.status !== "COMPLETED" && (
          <button
            type="button"
            onClick={onComplete}
            className="
              inline-flex
              h-10
              w-full
              items-center
              justify-center
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
              sm:w-auto
            "
          >
            Complete
          </button>
        )}
      </div>
    </article>
  );
};

export default ReminderCard;