import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportCapacityPdf = (
  result: any,
  productName: string,
  requestedQuantity: number,
  title = "Production Capacity Report"
) => {
  if (!result) return;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setTextColor(23, 43, 107);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);

  doc.text(
    "TOY HUB CORPORATION",
    14,
    16
  );

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);

  doc.text(title, 14, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);

  doc.text(
    `Generated on ${new Date().toLocaleString("en-IN")}`,
    14,
    30
  );

  /*
   * SUMMARY CARDS
   */

  const cards = [
    {
      label: "Product",
      value: productName || "-",
    },
    {
      label: "Requested",
      value: requestedQuantity,
    },
    {
      label: "Maximum Producible",
      value: result.maximumProducible ?? "-",
    },
    {
      label: "Bottleneck",
      value: result.bottleneck || "None",
    },
  ];

  let cardX = 14;

  cards.forEach((card) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(225, 228, 235);

    doc.roundedRect(
      cardX,
      36,
      62,
      22,
      3,
      3,
      "FD"
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);

    doc.text(
      card.label,
      cardX + 4,
      43
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 40, 60);

    const value = String(card.value);

    doc.text(
      value.length > 18
        ? `${value.substring(0, 18)}...`
        : value,
      cardX + 4,
      51
    );

    cardX += 67;
  });

  /*
   * MATERIAL TABLE
   */

  const tableRows = (
    result.materials || []
  ).map((item: any) => [
    item.product || "-",
    item.required ?? "-",
    item.available ?? "-",
    item.shortage ?? 0,
    item.sufficient
      ? "Available"
      : "Short",
  ]);

  autoTable(doc, {
    startY: 66,

    margin: {
      left: 14,
      right: 14,
      bottom: 18,
    },

    head: [
      [
        "Material",
        "Required",
        "Available",
        "Shortage",
        "Status",
      ],
    ],

    body: tableRows,

    theme: "grid",

    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: "middle",
      textColor: [45, 55, 72],
      lineColor: [225, 228, 235],
      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: [23, 43, 107],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },

    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },

    columnStyles: {
      0: {
        cellWidth: 65,
      },
      1: {
        cellWidth: 35,
        halign: "center",
      },
      2: {
        cellWidth: 35,
        halign: "center",
      },
      3: {
        cellWidth: 30,
        halign: "center",
      },
      4: {
        cellWidth: 35,
        halign: "center",
      },
    },
  });

  /*
   * FOOTER
   */

  const pageCount = doc.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    doc.setPage(page);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);

    doc.text(
      "Toy Hub Corporation • Production Capacity",
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

  const safeFileName = title
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  doc.save(
    `${safeFileName || "Production_Capacity"}.pdf`
  );
};