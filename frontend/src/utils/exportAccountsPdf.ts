import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/images/logo.png";

interface AccountExportRow {
  partyCode: string;
  partyName: string;
  contactPerson: string;
  openingBalance: number;
  youllGive: number;
  youllGet: number;
  balance: number;
}

interface AccountExportSummary {
  totalParties: number;
  customers: number;
  suppliers: number;
  companyExpenses: number;
  youllGet: number;
  youllGive: number;
}

const formatAmount = (
  value: number
) => {
  return Number(value || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
};

const getImageData = async (
  imagePath: string
): Promise<string> => {
  const response =
    await fetch(imagePath);

  const blob =
    await response.blob();

  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onloadend = () => {
        resolve(
          reader.result as string
        );
      };

      reader.onerror = reject;

      reader.readAsDataURL(blob);
    }
  );
};

export const exportAccountsPdf =
  async (
    rows: AccountExportRow[],
    summary: AccountExportSummary,
    fileName: string
  ) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    // ==========================================================
    // LOGO
    // ==========================================================

    try {
      const logoData =
        await getImageData(logo);

      doc.addImage(
        logoData,
        "PNG",
        14,
        10,
        27,
        15
      );
    } catch (error) {
      console.error(
        "Failed to load logo:",
        error
      );
    }

    // ==========================================================
    // HEADER
    // ==========================================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(17);

    doc.text(
      "TOY HUB CORPORATION",
      47,
      17
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    doc.text(
      "Whole Accounts Ledger",
      47,
      23
    );

    doc.setFontSize(7.5);

    doc.text(
      `Generated: ${new Date().toLocaleString(
        "en-IN"
      )}`,
      pageWidth - 14,
      16,
      {
        align: "right",
      }
    );

    // ==========================================================
    // DIVIDER
    // ==========================================================

    doc.setDrawColor(
      190,
      198,
      210
    );

    doc.line(
      14,
      30,
      pageWidth - 14,
      30
    );

    // ==========================================================
    // SUMMARY
    // ==========================================================

    autoTable(doc, {
      startY: 35,

      theme: "grid",

      head: [[
        "Total Parties",
        "Customers",
        "Suppliers",
        "Company Expenses",
      ]],

      body: [[
        summary.totalParties,
        summary.customers,
        summary.suppliers,
        summary.companyExpenses,
      ]],

      margin: {
        left: 14,
        right: 14,
      },

      styles: {
        fontSize: 7.5,
        cellPadding: 3,
        halign: "center",
        valign: "middle",
      },

      headStyles: {
        fontStyle: "bold",
      },
    });

    const summaryFinalY =
      (doc as any).lastAutoTable
        ?.finalY || 52;

    // ==========================================================
    // REPORT TITLE
    // ==========================================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      "Party Ledger",
      14,
      summaryFinalY + 10
    );

    // ==========================================================
    // PARTY TABLE
    // ==========================================================

    const tableRows =
      rows.map((row) => [
        row.partyCode || "--",
        row.partyName || "--",
        row.contactPerson || "--",
        formatAmount(
          row.openingBalance
        ),
        formatAmount(
          row.youllGive
        ),
        formatAmount(
          row.youllGet
        ),
        formatAmount(
          row.balance
        ),
      ]);

    autoTable(doc, {
      startY:
        summaryFinalY + 14,

      theme: "striped",

      head: [[
        "Party Code",
        "Party Name",
        "Contact Person",
        "Opening",
        "You Gave",
        "You Got",
        "Balance",
      ]],

      body: tableRows,

      margin: {
        left: 14,
        right: 14,
        top: 10,
        bottom: 15,
      },

      styles: {
        fontSize: 7,
        cellPadding: 2.5,
        valign: "middle",
        overflow: "linebreak",
      },

      headStyles: {
        fontStyle: "bold",
        halign: "center",
      },

      columnStyles: {
        0: {
          cellWidth: 24,
        },

        1: {
          cellWidth: 40,
        },

        2: {
          cellWidth: 31,
        },

        3: {
          cellWidth: 24,
          halign: "right",
        },

        4: {
          cellWidth: 24,
          halign: "right",
        },

        5: {
          cellWidth: 24,
          halign: "right",
        },

        6: {
          cellWidth: 25,
          halign: "right",
        },
      },

      didParseCell: (
        data
      ) => {
        if (
          data.section ===
            "body" &&
          data.column.index >= 3
        ) {
          data.cell.styles.halign =
            "right";
        }
      },

      didDrawPage: () => {
        doc.setFontSize(7);

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setTextColor(
          100,
          100,
          100
        );

        doc.text(
          "Toy Hub Corporation — Whole Accounts Ledger",
          14,
          pageHeight - 8
        );

        doc.text(
          `Page ${doc.getNumberOfPages()}`,
          pageWidth - 14,
          pageHeight - 8,
          {
            align: "right",
          }
        );

        doc.setTextColor(
          0,
          0,
          0
        );
      },
    });

    // ==========================================================
    // TOTAL
    // ==========================================================

    const totalOpening =
      rows.reduce(
        (sum, row) =>
          sum +
          Number(
            row.openingBalance || 0
          ),
        0
      );

    const totalGive =
      rows.reduce(
        (sum, row) =>
          sum +
          Number(
            row.youllGive || 0
          ),
        0
      );

    const totalGet =
      rows.reduce(
        (sum, row) =>
          sum +
          Number(
            row.youllGet || 0
          ),
        0
      );

    const totalBalance =
      rows.reduce(
        (sum, row) =>
          sum +
          Number(
            row.balance || 0
          ),
        0
      );

    const finalY =
      (doc as any).lastAutoTable
        ?.finalY || 60;

    if (
      finalY < pageHeight - 35
    ) {
      autoTable(doc, {
        startY: finalY + 5,

        theme: "grid",

        body: [[
          "TOTAL",
          "",
          "",
          formatAmount(
            totalOpening
          ),
          formatAmount(
            totalGive
          ),
          formatAmount(
            totalGet
          ),
          formatAmount(
            totalBalance
          ),
        ]],

        margin: {
          left: 14,
          right: 14,
        },

        styles: {
          fontSize: 7.5,
          cellPadding: 3,
          fontStyle: "bold",
          halign: "right",
        },

        columnStyles: {
          0: {
            cellWidth: 24,
            halign: "left",
          },

          1: {
            cellWidth: 40,
          },

          2: {
            cellWidth: 31,
          },

          3: {
            cellWidth: 24,
          },

          4: {
            cellWidth: 24,
          },

          5: {
            cellWidth: 24,
          },

          6: {
            cellWidth: 25,
          },
        },
      });
    }

    // ==========================================================
    // SAVE
    // ==========================================================

    doc.save(
      `${fileName}.pdf`
    );
  };