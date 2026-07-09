import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportPdf = (
  rows: any[],
  fileName: string
) => {
  const doc = new jsPDF();

  autoTable(doc, {
    head: [[
      "Date",
      "Type",
      "Category",
      "Description",
      "Payment",
      "Amount",
    ]],

    body: rows.map((r) => [
      new Date(r.date).toLocaleDateString(),
      r.type,
      r.category,
      r.description,
      r.paymentMethod,
      r.amount,
    ]),
  });

  doc.save(`${fileName}.pdf`);
};