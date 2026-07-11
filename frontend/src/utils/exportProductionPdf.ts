import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportProductionPdf = (
  data: any[],
  title: string
) => {

  const doc = new jsPDF();

  doc.text(title, 14, 18);

  autoTable(doc, {

    startY: 28,

    head: [[
      "Order",
      "Product",
      "Qty",
      "Team",
      "Status",
      "Target",
    ]],

    body: data.map((item) => [

      item.orderNumber,

      item.finishedProduct?.name,

      item.quantity,

      item.team,

      item.status,

      new Date(item.targetDate).toLocaleDateString(),

    ]),

  });

  doc.save("production.pdf");

};