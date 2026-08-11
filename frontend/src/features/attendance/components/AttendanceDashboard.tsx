import { useMemo, useState } from "react";

import AttendanceHeader from "./AttendanceHeader";
import AttendanceOverview from "./AttendanceOverview";
import AttendanceToolbar from "./AttendanceToolbar";
import EmployeeAttendanceTable from "./EmployeeAttendanceTable";
import LabourAttendanceTable from "./LabourAttendanceTable";
import AttendancePhotoPreview from "./AttendancePhotoPreview";

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
  const [activeTab, setActiveTab] =
    useState<
      "employee" | "labour"
    >("employee");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const [previewPhoto, setPreviewPhoto] =
    useState("");

  const [previewEmployee, setPreviewEmployee] =
    useState("");

  const [previewDate, setPreviewDate] =
    useState("");

  /*
   * =========================================================
   * TAB RECORDS
   * =========================================================
   */

  const tabRecords = useMemo(() => {
    const type =
      activeTab === "employee"
        ? "EMPLOYEE"
        : "LABOUR";

    return attendance.filter(
      (record) =>
        record.attendanceType === type
    );
  }, [
    attendance,
    activeTab,
  ]);

  /*
   * =========================================================
   * FILTERED RECORDS
   * =========================================================
   */

  const filteredRecords =
    useMemo(() => {
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
   * =========================================================
   * TAB CHANGE
   * =========================================================
   */

  const handleTabChange = (
    tab: "employee" | "labour"
  ) => {
    setActiveTab(tab);
    setSearch("");
    setStatus("All");

    // Close any open photo when
    // switching between datasets.
    closePhotoPreview();
  };

  /*
   * =========================================================
   * PHOTO PREVIEW
   * =========================================================
   */

  const handleViewPhoto = (
    photo: string,
    employeeName: string,
    date?: string
  ) => {
    if (!photo) return;

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

  return (
    <div className="min-h-full bg-[#F6F8FC]">

      <div
        className="
          mx-auto
          w-full
          max-w-[1500px]
          px-3
          py-6
          sm:px-5
          sm:py-8
          lg:px-8
          lg:py-10
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <AttendanceHeader
          activeTab={activeTab}
          onTabChange={
            handleTabChange
          }
          onAddAttendance={
            onAddAttendance
          }
        />

        {/* =================================================
            OVERVIEW
        ================================================= */}

        <AttendanceOverview
          records={tabRecords}
        />

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="mt-7">

          <AttendanceToolbar
            search={search}
            status={status}
            onSearchChange={
              setSearch
            }
            onStatusChange={
              setStatus
            }
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

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="mt-5">

          {activeTab ===
            "employee" && (
            <EmployeeAttendanceTable
              records={
                filteredRecords
              }
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

          {activeTab ===
            "labour" && (
            <LabourAttendanceTable
              records={
                filteredRecords
              }
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

        </div>

      </div>

      {/* ===================================================
          PHOTO PREVIEW
      =================================================== */}

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