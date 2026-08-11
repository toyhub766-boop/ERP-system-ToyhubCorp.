import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import logo from "../assets/images/logo.png";

const blue: [number, number, number] = [
  23,
  53,
  122,
];

const green: [number, number, number] = [
  22,
  163,
  74,
];

const red: [number, number, number] = [
  220,
  38,
  38,
];

const slate: [number, number, number] = [
  71,
  85,
  105,
];

const lightSlate: [number, number, number] = [
  248,
  250,
  252,
];

const formatAmount = (value: any) => {
  return Number(value || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
};

const formatDate = (value: any) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const addLabelValue = (
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width = 70
) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(
    slate[0],
    slate[1],
    slate[2]
  );

  doc.text(label.toUpperCase(), x, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  const lines = doc.splitTextToSize(
    value || "-",
    width
  );

  doc.text(lines, x, y + 5);

  return y + 5 + lines.length * 4;
};

export const exportPartyLedgerPdf = (
  party: any,
  ledger: any[]
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const customer =
    party.customerDetails || {};

  const supplier =
    party.supplierDetails || {};

  const expense =
    party.companyExpenseDetails || {};

  const isCustomer =
    party.partyType === "CUSTOMER";

  const isSupplier =
    party.partyType === "SUPPLIER";

  const isExpense =
    party.partyType === "COMPANY_EXPENSE";

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

  const closingBalance =
    Number(
      party.currentBalance
    ) || 0;

  const moneyIn = ledger
    .filter(
      (transaction: any) =>
        transaction.transactionType ===
        "MONEY_IN"
    )
    .reduce(
      (
        sum: number,
        transaction: any
      ) =>
        sum +
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
        sum: number,
        transaction: any
      ) =>
        sum +
        Number(
          transaction.amount || 0
        ),
      0
    );

  /*
   * ========================================
   * HEADER
   * ========================================
   */

  doc.setFillColor(
    blue[0],
    blue[1],
    blue[2]
  );

  doc.rect(
    0,
    0,
    pageWidth,
    34,
    "F"
  );

  /*
   * LOGO
   */

  try {
    doc.addImage(
      logo,
      "PNG",
      12,
      5,
      34,
      24
    );
  } catch (error) {
    console.error(
      "Failed to add logo",
      error
    );
  }

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(18);

  doc.text(
    "TOYHUB CORPORATION",
    52,
    13
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.text(
    "Internal Accounts Management System",
    52,
    20
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(12);

  doc.text(
    "ACCOUNT STATEMENT",
    pageWidth - 14,
    13,
    {
      align: "right",
    }
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.text(
    `Generated: ${formatDate(
      new Date()
    )}`,
    pageWidth - 14,
    20,
    {
      align: "right",
    }
  );

  /*
   * ========================================
   * PARTY INFORMATION
   * ========================================
   */

  let infoY = 45;

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(16);

  doc.text(
    party.companyName ||
      "Unnamed Party",
    14,
    infoY
  );

  infoY += 8;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    slate[0],
    slate[1],
    slate[2]
  );

  doc.text(
    `Party Code: ${
      party.partyCode || "-"
    }`,
    14,
    infoY
  );

  doc.text(
    `Party Type: ${
      party.partyType || "-"
    }`,
    80,
    infoY
  );

  doc.text(
    `Status: ${
      party.status || "-"
    }`,
    150,
    infoY
  );

  /*
   * ========================================
   * CONTACT DETAILS
   * ========================================
   */

  const infoTop = 62;

  doc.setDrawColor(
    226,
    232,
    240
  );

  doc.roundedRect(
    14,
    infoTop,
    125,
    46,
    3,
    3,
    "S"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(10);

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    "Contact Information",
    20,
    infoTop + 8
  );

  addLabelValue(
    doc,
    "Contact Person",
    party.contactPerson ||
      "-",
    20,
    infoTop + 16,
    50
  );

  addLabelValue(
    doc,
    "Phone",
    party.phone || "-",
    78,
    infoTop + 16,
    45
  );

  addLabelValue(
    doc,
    "Email",
    party.email || "-",
    20,
    infoTop + 30,
    50
  );

  addLabelValue(
    doc,
    "GST Number",
    gstNumber,
    78,
    infoTop + 30,
    45
  );

  /*
   * ========================================
   * ADDRESS
   * ========================================
   */

  doc.roundedRect(
    144,
    infoTop,
    pageWidth - 158,
    46,
    3,
    3,
    "S"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(10);

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    "Address",
    150,
    infoTop + 8
  );

  const address = [
    party.address,
    party.city,
    party.state,
    party.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.setTextColor(
    slate[0],
    slate[1],
    slate[2]
  );

  doc.text(
    doc.splitTextToSize(
      address || "-",
      pageWidth - 174
    ),
    150,
    infoTop + 17
  );

  /*
   * ========================================
   * BUSINESS / COMMERCIAL DETAILS
   * ========================================
   */

  const detailY = 114;

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(11);

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    "Account Details",
    14,
    detailY
  );

  const details: string[][] = [];

  details.push([
    "Opening Balance",
    formatAmount(
      openingBalance
    ),
    "Payment Terms",
    `${paymentTerms} Days`,
    "Due Date",
    formatDate(dueDate),
  ]);

  details.push([
    "Packing Charges",
    isCustomer
      ? formatAmount(
          customer.packingCharges
        )
      : "-",

    "Transport Charges",
    isCustomer
      ? formatAmount(
          customer.transportCharges
        )
      : "-",

    "Current Balance",
    formatAmount(
      closingBalance
    ),
  ]);

  if (isCustomer) {
    details.push([
      "Billing Name",
      customer.billingName ||
        "-",

      "Transport Name",
      customer.transportName ||
        "-",

      "Transport Number",
      customer.transportNumber ||
        "-",
    ]);

    details.push([
      "Transport Phone",
      customer.transportPhone ||
        "-",

      "Marka",
      customer.marka || "-",

      "Station",
      customer.station || "-",
    ]);
  }

  if (isSupplier) {
    details.push([
      "GST Number",
      supplier.gstNumber ||
        "-",

      "Payment Terms",
      `${supplier.paymentTerms ?? 0} Days`,

      "Due Date",
      formatDate(
        supplier.dueDate
      ),
    ]);
  }

  if (isExpense) {
    details.push([
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

  autoTable(doc, {
    startY: detailY + 5,

    body: details,

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      textColor: [
        30,
        41,
        59,
      ],
      lineColor: [
        226,
        232,
        240,
      ],
      lineWidth: 0.2,
    },

    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 35,
      },
      1: {
        cellWidth: 48,
      },
      2: {
        fontStyle: "bold",
        cellWidth: 35,
      },
      3: {
        cellWidth: 48,
      },
      4: {
        fontStyle: "bold",
        cellWidth: 35,
      },
      5: {
        cellWidth: 48,
      },
    },
  });

  /*
   * ========================================
   * SUMMARY
   * ========================================
   */

  const summaryY =
    (doc as any).lastAutoTable.finalY +
    8;

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(11);

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    "Transaction Summary",
    14,
    summaryY
  );

  const summaryCards = [
    {
      title: "Opening Balance",
      value: formatAmount(
        openingBalance
      ),
      color: blue,
    },
    {
      title: "Money Received",
      value: formatAmount(
        moneyIn
      ),
      color: green,
    },
    {
      title: "Money Paid",
      value: formatAmount(
        moneyOut
      ),
      color: red,
    },
    {
      title: "Closing Balance",
      value: formatAmount(
        closingBalance
      ),
      color:
        closingBalance >= 0
          ? green
          : red,
    },
  ];

  const cardY =
    summaryY + 5;

  const cardWidth = 63;
  const cardHeight = 23;
  const gap = 5;

  summaryCards.forEach(
    (card, index) => {
      const x =
        14 +
        index *
          (cardWidth + gap);

      doc.setFillColor(
        lightSlate[0],
        lightSlate[1],
        lightSlate[2]
      );

      doc.roundedRect(
        x,
        cardY,
        cardWidth,
        cardHeight,
        3,
        3,
        "F"
      );

      doc.setFillColor(
        card.color[0],
        card.color[1],
        card.color[2]
      );

      doc.rect(
        x,
        cardY,
        2,
        cardHeight,
        "F"
      );

      doc.setTextColor(
        slate[0],
        slate[1],
        slate[2]
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7);

      doc.text(
        card.title,
        x + 7,
        cardY + 7
      );

      doc.setTextColor(
        card.color[0],
        card.color[1],
        card.color[2]
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(12);

      doc.text(
        card.value,
        x + 7,
        cardY + 17
      );
    }
  );

  /*
   * ========================================
   * REMARKS
   * ========================================
   */

  const remarksY =
    cardY + cardHeight + 7;

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9);

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    "Remarks",
    14,
    remarksY
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setTextColor(
    slate[0],
    slate[1],
    slate[2]
  );

  doc.text(
    doc.splitTextToSize(
      party.remarks || "-",
      pageWidth - 28
    ),
    14,
    remarksY + 5
  );

  /*
   * ========================================
   * LEDGER TABLE
   * ========================================
   */

  const tableStartY =
    remarksY + 14;

  const tableRows =
    ledger.map(
      (transaction: any) => {
        const isMoneyIn =
          transaction.transactionType ===
          "MONEY_IN";

        return [
          formatDate(
            transaction.date
          ),

          isMoneyIn
            ? "Money In"
            : "Money Out",

          transaction.paymentMethod ||
            "-",

          isMoneyIn
            ? formatAmount(
                transaction.amount
              )
            : "-",

          !isMoneyIn
            ? formatAmount(
                transaction.amount
              )
            : "-",

          formatAmount(
            transaction.balanceAfterTransaction
          ),

          transaction.remarks ||
            "-",
        ];
      }
    );

  autoTable(doc, {
    startY: tableStartY,

    head: [
      [
        "Date",
        "Type",
        "Payment Method",
        "Money In (INR)",
        "Money Out (INR)",
        "Balance (INR)",
        "Remarks",
      ],
    ],

    body:
      tableRows.length > 0
        ? tableRows
        : [
            [
              "-",
              "-",
              "-",
              "-",
              "-",
              "-",
              "No transactions recorded",
            ],
          ],

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3.5,
      textColor: [
        30,
        41,
        59,
      ],
      lineColor: [
        226,
        232,
        240,
      ],
      lineWidth: 0.2,
      valign: "middle",
    },

    headStyles: {
      fillColor: blue,
      textColor: [
        255,
        255,
        255,
      ],
      fontStyle: "bold",
      halign: "center",
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
        cellWidth: 27,
      },
      1: {
        cellWidth: 29,
        halign: "center",
      },
      2: {
        cellWidth: 35,
      },
      3: {
        cellWidth: 32,
        halign: "right",
      },
      4: {
        cellWidth: 32,
        halign: "right",
      },
      5: {
        cellWidth: 32,
        halign: "right",
      },
      6: {
        cellWidth: "auto",
      },
    },

    didParseCell: (data) => {
      if (
        data.section === "body" &&
        data.column.index === 1
      ) {
        const value =
          String(
            data.cell.raw
          );

        if (
          value === "Money In"
        ) {
          data.cell.styles.textColor =
            green;
          data.cell.styles.fontStyle =
            "bold";
        }

        if (
          value === "Money Out"
        ) {
          data.cell.styles.textColor =
            red;
          data.cell.styles.fontStyle =
            "bold";
        }
      }
    },

    margin: {
      left: 14,
      right: 14,
    },
  });

  /*
   * ========================================
   * FOOTER
   * ========================================
   */

  const pageCount =
    doc.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    doc.setPage(page);

    doc.setDrawColor(
      226,
      232,
      240
    );

    doc.line(
      14,
      pageHeight - 14,
      pageWidth - 14,
      pageHeight - 14
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7);

    doc.setTextColor(
      100,
      116,
      139
    );

    doc.text(
      "ToyHub Corporation • Account Statement • Amounts in INR",
      14,
      pageHeight - 8
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - 14,
      pageHeight - 8,
      {
        align: "right",
      }
    );
  }

  /*
   * ========================================
   * SAVE
   * ========================================
   */

  const safeName =
    String(
      party.companyName ||
        "Party"
    ).replace(
      /[^a-z0-9]/gi,
      "_"
    );

  doc.save(
    `${safeName}-Account-Statement.pdf`
  );
};