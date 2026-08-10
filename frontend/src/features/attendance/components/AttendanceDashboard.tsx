import { useMemo, useState } from "react";

import AttendanceHeader from "./AttendanceHeader";
import AttendanceOverview from "./AttendanceOverview";
import AttendanceToolbar from "./AttendanceToolbar";
import EmployeeAttendanceTable from "./EmployeeAttendanceTable";
import AttendancePhotoPreview from "./AttendancePhotoPreview";
import LabourAttendanceTable from "./LabourAttendanceTable";

interface AttendanceRecord {
  _id: string;

  attendanceType?:
    | "EMPLOYEE"
    | "LABOUR";

  employee?: any;
  labour?: any;

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

  remarks?: string;

  photo?: string;
}

interface Props {
  attendance: AttendanceRecord[];

  onAddAttendance: () => void;

  onEditAttendance: (
    record: AttendanceRecord
  ) => void;

  onDeleteAttendance: (
    record: AttendanceRecord
  ) => void;

  onExportExcel: (
    records: AttendanceRecord[]
  ) => void;

  onExportPdf: (
    records: AttendanceRecord[]
  ) => void;
}

const AttendanceDashboard = ({
  attendance,
  onAddAttendance,
  onEditAttendance,
  onDeleteAttendance,
  onExportExcel,
  onExportPdf,
}: Props) => {
  const [
    activeTab,
    setActiveTab,
  ] = useState<
    "employee" | "labour"
  >("employee");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const [
    previewPhoto,
    setPreviewPhoto,
  ] = useState("");

  const [
    previewEmployee,
    setPreviewEmployee,
  ] = useState("");

  const [
  previewDate,
  setPreviewDate,
] = useState("");

  /*
   * ===============================
   * TAB RECORDS
   * ===============================
   */

  const tabRecords = useMemo(() => {
    return attendance.filter(
      (record) =>
        record.attendanceType ===
        (activeTab === "employee"
          ? "EMPLOYEE"
          : "LABOUR")
    );
  }, [
    attendance,
    activeTab,
  ]);

  /*
   * ===============================
   * SEARCH + STATUS
   * ===============================
   */

  const filteredRecords = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return tabRecords.filter(
      (record) => {

        const person =
          activeTab === "employee"
            ? record.employee
            : record.labour;

        const name =
          person?.name
            ?.toLowerCase() || "";

        const role =
          person?.role
            ?.toLowerCase() || "";

        const employeeId =
          person?.employeeId
            ?.toLowerCase() || "";

        const matchesSearch =
          !normalizedSearch ||
          name.includes(
            normalizedSearch
          ) ||
          role.includes(
            normalizedSearch
          ) ||
          employeeId.includes(
            normalizedSearch
          );

        const matchesStatus =
          status === "All" ||
          record.status === status;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    tabRecords,
    search,
    status,
    activeTab,
  ]);

  /*
   * ===============================
   * TAB CHANGE
   * ===============================
   */

  const handleTabChange = (
    tab: "employee" | "labour"
  ) => {
    setActiveTab(tab);
    setSearch("");
    setStatus("All");
  };

  /*
   * ===============================
   * PHOTO PREVIEW
   * ===============================
   */

  const handleViewPhoto = (
  photo: string,
  employeeName: string,
  date?: string
) => {
  setPreviewPhoto(photo);
  setPreviewEmployee(
    employeeName
  );
  setPreviewDate(date || "");
};

  const closePhotoPreview = () => {
  setPreviewPhoto("");
  setPreviewEmployee("");
  setPreviewDate("");
};

  return (
    <div className="min-h-full bg-slate-50">

      <div
        className="
          mx-auto
          w-full
          max-w-[1500px]
          px-4
          py-6
          sm:px-6
          sm:py-8
          lg:px-8
          lg:py-10
        "
      >

        {/* ================= HEADER ================= */}

        <AttendanceHeader
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onAddAttendance={
            onAddAttendance
          }
        />

        {/* ================= OVERVIEW ================= */}

        <AttendanceOverview
          records={tabRecords}
        />

        {/* ================= TOOLBAR ================= */}

        <AttendanceToolbar
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onExportExcel={() =>
            onExportExcel(
              filteredRecords
            )
          }
          onExportPdf={() =>
            onExportPdf(
              filteredRecords
            )
          }
        />

        {/* ================= EMPLOYEE TABLE ================= */}

        {activeTab === "employee" && (
          <EmployeeAttendanceTable
            records={filteredRecords}
            onEdit={
              onEditAttendance
            }
            onDelete={
              onDeleteAttendance
            }
            onViewPhoto={
              handleViewPhoto
            }
          />
        )}

        {/* ================= LABOUR ================= */}

        {activeTab === "labour" && (
  <LabourAttendanceTable
    records={filteredRecords}
    onEdit={onEditAttendance}
    onDelete={onDeleteAttendance}
    onViewPhoto={handleViewPhoto}
  />
)}

      </div>

      {/* ================= PHOTO PREVIEW ================= */}

      <AttendancePhotoPreview
  open={Boolean(
    previewPhoto
  )}
  photo={previewPhoto}
  employeeName={
    previewEmployee
  }
  date={previewDate}
  onClose={
    closePhotoPreview
  }
/>

    </div>
  );
};

export default AttendanceDashboard;