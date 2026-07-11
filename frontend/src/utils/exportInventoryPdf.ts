import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportInventoryPdf = (
  data: any[],
  title: string
) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 18);

  autoTable(doc, {
    startY: 28,

    head: [[
      "SKU",
      "Product",
      "Type",
      "Category",
      "Warehouse",
      "Stock",
      "Minimum",
      "Status",
    ]],

    body: data.map((item) => [
      item.sku,
      item.name,
      item.type,
      item.category?.name,
      item.warehouse?.name,
      item.currentStock,
      item.minimumStock,
      item.status,
    ]),
  });

  doc.save("inventory.pdf");
};