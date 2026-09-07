import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
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

  const amount = Number(
    transaction.amount || 0
  );

  const balance = Number(
    transaction.balanceAfterTransaction || 0
  );

  /*
   * IMPORTANT:
   * Display the actual transaction date.
   *
   * DO NOT use createdAt here.
   *
   * If the backend sends YYYY-MM-DD,
   * treat it as a local calendar date so
   * timezone conversion cannot shift it.
   */
  const formatTransactionDate = (
    value: string | Date | null | undefined
  ) => {
    if (!value) {
      return "--";
    }

    let date: Date;

    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      const [year, month, day] =
        value.split("-").map(Number);

      date = new Date(
        year,
        month - 1,
        day
      );
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formattedDate =
    formatTransactionDate(
      transaction.date
    );

  const amountColor = isMoneyIn
    ? "text-emerald-600"
    : "text-red-600";

  const iconBackground = isMoneyIn
    ? "bg-emerald-50 text-emerald-600"
    : "bg-red-50 text-red-600";

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

        <div className="min-w-0 flex-1">
          <div
            className="
              flex
              items-start
              justify-between
              gap-3
            "
          >
            <div className="min-w-0">
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-x-2
                  gap-y-1
                "
              >
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1
                    text-[10px]
                    font-medium
                    text-slate-400
                  "
                >
                  <CalendarDays size={10} />
                  {formattedDate}
                </span>

                <span className="text-slate-200">
                  •
                </span>

                <span
                  className={`
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.05em]
                    ${amountColor}
                  `}
                >
                  {isMoneyIn
                    ? "Money In"
                    : "Money Out"}
                </span>
              </div>

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

            <div
              className="
                flex
                shrink-0
                items-start
                gap-2
              "
            >
              <div className="text-right">
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
                  {amount.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

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
                  className="
                    mt-0.5
                    inline-flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-300
                    opacity-100
                    transition
                    hover:bg-red-50
                    hover:text-red-500
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
          </div>

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
                {balance < 0
                  ? "-"
                  : ""}
                ₹
                {Math.abs(
                  balance
                ).toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

            {transaction.attachment && (
              <>
                <span className="hidden h-3 w-px bg-slate-200 sm:block" />

                <a
                  href={
                    transaction.attachment
                  }
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
      </div>
    </article>
  );
};

export default LedgerEntryCard;