import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportAttendanceExcel = (
  data: any[],
  fileName: string
) => {
  const rows = data.map((item) => ({
    Name:
      item.attendanceType === "EMPLOYEE"
        ? item.employee?.name
        : item.labour?.name,

    Type: item.attendanceType,

    "Role / Department":
      item.attendanceType === "EMPLOYEE"
        ? item.employee?.role
        : item.labour?.department,

    Date: new Date(item.date).toLocaleDateString(),

    "Check In": item.checkIn,

    "Check Out": item.checkOut,

    Assigned: item.tasksAssigned,

    Completed: item.tasksCompleted,

    Score: `${item.score}%`,

    Status: item.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Attendance"
  );

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(
    new Blob([buffer]),
    `${fileName}.xlsx`
  );
};