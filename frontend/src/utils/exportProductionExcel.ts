import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportProductionExcel = (
  data: any[],
  fileName: string
) => {

  const rows = data.map((item) => ({
    Order: item.orderNumber,
    Product: item.finishedProduct?.name,
    Quantity: item.quantity,
    Team: item.team,
    Status: item.status,
    Target: new Date(item.targetDate).toLocaleDateString(),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Production");

  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(new Blob([buffer]), `${fileName}.xlsx`);

};