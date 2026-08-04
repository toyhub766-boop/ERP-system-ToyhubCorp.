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

    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

            {/* Header */}

            <div className="flex items-start justify-between">

                <div>

                    <h2 className="text-xl font-bold">
                        {reminder.title}
                    </h2>

                    <p className="mt-1 text-slate-500">
                        {reminder.description || "-"}
                    </p>

                </div>

                <div className="flex gap-2">

                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${reminder.priority === "HIGH"
                                ? "bg-red-100 text-red-700"
                                : reminder.priority === "MEDIUM"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                            }`}
                    >
                        {reminder.priority}
                    </span>

                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${reminder.status === "COMPLETED"
                                ? "bg-green-100 text-green-700"
                                : overdue
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                            }`}
                    >
                        {reminder.status}
                    </span>

                </div>

            </div>

            {/* Details */}

            <div className="mt-6 grid grid-cols-2 gap-5 text-sm">

                <div>

                    <p className="text-slate-500">
                        Module
                    </p>

                    <p className="font-semibold">
                        {reminder.module}
                    </p>

                </div>

                <div>

                    <p className="text-slate-500">
                        Due Date
                    </p>

                    <p className="font-semibold">
                        {new Date(
                            reminder.dueDate
                        ).toLocaleDateString()}
                    </p>

                </div>

                <div>

                    <p className="text-slate-500">
                        Assigned To
                    </p>

                    <p className="font-semibold">
                        {reminder.assignedTo?.name || "-"}
                    </p>

                </div>

                <div>

                    <p className="text-slate-500">
                        Created By
                    </p>

                    <p className="font-semibold">
                        {reminder.createdBy?.name || "-"}
                    </p>

                </div>

            </div>

            {/* Footer */}

            <div className="mt-8 flex flex-wrap justify-end gap-3">

                {reminder.status !== "COMPLETED" && (

                    <button
                        onClick={onComplete}
                        className="rounded-xl bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                    >
                        Complete
                    </button>

                )}

                <button
                    onClick={onEdit}
                    className="rounded-xl border border-slate-300 px-5 py-2"
                >
                    Edit
                </button>

                <button
                    onClick={onDelete}
                    className="rounded-xl bg-red-600 px-5 py-2 text-white hover:bg-red-700"
                >
                    Delete
                </button>

            </div>

        </div>
    );
};

export default ReminderCard;