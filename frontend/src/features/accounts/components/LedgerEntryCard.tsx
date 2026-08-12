import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Paperclip,
  Trash2,
} from "lucide-react";

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

  const amount = Number(transaction.amount || 0);

  const balance = Number(
    transaction.balanceAfterTransaction || 0
  );

  const createdAt = transaction.createdAt
    ? new Date(transaction.createdAt)
    : null;

  const formattedDate = createdAt
    ? createdAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "--";

  const formattedTime = createdAt
    ? createdAt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const amountColor = isMoneyIn
    ? "text-emerald-600"
    : "text-red-600";

  const iconBackground = isMoneyIn
    ? "bg-emerald-50 text-emerald-600"
    : "bg-red-50 text-red-600";

  const typeColor = isMoneyIn
    ? "text-emerald-700"
    : "text-red-700";

  return (
    <article
      className="
        group
        relative
        border-b
        border-slate-100
        bg-white
        px-4
        py-4
        transition-colors
        duration-150
        last:border-b-0
        hover:bg-slate-50/70
        sm:px-5
      "
    >
      <div className="flex min-w-0 items-start gap-3">

        {/* =====================================================
            TRANSACTION ICON
        ===================================================== */}

        <div
          className={`
            mt-0.5
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${iconBackground}
          `}
        >
          {isMoneyIn ? (
            <ArrowDownLeft
              size={16}
              strokeWidth={2}
            />
          ) : (
            <ArrowUpRight
              size={16}
              strokeWidth={2}
            />
          )}
        </div>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <div className="min-w-0 flex-1">

          {/* TOP ROW */}

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              {/* DATE + TYPE */}

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">

                <span
                  className={`
                    text-[11px]
                    font-bold
                    ${typeColor}
                  `}
                >
                  {isMoneyIn
                    ? "Money In"
                    : "Money Out"}
                </span>

                <span className="text-slate-200">
                  •
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                  <CalendarDays size={10} />
                  {formattedDate}
                </span>

                {formattedTime && (
                  <>
                    <span className="hidden text-slate-200 sm:inline">
                      •
                    </span>

                    <span className="hidden items-center gap-1 text-[10px] font-medium text-slate-400 sm:inline-flex">
                      <Clock3 size={10} />
                      {formattedTime}
                    </span>
                  </>
                )}

              </div>

              {/* REMARKS */}

              <p
                className="
                  mt-1.5
                  break-words
                  text-xs
                  font-semibold
                  leading-5
                  text-slate-800
                  sm:text-sm
                "
              >
                {transaction.remarks ||
                  "No remarks provided"}
              </p>

            </div>

            {/* =================================================
                AMOUNT
            ================================================= */}

            <div className="shrink-0 text-right">

              <p
                className={`
                  text-sm
                  font-bold
                  tracking-tight
                  sm:text-base
                  ${amountColor}
                `}
              >
                {isMoneyIn ? "+" : "-"}₹
                {amount.toLocaleString("en-IN")}
              </p>

              <p
                className={`
                  mt-0.5
                  text-[9px]
                  font-semibold
                  ${amountColor}
                `}
              >
                {isMoneyIn
                  ? "Received"
                  : "Paid"}
              </p>

            </div>

          </div>

          {/* =====================================================
              METADATA
          ===================================================== */}

          <div
            className="
              mt-2.5
              flex
              flex-wrap
              items-center
              gap-x-4
              gap-y-1.5
            "
          >

            {/* PAYMENT */}

            <div className="flex items-center gap-1.5">

              <span className="text-[10px] text-slate-400">
                Payment
              </span>

              <span
                className="
                  rounded-md
                  bg-slate-50
                  px-1.5
                  py-0.5
                  text-[10px]
                  font-semibold
                  text-slate-600
                "
              >
                {transaction.paymentMethod ||
                  "--"}
              </span>

            </div>

            <span className="hidden h-3 w-px bg-slate-200 sm:block" />

            {/* BALANCE */}

            <div className="flex items-center gap-1.5">

              <span className="text-[10px] text-slate-400">
                Balance
              </span>

              <span
                className={`
                  text-[10px]
                  font-bold
                  ${
                    balance >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                `}
              >
                {balance < 0 ? "-" : ""}₹
                {Math.abs(balance).toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            {/* ATTACHMENT */}

            {transaction.attachment && (
              <>
                <span className="hidden h-3 w-px bg-slate-200 sm:block" />

                <a
                  href={transaction.attachment}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-md
                    px-1.5
                    py-0.5
                    text-[10px]
                    font-semibold
                    text-blue-600
                    transition
                    hover:bg-blue-50
                    hover:text-blue-700
                  "
                >
                  <Paperclip size={11} />
                  View Slip
                </a>
              </>
            )}

          </div>

        </div>

        {/* =====================================================
            DELETE
        ===================================================== */}

        {onDelete && (
          <button
            type="button"
            title="Delete transaction"
            aria-label="Delete transaction"
            onClick={() =>
              onDelete(transaction._id)
            }
            className="
              mt-0.5
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-transparent
              text-slate-300
              transition-all
              duration-150
              hover:border-red-100
              hover:bg-red-50
              hover:text-red-500
              focus:border-red-100
              focus:bg-red-50
              focus:text-red-500
              sm:opacity-0
              sm:group-hover:opacity-100
              sm:focus:opacity-100
            "
          >
            <Trash2
              size={13}
              strokeWidth={1.8}
            />
          </button>
        )}

      </div>
    </article>
  );
};

export default LedgerEntryCard;