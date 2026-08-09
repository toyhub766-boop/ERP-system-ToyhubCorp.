import { saveAs } from "file-saver";
import * as XLSX from "xlsx-js-style";

const formatDate = (value: any) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatCurrency = (
  value: number
) => {
  return Number(value || 0);
};

export const exportPartyLedgerExcel = (
  party: any,
  ledger: any[]
) => {
  const workbook =
    XLSX.utils.book_new();

  /*
   * ============================
   * SUMMARY VALUES
   * ============================
   */

  const openingBalance =
    Number(party.openingBalance) || 0;

  const closingBalance =
    Number(party.currentBalance) || 0;

  const moneyIn = ledger
    .filter(
      (t) =>
        t.transactionType ===
        "MONEY_IN"
    )
    .reduce(
      (sum, t) =>
        sum + Number(t.amount || 0),
      0
    );

  const moneyOut = ledger
    .filter(
      (t) =>
        t.transactionType ===
        "MONEY_OUT"
    )
    .reduce(
      (sum, t) =>
        sum + Number(t.amount || 0),
      0
    );

  const gst =
    party.customerDetails?.gstNumber ||
    party.supplierDetails?.gstNumber ||
    "-";

  const paymentTerms =
    party.customerDetails?.paymentTerms ??
    party.supplierDetails?.paymentTerms;

  const dueDate =
    party.customerDetails?.dueDate ||
    party.supplierDetails?.dueDate;

  /*
   * ============================
   * DATA
   * ============================
   */

  const rows: any[][] = [
    [
      "TOYHUB CORPORATION",
    ],

    [
      "ACCOUNT STATEMENT",
    ],

    [],

    [
      "Party Name",
      party.companyName || "-",
      "",
      "Party Type",
      party.partyType || "-",
    ],

    [
      "Phone",
      party.phone || "-",
      "",
      "GST",
      gst,
    ],

    [
      "Payment Terms",
      paymentTerms !== undefined
        ? `${paymentTerms} Days`
        : "-",

      "",

      "Due Date",
      formatDate(dueDate),
    ],

    [],

    [
  "Opening Balance",
  openingBalance,
  "Money Received",
  moneyIn,
  "Money Paid",
  moneyOut,
  closingBalance,
],

    [],

    [
      "Date",
      "Type",
      "Payment Method",
      "Money In",
      "Money Out",
      "Balance",
      "Remarks",
    ],
  ];

  /*
   * ============================
   * TRANSACTIONS
   * ============================
   */

  ledger.forEach(
    (transaction) => {
      const isMoneyIn =
        transaction.transactionType ===
        "MONEY_IN";

      rows.push([
        formatDate(
          transaction.date
        ),

        isMoneyIn
          ? "Money In"
          : "Money Out",

        transaction.paymentMethod ||
          "-",

        isMoneyIn
          ? formatCurrency(
              transaction.amount
            )
          : "",

        !isMoneyIn
          ? formatCurrency(
              transaction.amount
            )
          : "",

        formatCurrency(
          transaction.balanceAfterTransaction
        ),

        transaction.remarks ||
          "-",
      ]);
    }
  );

  if (ledger.length === 0) {
    rows.push([
      "",
      "",
      "",
      "",
      "",
      "",
      "No transactions recorded",
    ]);
  }

  /*
   * ============================
   * WORKSHEET
   * ============================
   */

  const worksheet =
    XLSX.utils.aoa_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 35 },
  ];

  worksheet["!rows"] = [
    { hpt: 30 },
    { hpt: 24 },
    { hpt: 8 },
    { hpt: 22 },
    { hpt: 22 },
    { hpt: 22 },
    { hpt: 8 },
    { hpt: 30 },
    { hpt: 8 },
    { hpt: 26 },
  ];

  /*
   * ============================
   * TITLE
   * ============================
   */

  worksheet["A1"].s = {
    font: {
      bold: true,
      sz: 20,
      color: {
        rgb: "FFFFFF",
      },
    },

    fill: {
      fgColor: {
        rgb: "17357A",
      },
    },

    alignment: {
      horizontal: "left",
      vertical: "center",
    },
  };

  worksheet["A2"].s = {
    font: {
      bold: true,
      sz: 14,
      color: {
        rgb: "17357A",
      },
    },

    alignment: {
      horizontal: "left",
    },
  };

  /*
   * ============================
   * PARTY INFO
   * ============================
   */

  for (
    let row = 4;
    row <= 6;
    row++
  ) {
    for (
      let col = 0;
      col < 5;
      col++
    ) {
      const cell =
        XLSX.utils.encode_cell({
          r: row - 1,
          c: col,
        });

      if (worksheet[cell]) {
        worksheet[cell].s = {
          border: {
            top: {
              style: "thin",
              color: {
                rgb: "E2E8F0",
              },
            },

            bottom: {
              style: "thin",
              color: {
                rgb: "E2E8F0",
              },
            },

            left: {
              style: "thin",
              color: {
                rgb: "E2E8F0",
              },
            },

            right: {
              style: "thin",
              color: {
                rgb: "E2E8F0",
              },
            },
          },

          alignment: {
            vertical: "center",
          },
        };
      }
    }
  }

  /*
   * ============================
   * SUMMARY
   * ============================
   */

  const summaryRow = 7;

  for (
    let col = 0;
    col < 7;
    col++
  ) {
    const cell =
      XLSX.utils.encode_cell({
        r: summaryRow,
        c: col,
      });

    if (worksheet[cell]) {
      worksheet[cell].s = {
        fill: {
          fgColor: {
            rgb:
              col === 6
                ? "DCFCE7"
                : "F1F5F9",
          },
        },

        font: {
          bold: true,
          color: {
            rgb:
              col === 6
                ? "15803D"
                : "334155",
          },
        },

        alignment: {
          vertical: "center",
        },

        border: {
          top: {
            style: "thin",
            color: {
              rgb: "CBD5E1",
            },
          },

          bottom: {
            style: "thin",
            color: {
              rgb: "CBD5E1",
            },
          },
        },
      };
    }
  }

  /*
   * ============================
   * TABLE HEADER
   * ============================
   */

  const headerRow = 9;

  for (
    let col = 0;
    col < 7;
    col++
  ) {
    const cell =
      XLSX.utils.encode_cell({
        r: headerRow,
        c: col,
      });

    if (!worksheet[cell]) continue;

    worksheet[cell].s = {
      fill: {
        fgColor: {
          rgb: "17357A",
        },
      },

      font: {
        bold: true,
        color: {
          rgb: "FFFFFF",
        },
      },

      alignment: {
        horizontal:
          col >= 3 &&
          col <= 5
            ? "right"
            : "center",

        vertical: "center",
      },

      border: {
        top: {
          style: "thin",
          color: {
            rgb: "17357A",
          },
        },

        bottom: {
          style: "thin",
          color: {
            rgb: "17357A",
          },
        },
      },
    };
  }

  /*
   * ============================
   * TRANSACTION ROWS
   * ============================
   */

  const transactionStart =
    headerRow + 1;

  for (
    let row = transactionStart;
    row < rows.length;
    row++
  ) {
    const transactionIndex =
      row - transactionStart;

    const transaction =
      ledger[transactionIndex];

    for (
      let col = 0;
      col < 7;
      col++
    ) {
      const cell =
        XLSX.utils.encode_cell({
          r: row,
          c: col,
        });

      if (!worksheet[cell]) continue;

      const isMoneyIn =
        transaction?.transactionType ===
        "MONEY_IN";

      worksheet[cell].s = {
        fill: {
          fgColor: {
            rgb:
              transactionIndex % 2 === 0
                ? "FFFFFF"
                : "F8FAFC",
          },
        },

        alignment: {
          vertical: "center",

          horizontal:
            col >= 3 &&
            col <= 5
              ? "right"
              : "left",
        },

        border: {
          bottom: {
            style: "thin",
            color: {
              rgb: "E2E8F0",
            },
          },
        },

        font: {
          color: {
            rgb:
              col === 1
                ? isMoneyIn
                  ? "15803D"
                  : "DC2626"
                : "334155",

            bold:
              col === 1,
          },
        },
      };

      /*
       * Currency formatting
       */

      if (
        col >= 3 &&
        col <= 5 &&
        typeof worksheet[cell].v ===
          "number"
      ) {
        worksheet[cell].z =
          '₹#,##0.00;[Red]-₹#,##0.00';
      }
    }
  }

  /*
   * ============================
   * CURRENCY FORMATTING
   * ============================
   */

  [
    "B8",
    "D8",
    "F8",
    "H8",
  ].forEach((cell) => {
    if (worksheet[cell]) {
      worksheet[cell].z =
        '₹#,##0.00;[Red]-₹#,##0.00';
    }
  });

  /*
   * ============================
   * FREEZE + FILTER
   * ============================
   */

  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 10,
  };

  worksheet["!autofilter"] = {
    ref: `A10:G${
      Math.max(
        10,
        rows.length
      )
    }`,
  };

  /*
   * ============================
   * MERGES
   * ============================
   */

  worksheet["!merges"] = [
    {
      s: {
        r: 0,
        c: 0,
      },

      e: {
        r: 0,
        c: 6,
      },
    },

    {
      s: {
        r: 1,
        c: 0,
      },

      e: {
        r: 1,
        c: 6,
      },
    },
  ];

  /*
   * ============================
   * WORKBOOK
   * ============================
   */

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Account Statement"
  );

  const buffer =
    XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

  const blob = new Blob(
    [buffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  const safeName =
    String(
      party.companyName ||
        "Party"
    )
      .replace(
        /[^a-z0-9]/gi,
        "_"
      );

  saveAs(
    blob,
    `${safeName}-Account-Statement.xlsx`
  );
};