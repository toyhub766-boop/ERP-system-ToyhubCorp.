interface Props {
  entry: any;
}

const LedgerEntryCard = ({ entry }: Props) => {
  const isMoneyIn =
    entry.transactionType === "MONEY_IN";

  return (
    <div className="border-b border-slate-200 px-6 py-5 hover:bg-slate-50 transition">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs text-slate-500">
            {new Date(
              entry.createdAt
            ).toLocaleString()}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Balance :
            <span className="ml-1 font-semibold text-slate-700">
              ₹
              {entry.balanceAfterTransaction?.toLocaleString()}
            </span>
          </p>

          <p className="mt-3 font-medium text-slate-900">
            {entry.remarks || "No Remarks"}
          </p>

          <span
            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              isMoneyIn
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isMoneyIn
              ? "Money In"
              : "Money Out"}
          </span>

        </div>

        <div className="text-right">

          <p
            className={`text-2xl font-bold ${
              isMoneyIn
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {isMoneyIn ? "+" : "-"}₹
            {entry.amount.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {entry.paymentMethod}
          </p>

        </div>

      </div>

    </div>
  );
};

export default LedgerEntryCard;