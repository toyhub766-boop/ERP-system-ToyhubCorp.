import { exportExcel } from "./exportExcel";

export const exportAccountsExcel = (
  rows: any[],
  fileName: string
) => {
  exportExcel(
    rows.map((r) => ({
      Date: new Date(
        r.date
      ).toLocaleDateString(),

      Party:
        r.party?.companyName,

      Type:
        r.transactionType,

      Payment:
        r.paymentMethod,

      Amount:
        r.amount,

      Balance:
        r.balanceAfterTransaction,

      Remarks:
        r.remarks,
    })),
    fileName
  );
};