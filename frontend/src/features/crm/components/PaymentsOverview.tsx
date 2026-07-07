interface Props {
  payments: any[];
}

const PaymentsOverview = ({
  payments,
}: Props) => {

  const paid = payments.filter(
  (p) => p.amountPaid >= p.order?.totalAmount
).length;

const partial = payments.filter(
  (p) =>
    p.amountPaid > 0 &&
    p.amountPaid < p.order?.totalAmount
).length;

const pending = payments.filter(
  (p) => p.amountPaid === 0
).length;

const overdue = payments.filter((p) => {
  if (!p.order?.dueDate) return false;

  return (
    new Date(p.order.dueDate) < new Date() &&
    p.amountPaid < p.order.totalAmount
  );
});

const summary = [
  {
    title: "Paid",
    value: paid,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Partially Paid",
    value: partial,
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    title: "Pending",
    value: pending,
    color: "bg-red-100 text-red-700",
  },
  {
    title: "Overdue",
    value: overdue.length,
    color: "bg-slate-100 text-slate-700",
  },
];

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-4 gap-6">

        {summary.map((item) => (

          <div
            key={item.title}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >

            <p className="text-sm text-slate-500">
              {item.title}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {item.value}
            </h2>

            <span
              className={`
                inline-block
                mt-4
                px-3
                py-1
                rounded-full
                text-sm
                font-medium
                ${item.color}
              `}
            >
              {item.title}
            </span>

          </div>

        ))}

      </div>

      <div className="space-y-4">

        {payments.map((payment) => {

          const progress =
            (payment.paid / payment.total) * 100;

          return (

            <div
              key={payment.order}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >

              <div className="flex justify-between items-start">

                <div>

                  <h3 className="font-semibold">
                    {payment.order}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {payment.customer}
                  </p>

                </div>

                <span
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    font-medium
                    ${
                      payment.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : payment.status === "Partial"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  {payment.status}
                </span>

              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">

                <div>
                  <p className="text-sm text-slate-500">
                    Total
                  </p>

                  <p className="font-semibold">
                    ₹{payment.total.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Paid
                  </p>

                  <p className="font-semibold text-green-600">
                    ₹{payment.paid.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Due
                  </p>

                  <p className="font-semibold text-red-600">
                    ₹{payment.due.toLocaleString()}
                  </p>
                </div>

              </div>

              <div className="mt-5">

                <div className="w-full h-2 bg-slate-200 rounded-full">

                  <div
                    className="h-2 bg-[#172B6B] rounded-full"
                    style={{
                      width: `${progress}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          );
        })}

      </div>

    </div>
  );
};

export default PaymentsOverview;