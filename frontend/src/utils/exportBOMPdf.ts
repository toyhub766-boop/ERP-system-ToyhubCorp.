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

export const exportBOMPdf = (
  data: any[],
  title = "BOM Report"
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  /*
   * HEADER
   */

  doc.setTextColor(23, 43, 107);

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

  doc.setTextColor(40, 40, 40);

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
   * SUMMARY
   */

  const totalBOMs = data.length;

  const totalMaterials = data.reduce(
    (total, bom) =>
      total +
      Number(
        bom.materials?.length || 0
      ),
    0
  );

  const cards = [
    {
      label: "Total BOMs",
      value: totalBOMs,
    },
    {
      label: "Material Entries",
      value: totalMaterials,
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
      55,
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

    cardX += 61;
  });

  /*
   * TABLE
   */

  const tableRows: any[] = [];

  data.forEach((bom) => {
    const materials =
      bom.materials || [];

    if (materials.length === 0) {
      tableRows.push([
        bom.finishedProduct?.name ||
          "-",

        bom.finishedProduct?.sku ||
          "-",

        "-",
        "-",
        "-",
        "-",
        "-",

        formatDate(
          bom.createdAt
        ),

        formatDate(
          bom.updatedAt
        ),
      ]);

      return;
    }

    materials.forEach((item: any) => {
      tableRows.push([
        bom.finishedProduct?.name ||
          "-",

        bom.finishedProduct?.sku ||
          "-",

        item.product?.name ||
          "-",

        item.product?.sku ||
          "-",

        item.quantity ?? "-",

        item.product?.unit ||
          "-",

        item.product?.currentStock ??
          "-",

        formatDate(
          bom.createdAt
        ),

        formatDate(
          bom.updatedAt
        ),
      ]);
    });
  });

  autoTable(doc, {
    startY: 62,

    margin: {
      left: 14,
      right: 14,
      bottom: 18,
    },

    head: [
      [
        "Finished Product",
        "SKU",
        "Raw Material",
        "Material SKU",
        "Required Qty",
        "Unit",
        "Available Stock",
        "Created",
        "Updated",
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
        cellWidth: 40,
      },

      1: {
        cellWidth: 24,
      },

      2: {
        cellWidth: 40,
      },

      3: {
        cellWidth: 26,
      },

      4: {
        cellWidth: 27,
        halign: "center",
      },

      5: {
        cellWidth: 18,
        halign: "center",
      },

      6: {
        cellWidth: 28,
        halign: "center",
      },

      7: {
        cellWidth: 25,
        halign: "center",
      },

      8: {
        cellWidth: 25,
        halign: "center",
      },
    },
  });

  /*
   * FOOTER
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
      "Toy Hub Corporation • Bill of Materials",
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
    `${
      safeFileName ||
      "BOM_Report"
    }.pdf`
  );
};