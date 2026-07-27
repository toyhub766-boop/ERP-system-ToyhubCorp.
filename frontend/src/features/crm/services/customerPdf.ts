import jsPDF from "jspdf";

export const exportCustomerPortfolio = (
  customer: any,
  orders: any[]
) => {
  const doc = new jsPDF();

  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("TOY HUB CORPORATION", 15, y);

  y += 10;

  doc.setFontSize(16);
  doc.text("Customer Portfolio", 15, y);

  y += 15;

  doc.setFontSize(13);
  doc.text("Customer Information", 15, y);

  y += 8;

  doc.setFont("helvetica", "normal");

  doc.text(`Company: ${customer.companyName || "-"}`, 15, y);
  y += 7;

  doc.text(`Contact: ${customer.contactPerson || "-"}`, 15, y);
  y += 7;

  doc.text(`Phone: ${customer.phone || "-"}`, 15, y);
  y += 7;

  doc.text(`Email: ${customer.email || "-"}`, 15, y);
  y += 7;

  doc.text(`GST: ${customer.gstNumber || "-"}`, 15, y);
  y += 7;

  doc.text(`Address: ${customer.address || "-"}`, 15, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text("Commercial Information", 15, y);

  y += 8;

  doc.setFont("helvetica", "normal");

  doc.text(
    `Opening Balance: Rs.${customer.openingBalance || 0}`,
    15,
    y
  );

  y += 7;

  doc.text(
    `Outstanding: Rs.${customer.currentBalance || 0}`,
    15,
    y
  );

  y += 7;

  doc.text(
    `Payment Terms: ${customer.paymentTerms || 0} Days`,
    15,
    y
  );

  y += 7;

  doc.text(
    `Packing Charges: Rs.${customer.packingCharges || 0}`,
    15,
    y
  );

  y += 7;

  doc.text(
    `Transport Charges: Rs.${customer.transportCharges || 0}`,
    15,
    y
  );

  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text("CRM Details", 15, y);

  y += 8;

  doc.setFont("helvetica", "normal");

  doc.text(`Stage: ${customer.stage}`, 15, y);
  y += 7;

  doc.text(`Category: ${customer.category}`, 15, y);
  y += 7;

  doc.text(`Party Type: ${customer.partyType}`, 15, y);
  y += 7;

  doc.text(`Status: ${customer.status}`, 15, y);

  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text("Recent CRM Activities", 15, y);

  y += 8;

  doc.setFont("helvetica", "normal");

  if (customer.specialNotes?.length) {

    customer.specialNotes
      .slice(0, 5)
      .forEach((note: any) => {

        doc.text(
          `[${note.type}] ${note.title || "Activity"}`,
          15,
          y
        );

        y += 6;

        const lines = doc.splitTextToSize(
  note.note || "-",
  165
);

doc.text(lines, 20, y);

y += lines.length * 6 + 4;

        y += 10;

      });

  } else {

    doc.text(
      "No CRM activities recorded.",
      15,
      y
    );

    y += 10;

  }

  doc.setFont("helvetica", "bold");

  doc.text("Recent Orders", 15, y);

  y += 8;

  doc.setFont("helvetica", "normal");

  if (orders.length) {

    orders.slice(0, 5).forEach((order: any) => {

      doc.text(
        `${order.orderNumber} | ${order.status}`,
        15,
        y
      );

      y += 7;

    });

  } else {

    doc.text("No orders available.", 15, y);

  }

  doc.save(
    `${customer.companyName}-Portfolio.pdf`
  );
};