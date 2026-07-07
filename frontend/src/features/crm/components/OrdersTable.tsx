interface Props {
  orders: any[];
}

const OrdersTable = ({
  orders,
}: Props) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

      <table className="w-full">

        <thead className="bg-slate-50">

          <tr>

            <th className="text-left p-4">Order ID</th>

            <th className="text-left p-4">Customer</th>

            <th className="text-center p-4">Items</th>

            <th className="text-right p-4">Total</th>

            <th className="text-right p-4">Paid</th>

            <th className="text-center p-4">Status</th>

            <th className="text-center p-4">Date</th>

            <th className="text-center p-4">Due Date</th>

          </tr>

        </thead>

        <tbody>

          {orders.map((order) => (

            <tr
              key={order.orderNumber}
              className="border-t border-slate-100 hover:bg-slate-50"
            >

              <td className="p-4 font-medium">
                {order.orderNumber}
              </td>

              <td className="p-4">
                {order.customer}
              </td>

              <td className="p-4 text-center">
                {order.items?.length || 0}
              </td>

              <td className="p-4 text-right">
                ₹{order.totalAmount.toLocaleString()}
              </td>

              <td className="p-4 text-right">
                ₹{order.paidAmount.toLocaleString()}
              </td>

              <td className="p-4 text-center">

                <span
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    font-medium
                    ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  `}
                >
                  {order.status}
                </span>

              </td>

              <td className="p-4 text-center">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>

              <td className="p-4 text-center">
                {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : "-"}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default OrdersTable;