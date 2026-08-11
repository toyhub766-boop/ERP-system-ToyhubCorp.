import {
    FiCalendar,
    FiCamera,

    FiEdit2,
    FiTrash2,
    FiUser,
} from "react-icons/fi";

interface AttendanceRecord {
    _id: string;

    employee?: {
        _id?: string;
        name?: string;
        role?: string;
        employeeId?: string;
    };

    date?: string;

    checkIn?: string;
    checkOut?: string;

    status?:
    | "Present"
    | "Absent"
    | "Half Day"
    | "Leave";

    tasksAssigned?: number;
    tasksCompleted?: number;

    score?: number;

    photo?: string;

    remarks?: string;
}

interface Props {
    records: AttendanceRecord[];

    onEdit: (
        record: AttendanceRecord
    ) => void;

    onDelete: (
        record: AttendanceRecord
    ) => void;

    onViewPhoto: (
        photo: string,
        employeeName: string,
        date?: string
    ) => void;
}

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const getPhotoUrl = (photo?: string) => {
    if (!photo) return "";

    // Already a complete URL
    if (
        photo.startsWith("http://") ||
        photo.startsWith("https://") ||
        photo.startsWith("data:")
    ) {
        return photo;
    }

    // Backend-relative path
    return `${API_URL.replace(/\/$/, "")}/${photo.replace(/^\//, "")}`;
};

const getStatusStyles = (
    status?: string
) => {
    switch (status) {
        case "Present":
            return {
                wrapper:
                    "bg-emerald-50 text-emerald-700 ring-emerald-100",
                dot: "bg-emerald-500",
            };

        case "Absent":
            return {
                wrapper:
                    "bg-red-50 text-red-700 ring-red-100",
                dot: "bg-red-500",
            };

        case "Half Day":
            return {
                wrapper:
                    "bg-amber-50 text-amber-700 ring-amber-100",
                dot: "bg-amber-500",
            };

        case "Leave":
            return {
                wrapper:
                    "bg-blue-50 text-blue-700 ring-blue-100",
                dot: "bg-blue-500",
            };

        default:
            return {
                wrapper:
                    "bg-slate-50 text-slate-600 ring-slate-200",
                dot: "bg-slate-400",
            };
    }
};

const getScore = (
    record: AttendanceRecord
) => {
    if (
        typeof record.score === "number"
    ) {
        return record.score;
    }

    if (
        record.tasksAssigned &&
        record.tasksAssigned > 0
    ) {
        return Math.round(
            ((record.tasksCompleted || 0) /
                record.tasksAssigned) *
            100
        );
    }

    return 0;
};

const formatDate = (
    value?: string
) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

const EmployeeAttendanceTable = ({
    records,
    onEdit,
    onDelete,
    onViewPhoto,
}: Props) => {
    return (
        <section className="mt-8">

            {/* =================================================
          SECTION HEADER
      ================================================= */}

            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

                <div>

                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A1F]" />

                        <h2 className="text-lg font-bold tracking-tight text-slate-900">
                            Employee Attendance
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        {records.length === 1
                            ? "1 attendance record"
                            : `${records.length} attendance records`}
                    </p>

                </div>

            </div>

            {/* =================================================
          TABLE CARD
      ================================================= */}

            <div
                className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200/80
          bg-white
          shadow-[0_2px_12px_rgba(15,23,42,0.04)]
        "
            >

                {records.length === 0 ? (

                    /* =================================================
                       EMPTY STATE
                    ================================================= */

                    <div className="flex min-h-[320px] items-center justify-center px-6 py-12">

                        <div className="max-w-sm text-center">

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
                                <FiUser size={23} />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-slate-900">
                                No attendance records
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                There are no employee attendance
                                records matching the current
                                search or filter.
                            </p>

                        </div>

                    </div>

                ) : (

                    /* =================================================
                       TABLE
                    ================================================= */

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1180px] border-collapse">

                            {/* ================= HEADER ================= */}

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50/80">

                                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                        Employee
                                    </th>

                                    <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                        Photo
                                    </th>

                                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                        Date
                                    </th>

                                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                        Check In
                                    </th>

                                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                        Check Out
                                    </th>

                                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                        Tasks
                                    </th>

                                    <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                        Score
                                    </th>

                                    <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            {/* ================= BODY ================= */}

                            <tbody>

                                {records.map((record) => {

                                    const employee =
                                        record.employee;

                                    const employeeName =
                                        employee?.name ||
                                        "Unknown Employee";

                                    const score =
                                        getScore(record);

                                    const statusStyles =
                                        getStatusStyles(
                                            record.status
                                        );

                                    return (
                                        <tr
                                            key={record._id}
                                            className="
                        border-b
                        border-slate-100
                        transition-colors
                        duration-150
                        last:border-0
                        hover:bg-slate-50/60
                      "
                                        >

                                            {/* ================= EMPLOYEE ================= */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div
                                                        className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-[#17357A]/8
                              text-sm
                              font-bold
                              text-[#17357A]
                            "
                                                    >
                                                        {employeeName
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                            {employeeName}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            {employee?.employeeId ||
                                                                "No Employee ID"}
                                                        </p>

                                                        {employee?.role && (
                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                {employee.role}
                                                            </p>
                                                        )}

                                                    </div>

                                                </div>

                                            </td>

                                            {/* ================= PHOTO ================= */}

                                            <td className="px-4 py-4 text-center">

                                                {record.photo ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onViewPhoto(
                                                                getPhotoUrl(record.photo),
                                                                employeeName,
                                                                record.date
                                                            )
                                                        }
                                                        className="
        group
        relative
        mx-auto
        block
        h-12
        w-12
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-slate-100
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#17357A]/30
        hover:shadow-md
        focus:outline-none
        focus:ring-4
        focus:ring-[#17357A]/10
      "
                                                        title="View attendance photo"
                                                    >

                                                        <img
                                                            src={getPhotoUrl(record.photo)}
                                                            alt={`${employeeName} attendance`}
                                                            className="
          h-full
          w-full
          object-cover
          transition-transform
          duration-300
          group-hover:scale-105
        "
                                                            onError={(event) => {
                                                                event.currentTarget.style.display = "none";
                                                            }}
                                                        />

                                                        <span
                                                            className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          bg-slate-950/40
          opacity-0
          transition-opacity
          duration-200
          group-hover:opacity-100
        "
                                                        >
                                                            <FiCamera
                                                                size={16}
                                                                className="text-white"
                                                            />
                                                        </span>

                                                    </button>
                                                ) : (
                                                    <div
                                                        className="
        mx-auto
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        border-slate-200
        bg-slate-50
      "
                                                        title="No attendance photo"
                                                    >
                                                        <FiCamera
                                                            size={16}
                                                            className="text-slate-300"
                                                        />
                                                    </div>
                                                )}

                                            </td>
                                            {/* ================= DATE ================= */}

                                            <td className="px-4 py-4">

                                                <div className="flex items-center gap-2">

                                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                                                        <FiCalendar
                                                            size={14}
                                                            className="text-slate-400"
                                                        />
                                                    </span>

                                                    <span className="text-sm font-medium text-slate-700">
                                                        {formatDate(
                                                            record.date
                                                        )}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* ================= CHECK IN ================= */}

                                            <td className="px-4 py-4">

                                                <div className="flex items-center gap-2">

                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                                    <span className="text-sm font-medium text-slate-700">
                                                        {record.checkIn ||
                                                            "-"}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* ================= CHECK OUT ================= */}

                                            <td className="px-4 py-4">

                                                <div className="flex items-center gap-2">

                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />

                                                    <span className="text-sm font-medium text-slate-700">
                                                        {record.checkOut ||
                                                            "-"}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* ================= TASKS ================= */}

                                            <td className="px-4 py-4">

                                                <div className="min-w-[120px]">

                                                    <div className="flex items-center justify-between gap-3">

                                                        <span className="text-sm font-semibold text-slate-800">
                                                            {record.tasksCompleted ||
                                                                0}
                                                            /
                                                            {record.tasksAssigned ||
                                                                0}
                                                        </span>

                                                        <span className="text-xs text-slate-400">
                                                            tasks
                                                        </span>

                                                    </div>

                                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">

                                                        <div
                                                            className="
                                h-full
                                rounded-full
                                bg-[#17357A]
                                transition-all
                                duration-300
                              "
                                                            style={{
                                                                width: `${record.tasksAssigned &&
                                                                        record.tasksAssigned >
                                                                        0
                                                                        ? Math.min(
                                                                            100,
                                                                            Math.round(
                                                                                ((record.tasksCompleted ||
                                                                                    0) /
                                                                                    record.tasksAssigned) *
                                                                                100
                                                                            )
                                                                        )
                                                                        : 0
                                                                    }%`,
                                                            }}
                                                        />

                                                    </div>

                                                </div>

                                            </td>

                                            {/* ================= SCORE ================= */}

                                            <td className="px-4 py-4 text-center">

                                                <span
                                                    className={`
                            inline-flex
                            min-w-[58px]
                            items-center
                            justify-center
                            rounded-lg
                            px-2.5
                            py-1.5
                            text-xs
                            font-bold
                            ${score >= 80
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : score >= 50
                                                                ? "bg-amber-50 text-amber-700"
                                                                : "bg-red-50 text-red-700"
                                                        }
                          `}
                                                >
                                                    {score}%
                                                </span>

                                            </td>

                                            {/* ================= STATUS ================= */}

                                            <td className="px-4 py-4 text-center">

                                                <span
                                                    className={`
                            inline-flex
                            items-center
                            gap-2
                            whitespace-nowrap
                            rounded-full
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            ring-1
                            ring-inset
                            ${statusStyles.wrapper}
                          `}
                                                >

                                                    <span
                                                        className={`
                              h-1.5
                              w-1.5
                              rounded-full
                              ${statusStyles.dot}
                            `}
                                                    />

                                                    {record.status ||
                                                        "Unknown"}

                                                </span>

                                            </td>

                                            {/* ================= ACTIONS ================= */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center justify-center gap-1">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onEdit(record)
                                                        }
                                                        className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              text-slate-400
                              transition-all
                              hover:bg-[#17357A]/8
                              hover:text-[#17357A]
                              active:scale-95
                            "
                                                        title="Edit attendance"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onDelete(record)
                                                        }
                                                        className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              text-slate-400
                              transition-all
                              hover:bg-red-50
                              hover:text-red-600
                              active:scale-95
                            "
                                                        title="Delete attendance"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </section>
    );
};

export default EmployeeAttendanceTable;