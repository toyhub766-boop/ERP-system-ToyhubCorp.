interface Props {
  transaction: any;
  onDelete?: (id: string) => void;
}

const LedgerEntryCard = ({
  transaction,
  onDelete,
}: Props) => {
  const isMoneyIn =
    transaction.transactionType === "MONEY_IN";

  return (
    <div className="border-b border-slate-200 px-6 py-5 hover:bg-slate-50 transition">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs text-slate-500">
            {new Date(
              transaction.createdAt
            ).toLocaleString()}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Balance :
            <span className="ml-1 font-semibold text-slate-700">
              ₹
              {transaction.balanceAfterTransaction?.toLocaleString()}
            </span>
          </p>

          <p className="mt-3 font-medium text-slate-900">
            {transaction.remarks || "No Remarks"}
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

          {transaction.attachment && (
            <a
              href={transaction.attachment}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block rounded-lg bg-blue-100 px-3 py-2 text-blue-700"
            >
              View Slip
            </a>
          )}

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
            {transaction.amount.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {transaction.paymentMethod}
          </p>

          {onDelete && (
            <button
              onClick={() =>
                onDelete(transaction._id)
              }
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Delete
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default LedgerEntryCard;