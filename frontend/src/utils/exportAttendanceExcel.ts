import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const formatDate = (date: any) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getPersonName = (item: any) => {
  if (item.employee?.name) {
    return item.employee.name;
  }

  if (item.labour?.name) {
    return item.labour.name;
  }

  if (item.name) {
    return item.name;
  }

  return "-";
};

const getRoleOrDepartment = (item: any) => {
  if (item.employee?.role) {
    return item.employee.role;
  }

  if (item.labour?.department) {
    return item.labour.department;
  }

  if (item.department) {
    return item.department;
  }

  return "-";
};

const getType = (item: any) => {
  if (item.attendanceType === "EMPLOYEE") {
    return "Employee";
  }

  if (item.attendanceType === "LABOUR") {
    return "Labour";
  }

  if (item.employee) {
    return "Employee";
  }

  if (item.labour) {
    return "Labour";
  }

  return "-";
};

const getScore = (item: any) => {
  if (
    typeof item.tasksAssigned === "number" &&
    item.tasksAssigned > 0
  ) {
    return Math.round(
      (Number(item.tasksCompleted || 0) /
        item.tasksAssigned) *
        100
    );
  }

  if (typeof item.score === "number") {
    return item.score;
  }

  return 0;
};

export const exportAttendanceExcel = (
  data: any[],
  fileName: string
) => {
  const rows = data.map((item) => ({
    Name: getPersonName(item),

    Type: getType(item),

    "Role / Department":
      getRoleOrDepartment(item),

    "Employee ID":
      item.employee?.employeeId ||
      item.employeeId ||
      "-",

    Date: formatDate(
      item.date || item.createdAt
    ),

    "Check In":
      item.checkIn || "-",

    "Check Out":
      item.checkOut || "-",

    "Tasks Assigned":
      item.tasksAssigned ?? "-",

    "Tasks Completed":
      item.tasksCompleted ?? "-",

    Score:
      item.tasksAssigned > 0 ||
      typeof item.score === "number"
        ? `${getScore(item)}%`
        : "-",

    Status:
      item.status || "-",
  }));

  const workbook =
    XLSX.utils.book_new();

  const worksheet =
    XLSX.utils.aoa_to_sheet([
      [fileName],
      [
        "Toy Hub Corporation",
      ],
      [
        `Generated: ${new Date().toLocaleString(
          "en-IN"
        )}`,
      ],
      [],
    ]);

  XLSX.utils.sheet_add_json(
    worksheet,
    rows,
    {
      origin: "A5",
    }
  );

  /*
   * Column widths
   */
  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 13 },
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 19 },
    { wch: 12 },
    { wch: 16 },
  ];

  /*
   * Merge report heading
   */
  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 10 },
    },
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: 10 },
    },
    {
      s: { r: 2, c: 0 },
      e: { r: 2, c: 10 },
    },
  ];

  /*
   * Freeze report table header
   */
  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 5,
  };

  /*
   * Enable filtering
   */
  if (rows.length > 0) {
    worksheet["!autofilter"] = {
      ref: `A5:K${rows.length + 5}`,
    };
  }

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Attendance Report"
  );

  const buffer = XLSX.write(
    workbook,
    {
      bookType: "xlsx",
      type: "array",
    }
  );

  const blob = new Blob(
    [buffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  saveAs(
    blob,
    `${fileName}.xlsx`
  );
};