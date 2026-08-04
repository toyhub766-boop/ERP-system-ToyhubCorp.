import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportPartyLedgerPdf = (
  party: any,
  ledger: any[]
) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Party Ledger Report", 14, 18);

  doc.setFontSize(11);

  doc.text(`Company : ${party.companyName}`, 14, 30);
  doc.text(`Party Type : ${party.partyType}`, 14, 37);
  doc.text(`Phone : ${party.phone || "-"}`, 14, 44);

  doc.text(
    `GST : ${
      party.customerDetails?.gstNumber ||
      party.supplierDetails?.gstNumber ||
      "-"
    }`,
    14,
    51
  );

  doc.text(
    `Opening Balance : ₹${party.openingBalance}`,
    14,
    58
  );

  doc.text(
    `Current Balance : ₹${party.currentBalance}`,
    14,
    65
  );

  autoTable(doc, {
    startY: 75,

    head: [[
      "Date",
      "Type",
      "Payment",
      "Amount",
      "Balance",
      "Remarks",
    ]],

    body: ledger.map((t) => [
      new Date(t.date).toLocaleDateString(),

      t.transactionType === "MONEY_IN"
        ? "Money In"
        : "Money Out",

      t.paymentMethod,

      `₹${t.amount}`,

      `₹${t.balanceAfterTransaction}`,

      t.remarks || "-",
    ]),
  });

  doc.save(`${party.companyName}-Ledger.pdf`);
};