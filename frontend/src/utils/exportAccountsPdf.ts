import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import logo from "../assets/images/logo.png";

interface AccountExportRow {
  date: string | Date;
  partyCode: string;
  partyName: string;
  partyType: string;
  contactPerson: string;
  transactionType: string;
  paymentMethod: string;
  amount: number;
  balance: number;
  remarks: string;
}

interface AccountExportSummary {
  totalParties: number;
  customers: number;
  suppliers: number;
  companyExpenses: number;
  youllGet: number;
  youllGive: number;
}

const formatAmount = (value: number) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value: string | Date) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("en-IN");
};

const getImageData = async (
  imagePath: string
): Promise<string> => {
  const response = await fetch(imagePath);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
};

export const exportAccountsPdf = async (
  rows: AccountExportRow[],
  summary: AccountExportSummary,
  fileName: string
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // ==========================================
  // LOGO
  // ==========================================

  try {
    const logoData = await getImageData(logo);

    doc.addImage(
      logoData,
      "PNG",
      14,
      10,
      28,
      16
    );
  } catch (error) {
    console.error(
      "Failed to load logo:",
      error
    );
  }

  // ==========================================
  // HEADER
  // ==========================================

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");

  doc.text(
    "TOY HUB CORPORATION",
    48,
    17
  );

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.text(
    "Accounts Ledger Report",
    48,
    24
  );

  doc.setFontSize(8);

  doc.text(
    `Generated: ${new Date().toLocaleString(
      "en-IN"
    )}`,
    283,
    17,
    {
      align: "right",
    }
  );

  // ==========================================
  // SUMMARY
  // ==========================================

  const summaryY = 34;

  autoTable(doc, {
    startY: summaryY,

    theme: "grid",

    head: [[
      "Total Parties",
      "Customers",
      "Suppliers",
      "Company Expenses",
      "You'll Get",
      "You'll Give",
    ]],

    body: [[
      summary.totalParties,
      summary.customers,
      summary.suppliers,
      summary.companyExpenses,
      formatAmount(summary.youllGet),
      formatAmount(summary.youllGive),
    ]],

    styles: {
      fontSize: 8,
      cellPadding: 4,
      halign: "center",
      valign: "middle",
    },

    headStyles: {
      fontStyle: "bold",
    },
  });

  // ==========================================
  // TRANSACTIONS
  // ==========================================

  const transactionRows =
    rows.map((row) => [
      formatDate(row.date),
      row.partyCode || "--",
      row.partyName || "--",
      row.partyType || "--",
      row.contactPerson || "--",
      row.transactionType || "--",
      row.paymentMethod || "--",
      formatAmount(row.amount),
      formatAmount(row.balance),
      row.remarks || "--",
    ]);

  const finalY =
    (doc as any).lastAutoTable?.finalY ||
    55;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");

  doc.text(
    "Transaction Details",
    14,
    finalY + 10
  );

  autoTable(doc, {
    startY: finalY + 14,

    theme: "striped",

    head: [[
      "Date",
      "Party Code",
      "Party",
      "Type",
      "Contact",
      "Transaction",
      "Payment",
      "Amount",
      "Balance",
      "Remarks",
    ]],

    body: transactionRows,

    styles: {
      fontSize: 7,
      cellPadding: 3,
      valign: "middle",
    },

    headStyles: {
      fontStyle: "bold",
      halign: "center",
    },

    columnStyles: {
      0: {
        cellWidth: 22,
      },
      1: {
        cellWidth: 24,
      },
      2: {
        cellWidth: 40,
      },
      3: {
        cellWidth: 27,
      },
      4: {
        cellWidth: 30,
      },
      5: {
        cellWidth: 27,
      },
      6: {
        cellWidth: 24,
      },
      7: {
        cellWidth: 27,
        halign: "right",
      },
      8: {
        cellWidth: 27,
        halign: "right",
      },
      9: {
        cellWidth: 40,
      },
    },

    didParseCell: (data) => {
      if (
        data.section === "body" &&
        (data.column.index === 7 ||
          data.column.index === 8)
      ) {
        data.cell.styles.halign =
          "right";
      }
    },
  });

  // ==========================================
  // FOOTER
  // ==========================================

  const pageCount =
    (doc as any).internal
      .getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    doc.setPage(page);

    const pageHeight =
      doc.internal.pageSize.height;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Page ${page} of ${pageCount}`,
      283,
      pageHeight - 8,
      {
        align: "right",
      }
    );

    doc.text(
      "Toy Hub Corporation — Accounts",
      14,
      pageHeight - 8
    );
  }

  // ==========================================
  // SAVE
  // ==========================================

  doc.save(`${fileName}.pdf`);
};