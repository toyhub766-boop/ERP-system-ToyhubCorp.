interface Props {
  payments: any[];
  onEdit: (payment: any) => void;
  onDelete: (payment: any) => void;
}

const PaymentsOverview = ({
  payments,
  onEdit,
  onDelete,
}: Props) => {
  return (
  <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

    {/* Header */}

    <div className="border-b border-slate-200 p-6">

  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

    <div>

      <h2 className="text-2xl font-bold text-slate-900">
        Payments
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Payment history, receipts and transaction records.
      </p>

    </div>

    <div className="flex flex-wrap gap-3">

      <div className="rounded-2xl bg-green-50 px-5 py-3">

        <p className="text-xs uppercase tracking-wide text-green-600">
          Payments
        </p>

        <h3 className="text-xl font-bold text-green-700">
          {payments.length}
        </h3>

      </div>

      <div className="rounded-2xl bg-blue-50 px-5 py-3">

        <p className="text-xs uppercase tracking-wide text-blue-600">
          Received
        </p>

        <h3 className="text-xl font-bold text-blue-700">

          ₹
          {payments
            .reduce(
              (sum, payment) =>
                sum + (payment.amountPaid || 0),
              0
            )
            .toLocaleString()}

        </h3>

      </div>

    </div>

  </div>

</div>

<div className="grid gap-5 p-6 lg:grid-cols-2">

      {payments.length === 0 ? (

        <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">

          <div className="mb-4 text-5xl">
            💳
          </div>

          <h3 className="text-xl font-semibold text-slate-700">
            No Payments Found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Payment records will appear here once recorded.
          </p>

        </div>

      ) : (

        payments.map((payment) => (

          <div
            key={payment._id}
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              transition-all
              duration-200
              hover:shadow-md
            "
          >

            {/* Top */}

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Amount Paid
                </p>

                <h2 className="mt-2 text-4xl font-bold text-[#172B6B]">
                  ₹{payment.amountPaid.toLocaleString()}
                </h2>


              </div>

              <div className="rounded-2xl bg-slate-50 px-6 py-4 text-right">

                <p className="text-sm text-slate-500">
                  Payment Date
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-800">
                  {new Date(
                    payment.paymentDate
                  ).toLocaleDateString()}
                </p>

              </div>

            </div>

            {/* Remarks */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <p className="text-sm font-medium text-slate-500">
                Remarks
              </p>

              <p className="mt-2 text-slate-700">
                {payment.remarks || "No remarks available."}
              </p>

            </div>

            {/* Actions */}

            <div className="mt-6 flex flex-wrap gap-3">

              <button
                onClick={() => onEdit(payment)}
                className="
                  rounded-xl
                  bg-[#172B6B]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#20398F]
                "
              >
                Edit Payment
              </button>

              <button
                onClick={() => onDelete(payment)}
                className="
                  rounded-xl
                  bg-red-600
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                "
              >
                Delete
              </button>

            </div>

          </div>

        ))

      )}

    </div>

  </div>
);
};

export default PaymentsOverview;