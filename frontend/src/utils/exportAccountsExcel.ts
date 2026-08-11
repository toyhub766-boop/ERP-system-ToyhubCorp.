import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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

const getImageData = async (
  imagePath: string
): Promise<ArrayBuffer> => {
  const response = await fetch(imagePath);

  return await response.arrayBuffer();
};

const formatDate = (
  value: string | Date
) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("en-IN");
};

export const exportAccountsExcel =
  async (
    rows: AccountExportRow[],
    summary: AccountExportSummary,
    fileName: string
  ) => {
    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      "Toy Hub Corporation";

    workbook.created =
      new Date();

    // ========================================
    // SUMMARY SHEET
    // ========================================

    const summarySheet =
      workbook.addWorksheet(
        "Summary"
      );

    summarySheet.columns = [
      {
        width: 28,
      },
      {
        width: 22,
      },
    ];

    // ========================================
    // LOGO
    // ========================================

    try {
      const logoBuffer =
        await getImageData(logo);

      const imageId =
        workbook.addImage({
          buffer: logoBuffer,
          extension: "png",
        });

      summarySheet.addImage(
        imageId,
        {
          tl: {
            col: 0,
            row: 0,
          },
          ext: {
            width: 180,
            height: 70,
          },
        }
      );
    } catch (error) {
      console.error(
        "Failed to load logo:",
        error
      );
    }

    // ========================================
    // TITLE
    // ========================================

    summarySheet.mergeCells(
      "A5:B5"
    );

    const title =
      summarySheet.getCell("A5");

    title.value =
      "TOY HUB CORPORATION";

    title.font = {
      bold: true,
      size: 18,
    };

    title.alignment = {
      horizontal: "center",
    };

    summarySheet.mergeCells(
      "A6:B6"
    );

    const subtitle =
      summarySheet.getCell("A6");

    subtitle.value =
      "Accounts Ledger Report";

    subtitle.font = {
      bold: true,
      size: 12,
    };

    subtitle.alignment = {
      horizontal: "center",
    };

    summarySheet.mergeCells(
      "A7:B7"
    );

    const generated =
      summarySheet.getCell("A7");

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
    };

    // ========================================
    // SUMMARY
    // ========================================

    const summaryStart = 9;

    const summaryData = [
      [
        "Total Parties",
        summary.totalParties,
      ],
      [
        "Customers",
        summary.customers,
      ],
      [
        "Suppliers",
        summary.suppliers,
      ],
      [
        "Company Expenses",
        summary.companyExpenses,
      ],
      [
        "You'll Get",
        summary.youllGet,
      ],
      [
        "You'll Give",
        summary.youllGive,
      ],
    ];

    summaryData.forEach(
      ([label, value], index) => {
        const row =
          summarySheet.getRow(
            summaryStart + index
          );

        row.getCell(1).value =
          label;

        row.getCell(2).value =
          value;

        row.getCell(1).font = {
          bold: true,
        };

        row.getCell(2).font = {
          bold: true,
        };

        if (
          typeof value ===
          "number"
        ) {
          row.getCell(2).numFmt =
            "#,##0.00";
        }
      }
    );

    // ========================================
    // TRANSACTION SHEET
    // ========================================

    const sheet =
      workbook.addWorksheet(
        "Transactions"
      );

    sheet.columns = [
      {
        header: "Date",
        key: "date",
        width: 15,
      },
      {
        header: "Party Code",
        key: "partyCode",
        width: 18,
      },
      {
        header: "Party",
        key: "partyName",
        width: 30,
      },
      {
        header: "Party Type",
        key: "partyType",
        width: 22,
      },
      {
        header: "Contact Person",
        key: "contactPerson",
        width: 24,
      },
      {
        header: "Transaction",
        key: "transactionType",
        width: 20,
      },
      {
        header: "Payment Method",
        key: "paymentMethod",
        width: 20,
      },
      {
        header: "Amount",
        key: "amount",
        width: 18,
      },
      {
        header: "Balance",
        key: "balance",
        width: 18,
      },
      {
        header: "Remarks",
        key: "remarks",
        width: 35,
      },
    ];

    // ========================================
    // HEADER
    // ========================================

    const headerRow =
      sheet.getRow(1);

    headerRow.height = 24;

    headerRow.eachCell(
      (cell) => {
        cell.font = {
          bold: true,
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

    // ========================================
    // DATA
    // ========================================

    rows.forEach((row) => {
      const excelRow =
        sheet.addRow({
          date: formatDate(
            row.date
          ),

          partyCode:
            row.partyCode || "--",

          partyName:
            row.partyName || "--",

          partyType:
            row.partyType || "--",

          contactPerson:
            row.contactPerson ||
            "--",

          transactionType:
            row.transactionType ||
            "--",

          paymentMethod:
            row.paymentMethod ||
            "--",

          amount:
            Number(row.amount || 0),

          balance:
            Number(row.balance || 0),

          remarks:
            row.remarks || "--",
        });

      excelRow.getCell(
        8
      ).numFmt =
        "#,##0.00;[Red]-#,##0.00";

      excelRow.getCell(
        9
      ).numFmt =
        "#,##0.00;[Red]-#,##0.00";
    });

    // ========================================
    // TABLE / FILTER
    // ========================================

    if (rows.length > 0) {
      sheet.autoFilter = {
        from: "A1",
        to: "J1",
      };
    }

    sheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    // ========================================
    // TOTALS
    // ========================================

    const totalRow =
      sheet.addRow([]);

    totalRow.getCell(1).value =
      "TOTAL";

    totalRow.getCell(1).font = {
      bold: true,
    };

    totalRow.getCell(8).value = {
      formula: `SUM(H2:H${
        rows.length + 1
      })`,
    };

    totalRow.getCell(8).numFmt =
      "#,##0.00";

    totalRow.getCell(8).font = {
      bold: true,
    };

    // ========================================
    // DOWNLOAD
    // ========================================

    const buffer =
      await workbook.xlsx.writeBuffer();

    const blob = new Blob(
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