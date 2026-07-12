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
  <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

    {/* Header */}

    <div className="border-b border-slate-200 px-6 py-5">

      <h2 className="text-xl font-bold text-slate-900">
        Orders
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Manage customer orders and payment status.
      </p>

    </div>

    <div className="overflow-x-auto">

      <table className="min-w-full">

        <thead className="bg-slate-50">

          <tr className="text-sm text-slate-600">

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
                className="py-20 text-center text-slate-500"
              >
                No orders found.
              </td>

            </tr>

          ) : (

            orders.map((order) => (

              <tr
                key={order._id}
                className="border-t border-slate-100 transition hover:bg-slate-50"
              >

                <td className="px-6 py-5">

                  <div>

                    <p className="font-semibold text-slate-900">
                      {order.orderNumber}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Customer Order
                    </p>

                  </div>

                </td>

                <td className="px-6 py-5">

                  <span
                    className={`
                      inline-flex
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-semibold

                      ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    `}
                  >
                    {order.status}
                  </span>

                </td>

                <td className="px-6 py-5 text-right">

                  <span className="text-lg font-bold text-slate-900">
                    ₹{Number(order.totalAmount ?? 0).toLocaleString()}
                  </span>

                </td>

                <td className="px-6 py-5 text-center text-slate-600">

                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "-"}

                </td>

                <td className="px-6 py-5">

                  <div className="flex flex-wrap justify-center gap-2">

                    <button
                      onClick={() => onRecordPayment(order)}
                      className="
                        rounded-xl
                        bg-green-600
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-green-700
                      "
                    >
                      Payment
                    </button>

                    <button
                      onClick={() => onEdit(order)}
                      className="
                        rounded-xl
                        bg-[#172B6B]
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-[#20398F]
                      "
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(order)}
                      className="
                        rounded-xl
                        bg-red-600
                        px-4
                        py-2
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