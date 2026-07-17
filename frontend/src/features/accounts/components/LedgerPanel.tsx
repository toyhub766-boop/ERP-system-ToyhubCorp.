interface Props {
  selectedParty: any;
  ledger: any[];
  loading: boolean;

  onMoneyIn: () => void;
  onMoneyOut: () => void;

  onDelete: (id: string) => void;
}

const LedgerPanel = ({
  selectedParty,
  ledger,
  loading,
  onMoneyIn,
  onMoneyOut,
  onDelete,
}: Props) => {
  if (!selectedParty) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-700">
            Select a Party
          </h2>

          <p className="mt-3 text-slate-500">
            Choose a customer or supplier to view the ledger.
          </p>
        </div>
      </div>
    );
  }

  const balance = selectedParty.currentBalance || 0;

  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}

      <div className="border-b border-slate-200 bg-white px-7 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {selectedParty.companyName}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {selectedParty.partyType || "Customer"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500">
              Current Balance
            </p>

            <h2
              className={`mt-2 text-4xl font-bold ${
                balance >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₹{Math.abs(balance)}
            </h2>

            <p
              className={`mt-1 text-xs font-semibold uppercase ${
                balance >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {balance >= 0
                ? "You'll Get"
                : "You'll Give"}
            </p>
          </div>
        </div>
      </div>

      {/* LEDGER */}

      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-slate-500">
              Loading...
            </p>
          </div>
        ) : ledger.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-3xl">
                📒
              </div>

              <h3 className="text-2xl font-semibold text-slate-700">
                No Transactions Yet
              </h3>

              <p className="mt-3 text-slate-500">
                Click
                <strong> You Gave </strong>
                or
                <strong> You Got </strong>
                to record the first transaction.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {ledger.map((item: any) => (
              <div
                key={item._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex justify-between items-start">
  <div>
    <p className="text-sm text-slate-500">
      {new Date(item.createdAt).toLocaleDateString()}
    </p>

    <h3 className="mt-2 text-lg font-semibold">
      {item.transactionType === "MONEY_IN"
        ? "Payment Received"
        : "Payment Sent"}
    </h3>

    <p className="mt-2 text-slate-500">
      {item.remarks || "No remarks"}
    </p>

    <div className="mt-4 flex gap-2">

      <button
        onClick={() => onDelete(item._id)}
        className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white"
      >
        Delete
      </button>
    </div>
  </div>

  <div className="text-right">
    <h2
      className={`text-3xl font-bold ${
        item.transactionType === "MONEY_IN"
          ? "text-green-600"
          : "text-red-600"
      }`}
    >
      {item.transactionType === "MONEY_IN" ? "+" : "-"}₹{item.amount}
    </h2>

    <p className="mt-2 text-sm text-slate-500">
      Balance
    </p>

    <p className="font-semibold">
      ₹{item.balanceAfterTransaction}
    </p>
  </div>
</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div className="border-t border-slate-200 bg-white p-5">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onMoneyOut}
            className="rounded-xl bg-red-500 py-4 text-lg font-semibold text-white transition hover:bg-red-600"
          >
            YOU GAVE
          </button>

          <button
            onClick={onMoneyIn}
            className="rounded-xl bg-green-600 py-4 text-lg font-semibold text-white transition hover:bg-green-700"
          >
            YOU GOT
          </button>
        </div>
      </div>
    </div>
  );
};

export default LedgerPanel;