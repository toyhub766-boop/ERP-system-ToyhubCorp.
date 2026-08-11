import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../../app/layouts/AdminLayout";

import {
  getAttendance,
  deleteAttendance,
} from "../services/attendance.service";

import {
  getLabours,
  deleteLabour,
} from "../../labour/services/labour.service";

import AttendanceModal from "../components/AttendanceModal";
import LabourModal from "../../labour/components/LabourModal";
import EmployeeAttendanceTable from "../components/EmployeeAttendanceTable";
import AttendancePhotoPreview from "../components/AttendancePhotoPreview";

import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiDownload,
  FiFileText,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiSearch,
  FiChevronDown,
  FiClipboard,
} from "react-icons/fi";

import { exportAttendanceExcel } from "../../../utils/exportAttendanceExcel";
import { exportAttendancePdf } from "../../../utils/exportAttendancePdf";

const AttendancePage = () => {
  const navigate = useNavigate();

  const [tab, setTab] =
    useState<"EMPLOYEE" | "LABOUR">("EMPLOYEE");

  const [attendance, setAttendance] =
    useState<any[]>([]);

  const [labours, setLabours] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [showAttendanceModal, setShowAttendanceModal] =
    useState(false);

  const [showLabourModal, setShowLabourModal] =
    useState(false);

  const [editingAttendance, setEditingAttendance] =
    useState<any>(null);

  const [editingLabour, setEditingLabour] =
    useState<any>(null);

  /* =========================
     PHOTO PREVIEW
  ========================= */

  const [previewPhoto, setPreviewPhoto] =
    useState("");

  const [previewEmployee, setPreviewEmployee] =
    useState("");

  const [previewDate, setPreviewDate] =
    useState("");

  /* =========================
     LOAD DATA
  ========================= */

  const loadAttendance = async () => {
    try {
      const data = await getAttendance();
      setAttendance(data);
    } catch (error) {
      console.error(
        "Failed to load attendance:",
        error
      );
    }
  };

  const loadLabours = async () => {
    try {
      const data = await getLabours();
      setLabours(data);
    } catch (error) {
      console.error(
        "Failed to load labour:",
        error
      );
    }
  };

  useEffect(() => {
    loadAttendance();
    loadLabours();
  }, []);

  /* =========================
     FILTER ATTENDANCE
  ========================= */

  const filteredAttendance = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return attendance.filter(
      (record: any) => {
        const name =
          record.employee?.name ||
          record.labour?.name ||
          "";

        const role =
          record.employee?.role ||
          record.labour?.department ||
          "";

        const employeeId =
          record.employee?.employeeId ||
          "";

        const searchValue =
          `${name} ${role} ${employeeId}`
            .toLowerCase();

        const matchesSearch =
          !query ||
          searchValue.includes(query);

        const matchesStatus =
          statusFilter === "All" ||
          record.status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    attendance,
    search,
    statusFilter,
  ]);

  /* =========================
     FILTER LABOURS
  ========================= */

  const filteredLabours = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return labours.filter(
      (labour: any) => {
        const searchValue = `
          ${labour.name || ""}
          ${labour.department || ""}
          ${labour.phone || ""}
        `.toLowerCase();

        return searchValue.includes(query);
      }
    );
  }, [labours, search]);

  /* =========================
     STATISTICS
  ========================= */

  const employeeStats = useMemo(() => {
    const total =
      attendance.length;

    const present =
      attendance.filter(
        (record) =>
          record.status === "Present"
      ).length;

    const absent =
      attendance.filter(
        (record) =>
          record.status === "Absent"
      ).length;

    const leave =
      attendance.filter(
        (record) =>
          record.status === "Leave"
      ).length;

    return {
      total,
      present,
      absent,
      leave,
    };
  }, [attendance]);

  /* =========================
     EXPORTS
  ========================= */

  const handleExcelExport = () => {
    const data =
      tab === "EMPLOYEE"
        ? filteredAttendance
        : filteredLabours;

    exportAttendanceExcel(
      data,
      tab === "EMPLOYEE"
        ? "attendance"
        : "labours"
    );
  };

  const handlePdfExport = () => {
    const data =
      tab === "EMPLOYEE"
        ? filteredAttendance
        : filteredLabours;

    exportAttendancePdf(
      data,
      tab === "EMPLOYEE"
        ? "attendance"
        : "labours"
    );
  };

  /* =========================
     DELETE
  ========================= */

  const handleDeleteAttendance = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Delete this attendance record?"
      );

    if (!confirmed) return;

    try {
      await deleteAttendance(id);
      await loadAttendance();
    } catch (error) {
      console.error(
        "Failed to delete attendance:",
        error
      );
    }
  };

  const handleDeleteLabour = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Delete this labour record?"
      );

    if (!confirmed) return;

    try {
      await deleteLabour(id);
      await loadLabours();
    } catch (error) {
      console.error(
        "Failed to delete labour:",
        error
      );
    }
  };

  /* =========================
     PHOTO
  ========================= */

  const handleViewPhoto = (
    photo: string,
    employeeName: string,
    date?: string
  ) => {
    setPreviewPhoto(photo);
    setPreviewEmployee(
      employeeName
    );
    setPreviewDate(
      date || ""
    );
  };

  const closePhotoPreview = () => {
    setPreviewPhoto("");
    setPreviewEmployee("");
    setPreviewDate("");
  };

  /* =========================
     UI
  ========================= */

  return (
    <AdminLayout>

      <div className="mx-auto w-full max-w-[1500px] space-y-6">

        {/* =========================================
            HEADER
        ========================================= */}

        <section
          className="
            rounded-3xl
            border border-slate-200
            bg-white
            p-6
            shadow-[0_8px_30px_rgba(15,23,42,0.04)]
            sm:p-7
          "
        >

          <div
            className="
              flex
              flex-col
              gap-6
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div className="min-w-0">

              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Admin</span>

                <span>/</span>

                <span className="text-slate-600">
                  Attendance
                </span>
              </div>

              <h1
                className="
                  mt-3
                  text-3xl
                  font-bold
                  tracking-tight
                  text-slate-900
                  sm:text-4xl
                "
              >
                Attendance Management
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Manage employee and labour
                attendance, working hours and
                daily records from one place.
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                if (tab === "EMPLOYEE") {
                  setEditingAttendance(null);
                  setShowAttendanceModal(true);
                } else {
                  setEditingLabour(null);
                  setShowLabourModal(true);
                }
              }}
              className="
                inline-flex
                h-11
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#172B6B]
                px-5
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:bg-[#20398F]
                hover:shadow-md
                active:scale-[0.98]
              "
            >
              <FiPlus size={17} />

              {tab === "EMPLOYEE"
                ? "Add Attendance"
                : "Add Labour"}
            </button>

          </div>

        </section>

        {/* =========================================
            STATS
        ========================================= */}

        {tab === "EMPLOYEE" && (
          <section
            className="
              grid
              grid-cols-2
              gap-4
              xl:grid-cols-4
            "
          >

            <StatCard
              label="Total Records"
              value={employeeStats.total}
              icon={<FiUsers size={19} />}
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              label="Present"
              value={employeeStats.present}
              icon={<FiCheckCircle size={19} />}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              label="Absent"
              value={employeeStats.absent}
              icon={<FiAlertCircle size={19} />}
              iconClass="bg-red-50 text-red-600"
            />

            <StatCard
              label="On Leave"
              value={employeeStats.leave}
              icon={<FiClock size={19} />}
              iconClass="bg-amber-50 text-amber-600"
            />

          </section>
        )}

        {/* =========================================
            MAIN PANEL
        ========================================= */}

        <section
          className="
            overflow-hidden
            rounded-3xl
            border border-slate-200
            bg-white
            shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          "
        >

          {/* TABS */}

          <div
            className="
              border-b
              border-slate-200
              px-4
              py-4
              sm:px-6
            "
          >

            <div
              className="
                flex
                flex-col
                gap-3
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >

              <div
                className="
                  inline-flex
                  w-full
                  overflow-x-auto
                  rounded-xl
                  bg-slate-100
                  p-1
                  sm:w-auto
                "
              >

                <TabButton
                  active={tab === "EMPLOYEE"}
                  onClick={() => {
                    setTab("EMPLOYEE");
                    setSearch("");
                    setStatusFilter("All");
                  }}
                >
                  <FiUsers size={16} />
                  Employee Attendance
                </TabButton>

                <TabButton
                  active={tab === "LABOUR"}
                  onClick={() => {
                    setTab("LABOUR");
                    setSearch("");
                    setStatusFilter("All");
                  }}
                >
                  <FiUsers size={16} />
                  Labour Management
                </TabButton>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/tasks")
                }
                className="
                  inline-flex
                  h-10
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-slate-600
                  transition-all
                  hover:border-slate-300
                  hover:bg-slate-50
                  hover:text-slate-900
                "
              >
                <FiClipboard size={16} />

                Tasks & Checklists
              </button>

            </div>

          </div>

          {/* TOOLBAR */}

          <div
            className="
              border-b
              border-slate-200
              bg-slate-50/50
              p-4
              sm:p-5
            "
          >

            <div
              className="
                flex
                flex-col
                gap-3
                xl:flex-row
                xl:items-center
                xl:justify-between
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                "
              >

                {/* SEARCH */}

                <div
                  className="
                    relative
                    w-full
                    sm:w-[320px]
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
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder={
                      tab === "EMPLOYEE"
                        ? "Search employee or role..."
                        : "Search labour, department or phone..."
                    }
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-10
                      pr-4
                      text-sm
                      text-slate-800
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-[#172B6B]
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />

                </div>

                {/* STATUS */}

                {tab === "EMPLOYEE" && (
                  <div className="relative">

                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(
                          e.target.value
                        )
                      }
                      className="
                        h-11
                        w-full
                        appearance-none
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        pr-10
                        text-sm
                        font-medium
                        text-slate-700
                        outline-none
                        transition-all
                        focus:border-[#172B6B]
                        focus:ring-4
                        focus:ring-blue-50
                        sm:w-44
                      "
                    >
                      <option value="All">
                        All Status
                      </option>

                      <option value="Present">
                        Present
                      </option>

                      <option value="Absent">
                        Absent
                      </option>

                      <option value="Half Day">
                        Half Day
                      </option>

                      <option value="Leave">
                        Leave
                      </option>
                    </select>

                    <FiChevronDown
                      size={16}
                      className="
                        pointer-events-none
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                  </div>
                )}

              </div>

              {/* EXPORT */}

              <div
                className="
                  flex
                  flex-col
                  gap-2
                  sm:flex-row
                "
              >

                <button
                  type="button"
                  onClick={handleExcelExport}
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-sm
                    font-semibold
                    text-slate-700
                    shadow-sm
                    transition-all
                    hover:border-slate-300
                    hover:bg-slate-50
                    hover:shadow
                    active:scale-[0.98]
                  "
                >
                  <FiDownload size={16} />

                  Export Excel
                </button>

                <button
                  type="button"
                  onClick={handlePdfExport}
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#172B6B]
                    px-4
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    hover:bg-[#20398F]
                    hover:shadow-md
                    active:scale-[0.98]
                  "
                >
                  <FiFileText size={16} />

                  Export PDF
                </button>

              </div>

            </div>

          </div>

          {/* =========================================
              EMPLOYEE TABLE
          ========================================= */}

          {tab === "EMPLOYEE" && (
            <div className="overflow-x-auto">

              <EmployeeAttendanceTable
                records={filteredAttendance}
                onEdit={(record) => {
                  setEditingAttendance(record);
                  setShowAttendanceModal(true);
                }}
                onDelete={(record) => {
                  handleDeleteAttendance(
                    record._id
                  );
                }}
                onViewPhoto={
                  handleViewPhoto
                }
              />

            </div>
          )}

          {/* =========================================
              LABOUR TABLE
          ========================================= */}

          {tab === "LABOUR" && (
            <div className="overflow-x-auto">

              <table className="min-w-[900px] w-full">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">

                    <TableHead>
                      Name
                    </TableHead>

                    <TableHead>
                      Department
                    </TableHead>

                    <TableHead align="center">
                      Daily Wage
                    </TableHead>

                    <TableHead align="center">
                      Phone
                    </TableHead>

                    <TableHead align="center">
                      Status
                    </TableHead>

                    <TableHead align="center">
                      Actions
                    </TableHead>

                  </tr>
                </thead>

                <tbody>

                  {filteredLabours.length === 0 ? (

                    <tr>
                      <td
                        colSpan={6}
                        className="
                          px-6
                          py-20
                          text-center
                        "
                      >
                        <div className="flex flex-col items-center">

                          <div
                            className="
                              flex
                              h-12
                              w-12
                              items-center
                              justify-center
                              rounded-2xl
                              bg-slate-100
                              text-slate-400
                            "
                          >
                            <FiUsers size={20} />
                          </div>

                          <p className="mt-4 text-sm font-semibold text-slate-800">
                            No labour records found
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Try changing your search.
                          </p>

                        </div>
                      </td>
                    </tr>

                  ) : (

                    filteredLabours.map(
                      (labour: any) => (

                        <tr
                          key={labour._id}
                          className="
                            border-b
                            border-slate-100
                            transition-colors
                            hover:bg-slate-50/70
                          "
                        >

                          <td className="px-6 py-4">

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
                                  bg-slate-100
                                  text-sm
                                  font-bold
                                  text-slate-600
                                "
                              >
                                {(labour.name || "-")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {labour.name || "-"}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  Labour
                                </p>
                              </div>

                            </div>

                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {labour.department || "-"}
                          </td>

                          <td className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                            ₹
                            {Number(
                              labour.dailyWage ?? 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-6 py-4 text-center text-sm text-slate-600">
                            {labour.phone || "-"}
                          </td>

                          <td className="px-6 py-4 text-center">

                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                ${
                                  labour.status ===
                                  "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                }
                              `}
                            >
                              {labour.status ||
                                "-"}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex justify-center gap-1">

                              <IconButton
                                label="Edit labour"
                                onClick={() => {
                                  setEditingLabour(
                                    labour
                                  );
                                  setShowLabourModal(
                                    true
                                  );
                                }}
                              >
                                <FiEdit2 size={16} />
                              </IconButton>

                              <IconButton
                                label="Delete labour"
                                danger
                                onClick={() =>
                                  handleDeleteLabour(
                                    labour._id
                                  )
                                }
                              >
                                <FiTrash2 size={16} />
                              </IconButton>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* =========================================
            MODALS
        ========================================= */}

        <AttendanceModal
          open={showAttendanceModal}
          attendance={editingAttendance}
          onClose={() => {
            setShowAttendanceModal(false);
            setEditingAttendance(null);
          }}
          onSuccess={async () => {
            await loadAttendance();

            setShowAttendanceModal(false);
            setEditingAttendance(null);
          }}
        />

        <LabourModal
          open={showLabourModal}
          labour={editingLabour}
          onClose={() => {
            setShowLabourModal(false);
            setEditingLabour(null);
          }}
          onSuccess={async () => {
            await loadLabours();

            setShowLabourModal(false);
            setEditingLabour(null);
          }}
        />

        {/* =========================================
            PHOTO PREVIEW
        ========================================= */}

        <AttendancePhotoPreview
          open={Boolean(previewPhoto)}
          photo={previewPhoto}
          employeeName={previewEmployee}
          date={previewDate}
          onClose={closePhotoPreview}
        />

      </div>

    </AdminLayout>
  );
};

/* =====================================================
   SMALL UI COMPONENTS
===================================================== */

const StatCard = ({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) => {
  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-[0_4px_20px_rgba(15,23,42,0.03)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]
      "
    >

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            ${iconClass}
          `}
        >
          {icon}
        </div>

      </div>

    </div>
  );
};

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        h-10
        shrink-0
        items-center
        justify-center
        gap-2
        rounded-lg
        px-4
        text-sm
        font-semibold
        transition-all
        duration-200
        ${
          active
            ? "bg-white text-[#172B6B] shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }
      `}
    >
      {children}
    </button>
  );
};

const TableHead = ({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) => {
  return (
    <th
      className={`
        px-6
        py-4
        text-${align}
        text-[11px]
        font-semibold
        uppercase
        tracking-[0.08em]
        text-slate-400
      `}
    >
      {children}
    </th>
  );
};

const IconButton = ({
  children,
  onClick,
  label,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        transition-all
        duration-200
        ${
          danger
            ? "text-red-500 hover:bg-red-50 hover:text-red-600"
            : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
        }
      `}
    >
      {children}
    </button>
  );
};

export default AttendancePage;