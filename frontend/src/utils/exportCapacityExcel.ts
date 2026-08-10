import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportCapacityExcel = (
  result: any,
  productName: string,
  requestedQuantity: number,
  fileName = "Production_Capacity"
) => {
  if (!result) return;

  const rows = (result.materials || []).map(
    (item: any) => ({
      "Material": item.product || "-",
      "Required Quantity": item.required ?? "-",
      "Available Stock": item.available ?? "-",
      "Shortage": item.shortage ?? 0,
      "Status": item.sufficient
        ? "Available"
        : "Short",
    })
  );

  const workbook = XLSX.utils.book_new();

  const worksheet = XLSX.utils.aoa_to_sheet([
    ["PRODUCTION CAPACITY REPORT"],
    ["Toy Hub Corporation"],
    [
      `Generated: ${new Date().toLocaleString("en-IN")}`,
    ],
    [],
    ["Product", productName || "-"],
    ["Requested Quantity", requestedQuantity],
    [
      "Maximum Producible",
      result.maximumProducible ?? "-",
    ],
    [
      "Bottleneck",
      result.bottleneck || "None",
    ],
    [],
  ]);

  XLSX.utils.sheet_add_json(
    worksheet,
    rows,
    {
      origin: "A10",
    }
  );

  worksheet["!cols"] = [
    { wch: 30 },
    { wch: 22 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
  ];

  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 4 },
    },
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: 4 },
    },
    {
      s: { r: 2, c: 0 },
      e: { r: 2, c: 4 },
    },
  ];

  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 10,
  };

  if (rows.length > 0) {
    worksheet["!autofilter"] = {
      ref: `A10:E${rows.length + 10}`,
    };
  }

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Capacity Report"
  );

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([buffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${fileName}.xlsx`);
};