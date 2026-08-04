import { exportPdf } from "./exportPdf";

export const exportAccountsPdf = (
  rows: any[],
  fileName: string
) => {
  exportPdf(
    rows.map((r) => ({
      date: r.date,

      type:
        r.transactionType === "MONEY_IN"
          ? "Money In"
          : "Money Out",

      category:
        r.party?.companyName || "",

      description:
        r.remarks || "",

      paymentMethod:
        r.paymentMethod,

      amount:
        r.amount,
    })),
    fileName
  );
};