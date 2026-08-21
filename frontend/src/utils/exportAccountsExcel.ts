import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
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

const getImageData = async (
  imagePath: string
): Promise<ArrayBuffer> => {
  const response = await fetch(imagePath);
  return await response.arrayBuffer();
};

// const formatNumber = (value: number) => {
//   return Number(value || 0).toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });
// };

export const exportAccountsExcel = async (
  rows: AccountExportRow[],
  summary: AccountExportSummary,
  fileName: string
) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Toy Hub Corporation";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(
    "Whole Ledger"
  );

  // ============================================================
  // COLUMN WIDTHS
  // ============================================================

  sheet.columns = [
    {
      key: "partyCode",
      width: 16,
    },
    {
      key: "partyName",
      width: 30,
    },
    {
      key: "contactPerson",
      width: 24,
    },
    {
      key: "openingBalance",
      width: 18,
    },
    {
      key: "youllGive",
      width: 17,
    },
    {
      key: "youllGet",
      width: 17,
    },
    {
      key: "balance",
      width: 18,
    },
  ];

  // ============================================================
  // LOGO
  // ============================================================

  try {
    const logoBuffer =
      await getImageData(logo);

    const imageId =
      workbook.addImage({
        buffer: logoBuffer,
        extension: "png",
      });

    sheet.addImage(
      imageId,
      {
        tl: {
          col: 0,
          row: 0,
        },
        ext: {
          width: 150,
          height: 55,
        },
      }
    );
  } catch (error) {
    console.error(
      "Failed to load logo:",
      error
    );
  }

  // ============================================================
  // TITLE
  // ============================================================

  sheet.mergeCells("A1:G1");

  const companyTitle =
    sheet.getCell("A1");

  companyTitle.value =
    "TOY HUB CORPORATION";

  companyTitle.font = {
    bold: true,
    size: 18,
  };

  companyTitle.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  sheet.getRow(1).height = 28;

  // ============================================================
  // REPORT TITLE
  // ============================================================

  sheet.mergeCells("A2:G2");

  const reportTitle =
    sheet.getCell("A2");

  reportTitle.value =
    "Whole Accounts Ledger";

  reportTitle.font = {
    bold: true,
    size: 12,
  };

  reportTitle.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  sheet.getRow(2).height = 22;

  // ============================================================
  // GENERATED DATE
  // ============================================================

  sheet.mergeCells("A3:G3");

  const generated =
    sheet.getCell("A3");

  generated.value =
    `Generated: ${new Date().toLocaleString(
      "en-IN"
    )}`;

  generated.font = {
    size: 9,
    italic: true,
  };

  generated.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  sheet.getRow(3).height = 18;

  // ============================================================
  // SUMMARY TITLE
  // ============================================================

  sheet.mergeCells("A5:G5");

  const summaryTitle =
    sheet.getCell("A5");

  summaryTitle.value =
    "Ledger Summary";

  summaryTitle.font = {
    bold: true,
    size: 11,
  };

  summaryTitle.alignment = {
    horizontal: "left",
    vertical: "middle",
  };

  // ============================================================
  // SUMMARY
  // ============================================================

  const summaryRow =
    sheet.getRow(6);

  summaryRow.values = [
    "Total Parties",
    summary.totalParties,
    "Customers",
    summary.customers,
    "Suppliers",
    summary.suppliers,
    "Company Expenses",
    summary.companyExpenses,
  ];

  summaryRow.height = 24;

  summaryRow.eachCell(
    (cell) => {
      cell.font = {
        bold: true,
        size: 9,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      cell.border = {
        top: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
        left: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
      };
    }
  );

  // ============================================================
  // TABLE HEADER
  // ============================================================

  const headerRow =
    sheet.getRow(8);

  headerRow.values = [
    "Party Code",
    "Party Name",
    "Contact Person",
    "Opening Balance",
    "You Gave",
    "You Got",
    "Balance",
  ];

  headerRow.height = 28;

  headerRow.eachCell(
    (cell) => {
      cell.font = {
        bold: true,
        size: 9,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };

      cell.border = {
        top: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
        left: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
      };
    }
  );

  // ============================================================
  // PARTY DATA
  // ============================================================

  rows.forEach((row) => {
    const excelRow =
      sheet.addRow([
        row.partyCode || "--",
        row.partyName || "--",
        row.contactPerson || "--",
        Number(
          row.openingBalance || 0
        ),
        Number(
          row.youllGive || 0
        ),
        Number(
          row.youllGet || 0
        ),
        Number(
          row.balance || 0
        ),
      ]);

    excelRow.height = 22;

    excelRow.eachCell(
      (cell, columnNumber) => {
        cell.alignment = {
          vertical: "middle",
          horizontal:
            columnNumber >= 4
              ? "right"
              : "left",
        };

        cell.border = {
          top: {
            style: "hair",
          },
          bottom: {
            style: "hair",
          },
          left: {
            style: "hair",
          },
          right: {
            style: "hair",
          },
        };

        if (columnNumber >= 4) {
          cell.numFmt =
            "#,##0.00;[Red]-#,##0.00";
        }
      }
    );
  });

  // ============================================================
  // TOTAL
  // ============================================================

  const totalRow =
    sheet.addRow([]);

  totalRow.height = 24;

  totalRow.getCell(1).value =
    "TOTAL";

  totalRow.getCell(1).font = {
    bold: true,
  };

  totalRow.getCell(4).value =
    rows.reduce(
      (sum, row) =>
        sum +
        Number(
          row.openingBalance || 0
        ),
      0
    );

  totalRow.getCell(5).value =
    rows.reduce(
      (sum, row) =>
        sum +
        Number(
          row.youllGive || 0
        ),
      0
    );

  totalRow.getCell(6).value =
    rows.reduce(
      (sum, row) =>
        sum +
        Number(
          row.youllGet || 0
        ),
      0
    );

  totalRow.getCell(7).value =
    rows.reduce(
      (sum, row) =>
        sum +
        Number(
          row.balance || 0
        ),
      0
    );

  totalRow.eachCell(
    (cell, columnNumber) => {
      cell.font = {
        bold: true,
      };

      cell.border = {
        top: {
          style: "medium",
        },
        bottom: {
          style: "double",
        },
      };

      if (columnNumber >= 4) {
        cell.numFmt =
          "#,##0.00;[Red]-#,##0.00";

        cell.alignment = {
          horizontal: "right",
        };
      }
    }
  );

  // ============================================================
  // FREEZE HEADER
  // ============================================================

  sheet.views = [
    {
      state: "frozen",
      ySplit: 8,
    },
  ];

  // ============================================================
  // AUTO FILTER
  // ============================================================

  if (rows.length > 0) {
    sheet.autoFilter = {
      from: "A8",
      to: "G8",
    };
  }

  // ============================================================
  // PRINT SETTINGS
  // ============================================================

  sheet.pageSetup.orientation =
    "portrait";

  sheet.pageSetup.paperSize =
    9;

  sheet.pageSetup.fitToPage = true;

  sheet.pageSetup.fitToWidth = 1;

  sheet.pageSetup.fitToHeight = 0;

  // ============================================================
  // DOWNLOAD
  // ============================================================

  const buffer =
    await workbook.xlsx.writeBuffer();

  const blob =
    new Blob(
      [buffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

  saveAs(
    blob,
    `${fileName}.xlsx`
  );
};