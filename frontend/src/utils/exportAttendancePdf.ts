import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportAttendancePdf = (
  data: any[],
  title: string
) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 18);

  autoTable(doc, {
    startY: 28,

    head: [[
      "Name",
      "Type",
      "Role / Department",
      "Date",
      "Check In",
      "Check Out",
      "Assigned",
      "Completed",
      "Score",
      "Status",
    ]],

    body: data.map((item) => [
      item.attendanceType === "EMPLOYEE"
        ? item.employee?.name
        : item.labour?.name,

      item.attendanceType,

      item.attendanceType === "EMPLOYEE"
        ? item.employee?.role
        : item.labour?.department,

      new Date(item.date).toLocaleDateString(),

      item.checkIn,

      item.checkOut,

      item.tasksAssigned,

      item.tasksCompleted,

      `${item.score}%`,

      item.status,
    ]),
  });

  doc.save("attendance.pdf");
};