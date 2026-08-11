import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import logo from "../assets/images/logo.png";

const BLUE = "17357A";
const GREEN = "16A34A";
const RED = "DC2626";
const SLATE = "475569";
const LIGHT_SLATE = "F8FAFC";
const BORDER = "E2E8F0";
const WHITE = "FFFFFF";
const DARK = "0F172A";

const formatDate = (value: any) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const addBorder = (
  cell: ExcelJS.Cell,
  color = BORDER
) => {
  cell.border = {
    top: {
      style: "thin",
      color: {
        argb: color,
      },
    },
    bottom: {
      style: "thin",
      color: {
        argb: color,
      },
    },
    left: {
      style: "thin",
      color: {
        argb: color,
      },
    },
    right: {
      style: "thin",
      color: {
        argb: color,
      },
    },
  };
};

const styleLabel = (
  cell: ExcelJS.Cell
) => {
  cell.font = {
    bold: true,
    size: 10,
    color: {
      argb: SLATE,
    },
  };

  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: LIGHT_SLATE,
    },
  };

  cell.alignment = {
    vertical: "middle",
  };

  addBorder(cell);
};

const styleValue = (
  cell: ExcelJS.Cell
) => {
  cell.font = {
    size: 10,
    color: {
      argb: DARK,
    },
  };

  cell.alignment = {
    vertical: "middle",
    wrapText: true,
  };

  addBorder(cell);
};

export const exportPartyLedgerExcel = async (
  party: any,
  ledger: any[]
) => {
  const workbook =
    new ExcelJS.Workbook();

  workbook.creator =
    "ToyHub Corporation";

  workbook.created = new Date();

  workbook.modified = new Date();

  const worksheet =
    workbook.addWorksheet(
      "Account Statement",
      {
        pageSetup: {
          orientation: "landscape",
          paperSize: 9,
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
      }
    );

  /*
   * ========================================
   * PARTY DATA
   * ========================================
   */

  const customer =
    party.customerDetails || {};

  const supplier =
    party.supplierDetails || {};

  const expense =
    party.companyExpenseDetails || {};

  const gstNumber =
    customer.gstNumber ||
    supplier.gstNumber ||
    "-";

  const paymentTerms =
    customer.paymentTerms ??
    supplier.paymentTerms ??
    0;

  const dueDate =
    customer.dueDate ||
    supplier.dueDate ||
    null;

  const openingBalance =
    Number(
      party.openingBalance
    ) || 0;

  const currentBalance =
    Number(
      party.currentBalance
    ) || 0;

  /*
   * ========================================
   * TRANSACTION TOTALS
   * ========================================
   */

  const moneyIn = ledger
    .filter(
      (transaction: any) =>
        transaction.transactionType ===
        "MONEY_IN"
    )
    .reduce(
      (
        total: number,
        transaction: any
      ) =>
        total +
        Number(
          transaction.amount || 0
        ),
      0
    );

  const moneyOut = ledger
    .filter(
      (transaction: any) =>
        transaction.transactionType ===
        "MONEY_OUT"
    )
    .reduce(
      (
        total: number,
        transaction: any
      ) =>
        total +
        Number(
          transaction.amount || 0
        ),
      0
    );

  /*
   * ========================================
   * COLUMN WIDTHS
   * ========================================
   */

  worksheet.columns = [
    {
      width: 20,
    },
    {
      width: 25,
    },
    {
      width: 20,
    },
    {
      width: 20,
    },
    {
      width: 20,
    },
    {
      width: 20,
    },
    {
      width: 38,
    },
  ];

  /*
   * ========================================
   * LOGO
   * ========================================
   */

  try {
    const response =
      await fetch(logo);

    const logoBuffer =
      await response.arrayBuffer();

    const imageId =
      workbook.addImage({
        buffer: logoBuffer,
        extension: "png",
      });

    worksheet.addImage(
      imageId,
      {
        tl: {
          col: 0.2,
          row: 0.25,
        },
        ext: {
          width: 130,
          height: 75,
        },
      }
    );
  } catch (error) {
    console.error(
      "Failed to load ToyHub logo:",
      error
    );
  }

  /*
   * ========================================
   * HEADER
   * ========================================
   */

  worksheet.mergeCells(
    "C1:G2"
  );

  const companyCell =
    worksheet.getCell("C1");

  companyCell.value =
    "TOYHUB CORPORATION";

  companyCell.font = {
    bold: true,
    size: 22,
    color: {
      argb: WHITE,
    },
  };

  companyCell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  companyCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: BLUE,
    },
  };

  worksheet.mergeCells(
    "C3:G3"
  );

  const systemCell =
    worksheet.getCell("C3");

  systemCell.value =
    "Internal Accounts Management System";

  systemCell.font = {
    size: 10,
    color: {
      argb: WHITE,
    },
  };

  systemCell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  systemCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: BLUE,
    },
  };

  worksheet.mergeCells(
    "C4:G4"
  );

  const statementCell =
    worksheet.getCell("C4");

  statementCell.value =
    "ACCOUNT STATEMENT";

  statementCell.font = {
    bold: true,
    size: 14,
    color: {
      argb: BLUE,
    },
  };

  statementCell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.getCell("A5").value =
    "Generated";

  worksheet.getCell("B5").value =
    formatDate(new Date());

  styleLabel(
    worksheet.getCell("A5")
  );

  styleValue(
    worksheet.getCell("B5")
  );

  /*
   * ========================================
   * PARTY INFORMATION
   * ========================================
   */

  worksheet.mergeCells(
    "A7:G7"
  );

  const partyHeading =
    worksheet.getCell("A7");

  partyHeading.value =
    "PARTY INFORMATION";

  partyHeading.font = {
    bold: true,
    size: 13,
    color: {
      argb: WHITE,
    },
  };

  partyHeading.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: BLUE,
    },
  };

  partyHeading.alignment = {
    vertical: "middle",
  };

  worksheet.getRow(7).height =
    24;

  /*
   * Row 8
   */

  worksheet.getCell("A8").value =
    "Party Name";

  worksheet.getCell("B8").value =
    party.companyName || "-";

  worksheet.getCell("D8").value =
    "Party Code";

  worksheet.getCell("E8").value =
    party.partyCode || "-";

  styleLabel(
    worksheet.getCell("A8")
  );

  styleValue(
    worksheet.getCell("B8")
  );

  styleLabel(
    worksheet.getCell("D8")
  );

  styleValue(
    worksheet.getCell("E8")
  );

  worksheet.mergeCells(
    "B8:C8"
  );

  worksheet.mergeCells(
    "E8:G8"
  );

  /*
   * Row 9
   */

  worksheet.getCell("A9").value =
    "Party Type";

  worksheet.getCell("B9").value =
    party.partyType || "-";

  worksheet.getCell("D9").value =
    "Status";

  worksheet.getCell("E9").value =
    party.status || "-";

  styleLabel(
    worksheet.getCell("A9")
  );

  styleValue(
    worksheet.getCell("B9")
  );

  styleLabel(
    worksheet.getCell("D9")
  );

  styleValue(
    worksheet.getCell("E9")
  );

  worksheet.mergeCells(
    "B9:C9"
  );

  worksheet.mergeCells(
    "E9:G9"
  );

  /*
   * Row 10
   */

  worksheet.getCell("A10").value =
    "Contact Person";

  worksheet.getCell("B10").value =
    party.contactPerson || "-";

  worksheet.getCell("D10").value =
    "Phone";

  worksheet.getCell("E10").value =
    party.phone || "-";

  styleLabel(
    worksheet.getCell("A10")
  );

  styleValue(
    worksheet.getCell("B10")
  );

  styleLabel(
    worksheet.getCell("D10")
  );

  styleValue(
    worksheet.getCell("E10")
  );

  worksheet.mergeCells(
    "B10:C10"
  );

  worksheet.mergeCells(
    "E10:G10"
  );

  /*
   * Row 11
   */

  worksheet.getCell("A11").value =
    "Email";

  worksheet.getCell("B11").value =
    party.email || "-";

  worksheet.getCell("D11").value =
    "GST Number";

  worksheet.getCell("E11").value =
    gstNumber;

  styleLabel(
    worksheet.getCell("A11")
  );

  styleValue(
    worksheet.getCell("B11")
  );

  styleLabel(
    worksheet.getCell("D11")
  );

  styleValue(
    worksheet.getCell("E11")
  );

  worksheet.mergeCells(
    "B11:C11"
  );

  worksheet.mergeCells(
    "E11:G11"
  );

  /*
   * Row 12
   */

  const address = [
    party.address,
    party.city,
    party.state,
    party.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  worksheet.getCell("A12").value =
    "Address";

  worksheet.getCell("B12").value =
    address || "-";

  worksheet.mergeCells(
    "B12:G12"
  );

  styleLabel(
    worksheet.getCell("A12")
  );

  styleValue(
    worksheet.getCell("B12")
  );

  worksheet.getRow(12).height =
    32;

  /*
   * ========================================
   * COMMERCIAL INFORMATION
   * ========================================
   */

  worksheet.mergeCells(
    "A14:G14"
  );

  const commercialHeading =
    worksheet.getCell("A14");

  commercialHeading.value =
    "COMMERCIAL INFORMATION";

  commercialHeading.font = {
    bold: true,
    size: 13,
    color: {
      argb: WHITE,
    },
  };

  commercialHeading.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: BLUE,
    },
  };

  commercialHeading.alignment = {
    vertical: "middle",
  };

  worksheet.getRow(14).height =
    24;

  /*
   * Row 15
   */

  const commercialRows: Array<
    [
      string,
      any,
      string,
      any,
      string,
      any
    ]
  > = [
    [
      "Opening Balance",
      openingBalance,
      "Payment Terms",
      `${paymentTerms} Days`,
      "Due Date",
      formatDate(dueDate),
    ],

    [
      "Packing Charges",
      party.partyType ===
      "CUSTOMER"
        ? Number(
            customer.packingCharges ||
              0
          )
        : "-",

      "Transport Charges",
      party.partyType ===
      "CUSTOMER"
        ? Number(
            customer.transportCharges ||
              0
          )
        : "-",

      "Current Balance",
      currentBalance,
    ],
  ];

  if (
    party.partyType ===
    "CUSTOMER"
  ) {
    commercialRows.push(
      [
        "Billing Name",
        customer.billingName ||
          "-",

        "Transport Name",
        customer.transportName ||
          "-",

        "Transport Number",
        customer.transportNumber ||
          "-",
      ],
      [
        "Transport Phone",
        customer.transportPhone ||
          "-",

        "Marka",
        customer.marka ||
          "-",

        "Station",
        customer.station ||
          "-",
      ]
    );
  }

  if (
    party.partyType ===
    "SUPPLIER"
  ) {
    commercialRows.push([
      "Supplier GST",
      supplier.gstNumber ||
        "-",

      "Supplier Terms",
      `${supplier.paymentTerms ?? 0} Days`,

      "Supplier Due Date",
      formatDate(
        supplier.dueDate
      ),
    ]);
  }

  if (
    party.partyType ===
    "COMPANY_EXPENSE"
  ) {
    commercialRows.push([
      "Expense Category",
      expense.expenseCategory ||
        "-",

      "Description",
      expense.description ||
        "-",

      "Status",
      party.status || "-",
    ]);
  }

  commercialRows.forEach(
    (row, index) => {
      const excelRow =
        15 + index;

      const values = row;

      values.forEach(
        (value, colIndex) => {
          const cell =
            worksheet.getCell(
              excelRow,
              colIndex + 1
            );

          cell.value = value;

          if (
            colIndex % 2 === 0
          ) {
            styleLabel(cell);
          } else {
            styleValue(cell);
          }

          if (
            typeof value ===
            "number"
          ) {
            cell.numFmt =
              '#,##0.00;[Red]-#,##0.00';

            cell.alignment = {
              horizontal: "right",
              vertical: "middle",
            };
          }
        }
      );

      worksheet.mergeCells(
        excelRow,
        2,
        excelRow,
        2
      );
    }
  );

  /*
   * ========================================
   * REMARKS
   * ========================================
   */

  const remarksRow =
    15 + commercialRows.length + 1;

  worksheet.mergeCells(
    remarksRow,
    1,
    remarksRow,
    7
  );

  const remarksHeading =
    worksheet.getCell(
      remarksRow,
      1
    );

  remarksHeading.value =
    "REMARKS";

  remarksHeading.font = {
    bold: true,
    size: 11,
    color: {
      argb: WHITE,
    },
  };

  remarksHeading.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: BLUE,
    },
  };

  const remarksValueRow =
    remarksRow + 1;

  worksheet.mergeCells(
    remarksValueRow,
    1,
    remarksValueRow,
    7
  );

  const remarksCell =
    worksheet.getCell(
      remarksValueRow,
      1
    );

  remarksCell.value =
    party.remarks || "-";

  styleValue(
    remarksCell
  );

  worksheet.getRow(
    remarksValueRow
  ).height = 30;

  /*
   * ========================================
   * TRANSACTION SUMMARY
   * ========================================
   */

  const summaryHeadingRow =
    remarksValueRow + 2;

  worksheet.mergeCells(
    summaryHeadingRow,
    1,
    summaryHeadingRow,
    7
  );

  const summaryHeading =
    worksheet.getCell(
      summaryHeadingRow,
      1
    );

  summaryHeading.value =
    "TRANSACTION SUMMARY";

  summaryHeading.font = {
    bold: true,
    size: 13,
    color: {
      argb: WHITE,
    },
  };

  summaryHeading.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: BLUE,
    },
  };

  /*
   * Summary values
   */

  const summaryRow =
    summaryHeadingRow + 1;
  /*
   * Excel only has 7 columns in
   * this worksheet, so use pairs
   * across the sheet.
   */

  worksheet.getCell(
    summaryRow,
    1
  ).value = "Opening Balance";

  worksheet.getCell(
    summaryRow,
    2
  ).value = openingBalance;

  worksheet.getCell(
    summaryRow,
    3
  ).value = "Money Received";

  worksheet.getCell(
    summaryRow,
    4
  ).value = moneyIn;

  worksheet.getCell(
    summaryRow,
    5
  ).value = "Money Paid";

  worksheet.getCell(
    summaryRow,
    6
  ).value = moneyOut;

  worksheet.getCell(
    summaryRow,
    7
  ).value = currentBalance;

  for (
    let col = 1;
    col <= 7;
    col++
  ) {
    const cell =
      worksheet.getCell(
        summaryRow,
        col
      );

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb:
          col === 7
            ? "DCFCE7"
            : LIGHT_SLATE,
      },
    };

    cell.font = {
      bold: true,
      size: 10,
      color: {
        argb:
          col === 7
            ? GREEN
            : DARK,
      },
    };

    cell.alignment = {
      vertical: "middle",
      horizontal:
        col % 2 === 0
          ? "right"
          : "left",
    };

    addBorder(cell);
  }

  worksheet.getRow(
    summaryRow
  ).height = 28;

  /*
   * ========================================
   * LEDGER
   * ========================================
   */

  const ledgerHeadingRow =
    summaryRow + 2;

  worksheet.mergeCells(
    ledgerHeadingRow,
    1,
    ledgerHeadingRow,
    7
  );

  const ledgerHeading =
    worksheet.getCell(
      ledgerHeadingRow,
      1
    );

  ledgerHeading.value =
    "ACCOUNT LEDGER";

  ledgerHeading.font = {
    bold: true,
    size: 13,
    color: {
      argb: WHITE,
    },
  };

  ledgerHeading.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: BLUE,
    },
  };

  const tableHeaderRow =
    ledgerHeadingRow + 1;

  const headers = [
    "Date",
    "Type",
    "Payment Method",
    "Money In (INR)",
    "Money Out (INR)",
    "Balance (INR)",
    "Remarks",
  ];

  headers.forEach(
    (header, index) => {
      const cell =
        worksheet.getCell(
          tableHeaderRow,
          index + 1
        );

      cell.value = header;

      cell.font = {
        bold: true,
        size: 10,
        color: {
          argb: WHITE,
        },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: BLUE,
        },
      };

      cell.alignment = {
        horizontal:
          index >= 3 &&
          index <= 5
            ? "right"
            : "center",
        vertical: "middle",
      };

      addBorder(
        cell,
        BLUE
      );
    }
  );

  worksheet.getRow(
    tableHeaderRow
  ).height = 26;

  /*
   * ========================================
   * TRANSACTION ROWS
   * ========================================
   */

  ledger.forEach(
    (
      transaction: any,
      index: number
    ) => {
      const rowNumber =
        tableHeaderRow +
        index +
        1;

      const isMoneyIn =
        transaction.transactionType ===
        "MONEY_IN";

      const row =
        worksheet.getRow(
          rowNumber
        );

      row.values = [
        formatDate(
          transaction.date
        ),

        isMoneyIn
          ? "Money In"
          : "Money Out",

        transaction.paymentMethod ||
          "-",

        isMoneyIn
          ? Number(
              transaction.amount || 0
            )
          : null,

        !isMoneyIn
          ? Number(
              transaction.amount || 0
            )
          : null,

        Number(
          transaction.balanceAfterTransaction ||
            0
        ),

        transaction.remarks ||
          "-",
      ];

      row.height = 24;

      for (
        let col = 1;
        col <= 7;
        col++
      ) {
        const cell =
          row.getCell(col);

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb:
              index % 2 === 0
                ? WHITE
                : LIGHT_SLATE,
          },
        };

        cell.font = {
          size: 10,
          color: {
            argb: DARK,
          },
        };

        cell.alignment = {
          vertical: "middle",
          horizontal:
            col >= 4 &&
            col <= 6
              ? "right"
              : "left",
          wrapText: true,
        };

        addBorder(cell);
      }

      /*
       * Transaction type
       */

      const typeCell =
        row.getCell(2);

      typeCell.font = {
        bold: true,
        size: 10,
        color: {
          argb:
            isMoneyIn
              ? GREEN
              : RED,
        },
      };

      /*
       * Amount formatting
       */

      [4, 5, 6].forEach(
        (column) => {
          const cell =
            row.getCell(
              column
            );

          cell.numFmt =
            '#,##0.00;[Red]-#,##0.00';
        }
      );
    }
  );

  /*
   * ========================================
   * NO TRANSACTIONS
   * ========================================
   */

  if (ledger.length === 0) {
    const emptyRow =
      tableHeaderRow + 1;

    worksheet.mergeCells(
      emptyRow,
      1,
      emptyRow,
      7
    );

    const cell =
      worksheet.getCell(
        emptyRow,
        1
      );

    cell.value =
      "No transactions recorded.";

    cell.font = {
      italic: true,
      size: 10,
      color: {
        argb: SLATE,
      },
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    addBorder(cell);
  }

  /*
   * ========================================
   * FOOTER
   * ========================================
   */

  const footerRow =
    tableHeaderRow +
    Math.max(
      ledger.length,
      1
    ) +
    3;

  worksheet.mergeCells(
    footerRow,
    1,
    footerRow,
    7
  );

  const footer =
    worksheet.getCell(
      footerRow,
      1
    );

  footer.value =
    "ToyHub Corporation • Account Statement • All amounts are in INR";

  footer.font = {
    italic: true,
    size: 9,
    color: {
      argb: SLATE,
    },
  };

  footer.alignment = {
    horizontal: "center",
  };

  /*
   * ========================================
   * FREEZE PANES
   * ========================================
   */

  worksheet.views = [
    {
      state: "frozen",
      ySplit: tableHeaderRow,
    },
  ];

  /*
   * ========================================
   * AUTO FILTER
   * ========================================
   */

  worksheet.autoFilter = {
    from: {
      row: tableHeaderRow,
      column: 1,
    },
    to: {
      row:
        tableHeaderRow +
        Math.max(
          ledger.length,
          1
        ),
      column: 7,
    },
  };

  /*
   * ========================================
   * PRINT SETTINGS
   * ========================================
   */

  worksheet.pageSetup = {
    orientation: "landscape",
    paperSize: 9,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalDpi: 300,
    verticalDpi: 300,
  };

  /*
   * ========================================
   * SAVE
   * ========================================
   */

  const buffer =
    await workbook.xlsx.writeBuffer();

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
    ).replace(
      /[^a-z0-9]/gi,
      "_"
    );

  saveAs(
    blob,
    `${safeName}-Account-Statement.xlsx`
  );
};