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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left p-4">Order No.</th>
            <th className="text-left p-4">Status</th>
            <th className="text-right p-4">Total Amount</th>
            <th className="text-center p-4">Created</th>
            <th className="text-center p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="text-center p-8 text-slate-500"
              >
                No orders found.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order._id}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="p-4 font-medium">
                  {order.orderNumber}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="p-4 text-right">
                  ₹{Number(order.totalAmount ?? 0).toLocaleString()}
                </td>

                <td className="p-4 text-center">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onRecordPayment(order)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Payment
                    </button>

                    <button
                      onClick={() => onEdit(order)}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(order)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
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
  );
};

export default OrdersTable;