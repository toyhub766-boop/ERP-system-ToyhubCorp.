import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const formatCurrency = (value: number) => {
  const amount = Number(value || 0);

  return `₹${Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value: any) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

  /*
   * ============================
   * HEADER
   * ============================
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
    30,
    "F"
  );

  doc.setTextColor(255, 255, 255);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(20);

  doc.text(
    "TOYHUB CORPORATION",
    14,
    13
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.text(
    "Internal Accounts Management System",
    14,
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
    14,
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
    `Generated: ${formatDate(new Date())}`,
    pageWidth - 14,
    21,
    {
      align: "right",
    }
  );

  /*
   * ============================
   * PARTY INFORMATION
   * ============================
   */

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(17);

  doc.text(
    party.companyName ||
      "Unnamed Party",
    14,
    42
  );

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
    `Party Type: ${
      party.partyType || "-"
    }`,
    14,
    49
  );

  doc.text(
    `Phone: ${party.phone || "-"}`,
    14,
    55
  );

  const gst =
    party.customerDetails?.gstNumber ||
    party.supplierDetails?.gstNumber ||
    "-";

  doc.text(
    `GST: ${gst}`,
    14,
    61
  );

  const paymentTerms =
    party.customerDetails
      ?.paymentTerms ??
    party.supplierDetails
      ?.paymentTerms;

  doc.text(
    `Payment Terms: ${
      paymentTerms !== undefined
        ? `${paymentTerms} Days`
        : "-"
    }`,
    95,
    49
  );

  const dueDate =
    party.customerDetails?.dueDate ||
    party.supplierDetails?.dueDate;

  doc.text(
    `Due Date: ${formatDate(dueDate)}`,
    95,
    55
  );

  /*
   * ============================
   * SUMMARY
   * ============================
   */

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

  const cardY = 68;
  const cardWidth = 63;
  const cardHeight = 25;
  const gap = 5;

  const cards: {
    title: string;
    value: string;
    color: [number, number, number];
  }[] = [
    {
      title: "Opening Balance",
      value:
        formatCurrency(
          openingBalance
        ),
      color: blue,
    },
    {
      title: "Money Received",
      value:
        formatCurrency(moneyIn),
      color: green,
    },
    {
      title: "Money Paid",
      value:
        formatCurrency(moneyOut),
      color: red,
    },
    {
      title: "Closing Balance",
      value:
        formatCurrency(
          closingBalance
        ),
      color:
        closingBalance >= 0
          ? green
          : red,
    },
  ];

  cards.forEach(
    (
      card,
      index
    ) => {
      const x =
        14 +
        index *
          (cardWidth + gap);

      doc.setFillColor(
        248,
        250,
        252
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

      doc.setFontSize(8);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        card.title,
        x + 7,
        cardY + 8
      );

      doc.setTextColor(
        card.color[0],
        card.color[1],
        card.color[2]
      );

      doc.setFontSize(13);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        card.value,
        x + 7,
        cardY + 18
      );
    }
  );

  /*
   * ============================
   * TRANSACTION TABLE
   * ============================
   */

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
            ? formatCurrency(
                Number(
                  transaction.amount ||
                    0
                )
              )
            : "-",

          !isMoneyIn
            ? formatCurrency(
                Number(
                  transaction.amount ||
                    0
                )
              )
            : "-",

          formatCurrency(
            Number(
              transaction.balanceAfterTransaction ||
                0
            )
          ),

          transaction.remarks ||
            "-",
        ];
      }
    );

  autoTable(doc, {
    startY: 101,

    head: [
      [
        "Date",
        "Type",
        "Payment Method",
        "Money In",
        "Money Out",
        "Balance",
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
      cellPadding: 4,
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
        cellWidth: 28,
        halign: "center",
      },

      2: {
        cellWidth: 35,
      },

      3: {
        cellWidth: 30,
        halign: "right",
      },

      4: {
        cellWidth: 30,
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

    didParseCell: (
      data
    ) => {
      if (
        data.section ===
          "body" &&
        data.column.index === 1
      ) {
        const value =
          String(
            data.cell.raw
          );

        if (
          value ===
          "Money In"
        ) {
          data.cell.styles.textColor =
            green;

          data.cell.styles.fontStyle =
            "bold";
        }

        if (
          value ===
          "Money Out"
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
   * ============================
   * FOOTER
   * ============================
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

    doc.setFontSize(8);

    doc.setTextColor(
      100,
      116,
      139
    );

    doc.text(
      "ToyHub Corporation • Account Statement",
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
   * ============================
   * SAVE
   * ============================
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