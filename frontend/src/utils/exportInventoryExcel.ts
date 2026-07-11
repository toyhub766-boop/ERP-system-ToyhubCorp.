import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportInventoryExcel = (
  data: any[],
  fileName: string
) => {
  const rows = data.map((item) => ({
    SKU: item.sku,
    Product: item.name,
    Type: item.type,
    Category: item.category?.name,
    Warehouse: item.warehouse?.name,
    Unit: item.unit,
    Stock: item.currentStock,
    Minimum: item.minimumStock,
    Status: item.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Inventory"
  );

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};