import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatDate = (date: any) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
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

const getRoleOrDepartment = (
  item: any
) => {
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

const getScore = (item: any) => {
  if (
    typeof item.tasksAssigned ===
      "number" &&
    item.tasksAssigned > 0
  ) {
    return Math.round(
      (Number(
        item.tasksCompleted || 0
      ) /
        item.tasksAssigned) *
        100
    );
  }

  if (typeof item.score === "number") {
    return item.score;
  }

  return 0;
};

export const exportAttendancePdf = (
  data: any[],
  title: string
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  /*
   * =====================================================
   * HEADER
   * =====================================================
   */

  doc.setTextColor(
    23,
    43,
    107
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(20);

  doc.text(
    "TOY HUB CORPORATION",
    14,
    16
  );

  doc.setTextColor(
    40,
    40,
    40
  );

  doc.setFontSize(14);

  doc.text(
    title,
    14,
    24
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    110,
    110,
    110
  );

  doc.text(
    `Generated on ${new Date().toLocaleString(
      "en-IN"
    )}`,
    14,
    30
  );

  /*
   * =====================================================
   * SUMMARY
   * =====================================================
   */

  const totalRecords =
    data.length;

  const presentCount =
    data.filter(
      (item) =>
        item.status === "Present"
    ).length;

  const absentCount =
    data.filter(
      (item) =>
        item.status === "Absent"
    ).length;

  const leaveCount =
    data.filter(
      (item) =>
        item.status === "Leave"
    ).length;

  const assignedTasks =
    data.reduce(
      (total, item) =>
        total +
        Number(
          item.tasksAssigned || 0
        ),
      0
    );

  const completedTasks =
    data.reduce(
      (total, item) =>
        total +
        Number(
          item.tasksCompleted || 0
        ),
      0
    );

  const overallScore =
    assignedTasks > 0
      ? Math.round(
          (completedTasks /
            assignedTasks) *
            100
        )
      : 0;

  const cards = [
    {
      label: "Total Records",
      value: totalRecords,
    },
    {
      label: "Present",
      value: presentCount,
    },
    {
      label: "Absent",
      value: absentCount,
    },
    {
      label: "Leave",
      value: leaveCount,
    },
    {
      label: "Task Score",
      value: `${overallScore}%`,
    },
  ];

  let cardX = 14;

  cards.forEach((card) => {
    doc.setFillColor(
      248,
      250,
      252
    );

    doc.setDrawColor(
      225,
      228,
      235
    );

    doc.roundedRect(
      cardX,
      36,
      48,
      19,
      3,
      3,
      "FD"
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7);

    doc.setTextColor(
      100,
      100,
      100
    );

    doc.text(
      card.label,
      cardX + 4,
      43
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(12);

    doc.setTextColor(
      30,
      40,
      60
    );

    doc.text(
      String(card.value),
      cardX + 4,
      51
    );

    cardX += 53;
  });

  /*
   * =====================================================
   * TABLE DATA
   * =====================================================
   */

  const tableRows = data.map(
    (item) => [
      getPersonName(item),

      getRoleOrDepartment(item),

      formatDate(
        item.date ||
          item.createdAt
      ),

      item.checkIn || "-",

      item.checkOut || "-",

      item.tasksAssigned ??
        "-",

      item.tasksCompleted ??
        "-",

      item.tasksAssigned > 0 ||
      typeof item.score ===
        "number"
        ? `${getScore(item)}%`
        : "-",

      item.status || "-",
    ]
  );

  /*
   * =====================================================
   * TABLE
   * =====================================================
   */

  autoTable(doc, {
    startY: 62,

    margin: {
      left: 14,
      right: 14,
      bottom: 18,
    },

    head: [
      [
        "Name",
        "Role / Department",
        "Date",
        "Check In",
        "Check Out",
        "Assigned",
        "Completed",
        "Score",
        "Status",
      ],
    ],

    body: tableRows,

    theme: "grid",

    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: "middle",

      textColor: [
        45,
        55,
        72,
      ],

      lineColor: [
        225,
        228,
        235,
      ],

      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: [
        23,
        43,
        107,
      ],

      textColor: [
        255,
        255,
        255,
      ],

      fontStyle: "bold",

      halign: "center",

      valign: "middle",
    },

    alternateRowStyles: {
      fillColor: [
        248,
        250,
        252,
      ],
    },

    columnStyles: {
      0: {
        cellWidth: 38,
      },

      1: {
        cellWidth: 38,
      },

      2: {
        cellWidth: 27,
        halign: "center",
      },

      3: {
        cellWidth: 23,
        halign: "center",
      },

      4: {
        cellWidth: 23,
        halign: "center",
      },

      5: {
        cellWidth: 22,
        halign: "center",
      },

      6: {
        cellWidth: 22,
        halign: "center",
      },

      7: {
        cellWidth: 20,
        halign: "center",
      },

      8: {
        cellWidth: 27,
        halign: "center",
      },
    },
  });

  /*
   * =====================================================
   * FOOTER
   * =====================================================
   */

  const pageCount =
    doc.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    doc.setPage(page);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7);

    doc.setTextColor(
      120,
      120,
      120
    );

    doc.text(
      "Toy Hub Corporation • HR & Attendance",
      14,
      202
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      283,
      202,
      {
        align: "right",
      }
    );
  }

  /*
   * =====================================================
   * FILE NAME
   * =====================================================
   */

  const safeFileName =
    title
      .trim()
      .replace(
        /[^a-zA-Z0-9]+/g,
        "_"
      )
      .replace(
        /^_+|_+$/g,
        ""
      );

  doc.save(
    `${safeFileName || "Attendance_Report"}.pdf`
  );
};