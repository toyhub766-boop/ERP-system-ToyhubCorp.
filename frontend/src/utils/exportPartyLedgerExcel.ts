import { exportExcel } from "./exportExcel";

export const exportPartyLedgerExcel = (
  party: any,
  ledger: any[]
) => {
  exportExcel(
    ledger.map((t) => ({
      Date: new Date(
        t.date
      ).toLocaleDateString(),

      Type:
        t.transactionType,

      Payment:
        t.paymentMethod,

      Amount:
        t.amount,

      Balance:
        t.balanceAfterTransaction,

      Remarks:
        t.remarks,
    })),
    `${party.companyName}-Ledger`
  );
};