interface Props {
  orders: any[];
  onEdit: (order: any) => void;
  onDelete: (order: any) => void;
  onRecordPayment: (order: any) => void;
}

const OrdersTable = ({
  orders,
  onEdit,
  onDelete,
  onRecordPayment,
}: Props) => {

  return (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

    {/* Header */}

    <div className="border-b border-slate-200 p-6">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            Orders
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track customer orders, delivery status and payments.
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <div className="rounded-2xl bg-blue-50 px-5 py-3">

            <p className="text-xs uppercase tracking-wide text-blue-500">
              Total
            </p>

            <h3 className="text-xl font-bold text-blue-700">
              {orders.length}
            </h3>

          </div>

          <div className="rounded-2xl bg-yellow-50 px-5 py-3">

            <p className="text-xs uppercase tracking-wide text-yellow-600">
              Pending
            </p>

            <h3 className="text-xl font-bold text-yellow-700">

              {
                orders.filter(
                  (o) => o.status === "Pending"
                ).length
              }

            </h3>

          </div>

          <div className="rounded-2xl bg-green-50 px-5 py-3">

            <p className="text-xs uppercase tracking-wide text-green-600">
              Delivered
            </p>

            <h3 className="text-xl font-bold text-green-700">

              {
                orders.filter(
                  (o) =>
                    o.status === "Delivered"
                ).length
              }

            </h3>

          </div>

        </div>

      </div>

    </div>

    <div className="overflow-x-auto">

      <table className="min-w-full">

        <thead className="sticky top-0 bg-slate-50">

          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">

            <th className="px-6 py-4 text-left font-semibold">
              Order No.
            </th>

            <th className="px-6 py-4 text-left font-semibold">
              Status
            </th>

            <th className="px-6 py-4 text-right font-semibold">
              Amount
            </th>

            <th className="px-6 py-4 text-center font-semibold">
              Created
            </th>

            <th className="px-6 py-4 text-center font-semibold">
              Actions
            </th>

          </tr>

        </thead>
<tbody>

  {orders.length === 0 ? (

    <tr>

      <td
        colSpan={5}
        className="px-6 py-24 text-center"
      >

        <div className="flex flex-col items-center">

          <div className="m-5 text-2xl">
            📦
          </div>

          <h3 className="text-xl font-bold text-slate-800">
            No Orders Yet
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Orders created for this customer will appear here.
          </p>

        </div>

      </td>

    </tr>

  ) : (

    orders.map((order) => (

      <tr
        key={order._id}
        className="border-b border-slate-100 transition hover:bg-slate-50"
      >

        {/* Order */}

        <td className="px-6 py-5">

          <div>

            <h4 className="font-bold text-slate-900">
              {order.orderNumber}
            </h4>

            <p className="mt-1 text-xs text-slate-500">
              Customer Order
            </p>

          </div>

        </td>

        {/* Status */}

        <td className="px-6 py-5">

          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold

            ${
              order.status === "Delivered"
                ? "bg-green-100 text-green-700"

                : order.status === "Pending"

                ? "bg-yellow-100 text-yellow-700"

                : order.status === "Cancelled"

                ? "bg-red-100 text-red-700"

                : "bg-blue-100 text-blue-700"
            }`}
          >

            {order.status}

          </span>

        </td>

        {/* Amount */}

        <td className="px-6 py-5 text-right">

          <div>

            <p className="text-xl font-bold text-slate-900">

              ₹
              {Number(
                order.totalAmount || 0
              ).toLocaleString()}

            </p>

            <p className="text-xs text-slate-500">

              Total Value

            </p>

          </div>

        </td>

        {/* Date */}

        <td className="px-6 py-5 text-center">

          <div>

            <p className="font-medium text-slate-700">

              {order.createdAt
                ? new Date(
                    order.createdAt
                  ).toLocaleDateString()
                : "-"}

            </p>

            <p className="text-xs text-slate-400">

              Created

            </p>

          </div>

        </td>

        {/* Actions */}

        <td className="px-6 py-5">

          <div className="flex justify-center gap-2">

            <button
              onClick={() =>
                onRecordPayment(order)
              }
              className="rounded-lg bg-green-100 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-200"
            >
              Payment
            </button>

            <button
              onClick={() =>
                onEdit(order)
              }
              className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
            >
              Edit
            </button>

            <button
              onClick={() =>
                onDelete(order)
              }
              className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
            >
              Delete
            </button>

          </div>

        </td>

      </tr>

    ))

  )}

</tbody>

      </table>

    </div>

  </div>
);
};

export default OrdersTable;