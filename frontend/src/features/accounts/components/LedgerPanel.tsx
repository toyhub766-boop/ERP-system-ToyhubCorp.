import LedgerEntryCard from "./LedgerEntryCard";

interface Props {
  selectedParty: any;

  ledger: any[];

  loading: boolean;

  onMoneyIn: () => void;

  onMoneyOut: () => void;

  onDelete: (id: string) => void;

  onEditParty: () => void;

  onViewReport: () => void;
}

const LedgerPanel = ({
  selectedParty,
  ledger,
  loading,
  onMoneyIn,
  onMoneyOut,
  onDelete,
  onEditParty,
  onViewReport,
}: Props) => {

  if (!selectedParty) {
    return (
      <div className="flex h-full flex-col">

        <div className="border-b border-slate-200 bg-white p-8">

          <h2 className="text-3xl font-bold">
            Accounts
          </h2>

          <p className="mt-2 text-slate-500">
            Select a Customer, Supplier or Company Expense
            from the left panel.
          </p>

        </div>

        <div className="flex flex-1 items-center justify-center">

          <div className="text-center">

            <h3 className="mt-6 text-2xl font-bold">

              No Party Selected

            </h3>

            <p className="mt-3 text-slate-500">

              Select any party to view ledger,
              balance and transactions.

            </p>

          </div>

        </div>

      </div>
    );
  }

  const balance =
    selectedParty.currentBalance || 0;

  const customer =
    selectedParty.customerDetails;

  const supplier =
    selectedParty.supplierDetails;

  return (

    <div className="flex h-full flex-col">

      {/* ================= HEADER ================= */}

      <div className="border-b border-slate-200 bg-white p-7">

        <div className="flex items-start justify-between">

          <div>

            <h2 className="text-3xl font-bold">

              {selectedParty.companyName}

            </h2>

            <div className="mt-3 flex gap-3">

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">

                {selectedParty.partyType}

              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedParty.status === "Active"
                    ?
                    "bg-green-100 text-green-700"
                    :
                    "bg-red-100 text-red-700"
                  }`}
              >

                {selectedParty.status}

              </span>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-12 gap-y-4 text-sm">

              <div>

                <p className="text-slate-500">

                  Phone

                </p>

                <p className="font-medium">

                  {selectedParty.phone || "--"}

                </p>

              </div>

              <div>

                <p className="text-slate-500">

                  GST

                </p>

                <p className="font-medium">

                  {customer?.gstNumber ||

                    supplier?.gstNumber ||

                    "--"}

                </p>

              </div>

              <div>

                <p className="text-slate-500">

                  Due Date

                </p>

                <p className="font-medium">

                  {customer?.dueDate ?

                    new Date(
                      customer.dueDate
                    ).toLocaleDateString()

                    :

                    supplier?.dueDate ?

                      new Date(
                        supplier.dueDate
                      ).toLocaleDateString()

                      :

                      "--"}

                </p>

              </div>

              <div>

                <p className="text-slate-500">

                  Payment Terms

                </p>

                <p className="font-medium">

                  {customer?.paymentTerms ||

                    supplier?.paymentTerms ||

                    0}

                  Days

                </p>

              </div>

              <div>

                <p className="text-slate-500">

                  Transport

                </p>

                <p className="font-medium">

                  {customer?.transportName ||

                    "--"}

                </p>

              </div>

              <div>

                <p className="text-slate-500">

                  Station

                </p>

                <p className="font-medium">

                  {customer?.station ||

                    "--"}

                </p>

              </div>

            </div>

          </div>

          <div className="text-right">

            <p className="text-sm text-slate-500">

              Net Balance

            </p>

            <h2
              className={`mt-2 text-5xl font-bold ${balance >= 0
                  ?
                  "text-green-600"
                  :
                  "text-red-600"
                }`}
            >

              ₹{Math.abs(balance)}

            </h2>

            <p
              className={`mt-2 font-semibold ${balance >= 0
                  ?
                  "text-green-600"
                  :
                  "text-red-600"
                }`}
            >

              {balance >= 0

                ?

                "You'll Get"

                :

                "You'll Give"}

            </p>

            <div className="mt-8 flex gap-3 justify-end">

              <button
                onClick={onEditParty}
                className="rounded-xl border border-slate-300 px-5 py-3 font-medium"
              >

                Edit Party

              </button>

              <button
                onClick={onViewReport}
                className="rounded-xl bg-[#17357A] px-5 py-3 font-medium text-white"
              >

                View Report

              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ================= ACTION BUTTONS ================= */}

      <div className="border-b border-slate-200 bg-slate-50 p-5">

        <div className="grid grid-cols-2 gap-4">

          <button
            onClick={onMoneyOut}
            className="rounded-xl bg-red-600 py-4 text-lg font-semibold text-white hover:bg-red-700"
          >

            YOU GAVE

          </button>

          <button
            onClick={onMoneyIn}
            className="rounded-xl bg-green-600 py-4 text-lg font-semibold text-white hover:bg-green-700"
          >

            YOU GOT

          </button>

        </div>

      </div>

      {/* ================= LEDGER ================= */}

      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">

        {loading ? (

          <div className="flex h-full items-center justify-center">

            <p className="text-slate-500">
              Loading Transactions...
            </p>

          </div>

        ) : ledger.length === 0 ? (

          <div className="flex h-full items-center justify-center">

            <div className="text-center">

              <h3 className="mt-6 text-2xl font-bold">

                No Transactions Yet

              </h3>

              <p className="mt-3 text-slate-500">

                Record the first transaction for this
                party using the buttons above.

              </p>

            </div>

          </div>

        ) : (

          <div className="space-y-5">

            {ledger.map((transaction: any) => (

              <LedgerEntryCard
                key={transaction._id}
                transaction={transaction}
                onDelete={onDelete}
              />

            ))}

          </div>

        )}

      </div>

      {/* ================= FOOTER ================= */}

      <div className="border-t border-slate-200 bg-white px-6 py-4">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-slate-500">
              Total Transactions
            </p>

            <h3 className="text-xl font-bold">
              {ledger.length}
            </h3>

          </div>

          <div className="text-right">

            <p className="text-sm text-slate-500">
              Current Balance
            </p>

            <h2
              className={`text-2xl font-bold ${balance >= 0
                  ? "text-green-600"
                  : "text-red-600"
                }`}
            >
              ₹{Math.abs(balance)}
            </h2>

          </div>

        </div>

      </div>
    </div>

  );

};

export default LedgerPanel;