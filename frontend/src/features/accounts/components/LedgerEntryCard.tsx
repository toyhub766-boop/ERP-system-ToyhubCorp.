interface Props {
  transaction: any;
  onDelete: (id: string) => void;
}

const LedgerEntryCard = ({
  transaction,
  onDelete,
}: Props) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex justify-between">

        <div>

          <p className="text-xs text-slate-500">
            {new Date(
              transaction.date
            ).toLocaleDateString()}
          </p>

          <h3 className="mt-2 text-lg font-semibold">

            {transaction.transactionType ===
            "MONEY_IN"
              ? "Money Received"
              : "Money Paid"}

          </h3>

          <div className="mt-4 space-y-2 text-sm">

            <p>

              <strong>
                Payment :
              </strong>{" "}

              {transaction.paymentMethod}

            </p>

            {transaction.utrNumber && (

              <p>

                <strong>
                  UTR :
                </strong>{" "}

                {transaction.utrNumber}

              </p>

            )}

            {transaction.otherReason && (

              <p>

                <strong>
                  Reason :
                </strong>{" "}

                {transaction.otherReason}

              </p>

            )}

            {transaction.remarks && (

              <p>

                <strong>
                  Remarks :
                </strong>{" "}

                {transaction.remarks}

              </p>

            )}

            {transaction.attachment && (

              <a
                href={transaction.attachment}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-lg bg-blue-100 px-3 py-2 text-blue-700"
              >
                View Slip
              </a>

            )}

          </div>

        </div>

        <div className="text-right">

          <h2
            className={`text-3xl font-bold ${
              transaction.transactionType ===
              "MONEY_IN"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {transaction.transactionType ===
            "MONEY_IN"
              ? "+"
              : "-"}

            ₹{transaction.amount}
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Balance
          </p>

          <p className="font-semibold">
            ₹
            {
              transaction.balanceAfterTransaction
            }
          </p>

          <button
            onClick={() =>
              onDelete(transaction._id)
            }
            className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-white"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
};

export default LedgerEntryCard;