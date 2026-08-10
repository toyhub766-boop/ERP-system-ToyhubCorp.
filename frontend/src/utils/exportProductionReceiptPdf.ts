import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const getProductName = (item: any) => {
  return (
    item?.product?.name ||
    item?.product?.sku ||
    "-"
  );
};

const getProductSku = (item: any) => {
  return item?.product?.sku || "-";
};

const getBOMName = (item: any) => {
  return (
    item?.bom?.finishedProduct?.name ||
    item?.bom?.name ||
    "Assigned BOM"
  );
};

const getItemStatus = (item: any) => {
  if (item?.completed) {
    return "Completed";
  }

  if (
    item?.checklist?.preparing?.length > 0 ||
    item?.checklist?.leaving?.length > 0
  ) {
    return "In Progress";
  }

  return "Pending";
};

export const exportProductionReceiptPdf = (
  production: any
) => {
  if (!production) {
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  /*
  |--------------------------------------------------------------------------
  | HEADER
  |--------------------------------------------------------------------------
  */

  doc.setTextColor(23, 43, 107);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);

  doc.text(
    "TOY HUB CORPORATION",
    14,
    16
  );

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);

  doc.text(
    "Production Order Acknowledgement",
    14,
    22
  );

  doc.text(
    `Generated on ${new Date().toLocaleString(
      "en-IN"
    )}`,
    14,
    27
  );

  /*
  |--------------------------------------------------------------------------
  | ORDER SUMMARY
  |--------------------------------------------------------------------------
  */

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(225, 228, 235);

  doc.roundedRect(
    14,
    34,
    182,
    39,
    3,
    3,
    "FD"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 40, 60);

  doc.text(
    production.orderNumber || "-",
    19,
    42
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);

  doc.text(
    "Created Date",
    19,
    50
  );

  doc.text(
    "Target Date",
    72,
    50
  );

  doc.text(
    "Status",
    125,
    50
  );

  doc.text(
    "Production Team",
    19,
    62
  );

  doc.text(
    "Transport",
    72,
    62
  );

  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);

  doc.text(
    formatDate(
      production.createdAt
    ),
    19,
    56
  );

  doc.text(
    formatDate(
      production.targetDate
    ),
    72,
    56
  );

  doc.text(
    production.status || "-",
    125,
    56
  );

  doc.text(
    production.team || "Unassigned",
    19,
    68
  );

  doc.text(
    production.transport || "-",
    72,
    68
  );

  /*
  |--------------------------------------------------------------------------
  | CLIENT
  |--------------------------------------------------------------------------
  */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 40, 60);

  doc.text(
    "Client Information",
    14,
    84
  );

  doc.setDrawColor(225, 228, 235);

  doc.line(
    14,
    87,
    196,
    87
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);

  doc.text(
    "Client",
    14,
    95
  );

  doc.text(
    "Contact Person",
    75,
    95
  );

  doc.text(
    "Phone",
    140,
    95
  );

  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);

  doc.text(
    production.client?.name || "-",
    14,
    101
  );

  doc.text(
    production.client?.contactPerson ||
      "-",
    75,
    101
  );

  doc.text(
    production.client?.phone || "-",
    140,
    101
  );

  /*
  |--------------------------------------------------------------------------
  | PRODUCTS
  |--------------------------------------------------------------------------
  */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.text(
    "Production Items",
    14,
    114
  );

  const items =
    production.items || [];

  const tableRows = items.map(
    (item: any) => [
      getProductName(item),
      getProductSku(item),
      getBOMName(item),
      String(
        item.quantity ?? "-"
      ),
      getItemStatus(item),
      String(
        item.actualQuantity ??
          "-"
      ),
      item.readyForDispatch
        ? "Yes"
        : "No",
    ]
  );

  autoTable(doc, {
    startY: 118,

    margin: {
      left: 14,
      right: 14,
      bottom: 20,
    },

    head: [
      [
        "Product",
        "SKU",
        "BOM",
        "Qty",
        "Status",
        "Actual",
        "Dispatch",
      ],
    ],

    body: tableRows,

    theme: "grid",

    styles: {
      fontSize: 7,
      cellPadding: 2.5,
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
        cellWidth: 34,
      },

      1: {
        cellWidth: 24,
      },

      2: {
        cellWidth: 38,
      },

      3: {
        cellWidth: 15,
        halign: "center",
      },

      4: {
        cellWidth: 25,
        halign: "center",
      },

      5: {
        cellWidth: 20,
        halign: "center",
      },

      6: {
        cellWidth: 22,
        halign: "center",
      },
    },
  });

  /*
  |--------------------------------------------------------------------------
  | CHECKLIST / PRODUCTION NOTES
  |--------------------------------------------------------------------------
  */

  const finalY =
    (doc as any).lastAutoTable?.finalY ||
    125;

  let currentY =
    finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 40, 60);

  doc.text(
    "Production Notes",
    14,
    currentY
  );

  currentY += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);

  const notes =
    production.notes?.trim() ||
    "No production notes.";

  const noteLines =
    doc.splitTextToSize(
      notes,
      178
    );

  doc.text(
    noteLines,
    14,
    currentY
  );

  currentY +=
    noteLines.length * 4 + 7;

  /*
  |--------------------------------------------------------------------------
  | ITEM CHECKLIST
  |--------------------------------------------------------------------------
  */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 40, 60);

  doc.text(
    "Production Checkpoints",
    14,
    currentY
  );

  currentY += 6;

  items.forEach(
    (item: any, index: number) => {
      if (currentY > 255) {
        doc.addPage();
        currentY = 18;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);

      doc.text(
        `${index + 1}. ${getProductName(
          item
        )}`,
        14,
        currentY
      );

      currentY += 4;

      doc.setFont(
        "helvetica",
        "normal"
      );

      const preparing =
        item.checklist?.preparing
          ?.join(", ") ||
        "None recorded";

      const leaving =
        item.checklist?.leaving
          ?.join(", ") ||
        "None recorded";

      const reason =
        item.checklist?.reason ||
        "None recorded";

      const checkpointText =
        `Preparing: ${preparing} | Leaving: ${leaving} | Reason: ${reason}`;

      const lines =
        doc.splitTextToSize(
          checkpointText,
          178
        );

      doc.text(
        lines,
        18,
        currentY
      );

      currentY +=
        lines.length * 4 + 5;
    }
  );

  /*
  |--------------------------------------------------------------------------
  | ACKNOWLEDGEMENT
  |--------------------------------------------------------------------------
  */

  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  currentY += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.text(
    "Client Acknowledgement",
    14,
    currentY
  );

  currentY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);

  const acknowledgement =
    "The above production order and quantities have been reviewed and acknowledged.";

  const acknowledgementLines =
    doc.splitTextToSize(
      acknowledgement,
      178
    );

  doc.text(
    acknowledgementLines,
    14,
    currentY
  );

  currentY +=
    acknowledgementLines.length *
      4 +
    14;

  doc.setDrawColor(
    150,
    150,
    150
  );

  doc.line(
    14,
    currentY,
    75,
    currentY
  );

  doc.line(
    120,
    currentY,
    181,
    currentY
  );

  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);

  doc.text(
    "Client / Authorized Person",
    14,
    currentY + 5
  );

  doc.text(
    "Date",
    120,
    currentY + 5
  );

  /*
  |--------------------------------------------------------------------------
  | FOOTER
  |--------------------------------------------------------------------------
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
      "Toy Hub Corporation • Production",
      14,
      289
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      196,
      289,
      {
        align: "right",
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const safeFileName =
    String(
      production.orderNumber ||
        "Production_Order"
    )
      .trim()
      .replace(
        /[^a-zA-Z0-9-_]+/g,
        "_"
      );

  doc.save(
    `${safeFileName}_Receipt.pdf`
  );
};