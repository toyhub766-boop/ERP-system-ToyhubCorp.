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
    <div className="space-y-4">

      {payments.length === 0 && (
        <div className="bg-white border rounded-xl p-8 text-center text-slate-500">
          No payments found.
        </div>
      )}

      {payments.map((payment) => (
        <div
          key={payment._id}
          className="bg-white border border-slate-200 rounded-2xl p-5"
        >

          <div className="flex justify-between">

            <div>

              <h3 className="font-semibold">
                ₹{payment.amountPaid.toLocaleString()}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {payment.paymentMethod}
              </p>

            </div>

            <div className="text-right">

              <p className="text-sm text-slate-500">
                Payment Date
              </p>

              <p className="font-medium">
                {new Date(
                  payment.paymentDate
                ).toLocaleDateString()}
              </p>

            </div>

          </div>

          <div className="mt-5">

            <p className="text-sm text-slate-500">
              Remarks
            </p>

            <p>
              {payment.remarks || "-"}
            </p>

          </div>

          <div className="flex gap-3 mt-6">

            <button
              onClick={() => onEdit(payment)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(payment)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Delete
            </button>

          </div>

        </div>
      ))}

    </div>
  );
};

export default PaymentsOverview;