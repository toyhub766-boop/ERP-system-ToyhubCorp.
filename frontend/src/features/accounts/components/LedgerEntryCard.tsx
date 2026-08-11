import { Trash2, Paperclip } from "lucide-react";

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

  const amount = Number(
    transaction.amount || 0
  );

  const balance = Number(
    transaction.balanceAfterTransaction || 0
  );

  const formattedDate = transaction.createdAt
    ? new Date(
        transaction.createdAt
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "--";

  const formattedTime = transaction.createdAt
    ? new Date(
        transaction.createdAt
      ).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="border-b border-slate-200 bg-white px-6 py-5 transition-colors hover:bg-slate-50/70">
      <div className="flex items-start justify-between gap-6">

        {/* =====================================
            LEFT
        ===================================== */}

        <div className="min-w-0 flex-1">

          {/* Date + transaction type */}

          <div className="flex flex-wrap items-center gap-2">

            <span className="text-xs font-medium text-slate-500">
              {formattedDate}
            </span>

            <span className="text-slate-300">
              •
            </span>

            <span className="text-xs text-slate-400">
              {formattedTime}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                isMoneyIn
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {isMoneyIn
                ? "Money In"
                : "Money Out"}
            </span>

          </div>


          {/* Remarks */}

          <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">
            {transaction.remarks ||
              "No Remarks"}
          </p>


          {/* Payment + balance */}

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">
                Payment
              </span>

              <span className="text-xs font-medium text-slate-700">
                {transaction.paymentMethod ||
                  "--"}
              </span>
            </div>


            <div className="h-3 w-px bg-slate-200" />


            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">
                Balance
              </span>

              <span
                className={`text-xs font-semibold ${
                  balance >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ₹
                {Math.abs(
                  balance
                ).toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

          </div>


          {/* Attachment */}

          {transaction.attachment && (
            <a
              href={
                transaction.attachment
              }
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
            >
              <Paperclip
                size={14}
              />

              View Slip
            </a>
          )}

        </div>


        {/* =====================================
            RIGHT
        ===================================== */}

        <div className="flex shrink-0 flex-col items-end">

          {/* Amount */}

          <div
            className={`text-xl font-bold tracking-tight ${
              isMoneyIn
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {isMoneyIn
              ? "+"
              : "-"}
            ₹
            {amount.toLocaleString(
              "en-IN"
            )}
          </div>


          {/* Direction */}

          <p
            className={`mt-1 text-[11px] font-medium ${
              isMoneyIn
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {isMoneyIn
              ? "Received"
              : "Paid"}
          </p>


          {/* Delete */}

          {onDelete && (
            <button
              type="button"
              title="Delete transaction"
              aria-label="Delete transaction"
              onClick={() =>
                onDelete(
                  transaction._id
                )
              }
              className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2
                size={16}
                strokeWidth={1.8}
              />
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

export default LedgerEntryCard;