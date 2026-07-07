interface Props {
  customer: any;
  orders: any[];
}

const CustomerProfile = ({
  customer,
  orders,
}: Props) => {
  if (!customer) {
    return (
      <div
        className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          h-full
          flex
          items-center
          justify-center
          text-slate-500
        "
      >
        Select a customer
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">

      <div className="flex flex-col items-center">

        <div
          className="
            w-20
            h-20
            rounded-full
            bg-[#172B6B]
            text-white
            flex
            items-center
            justify-center
            text-2xl
            font-bold
          "
        >
          {customer.contactPerson?.charAt(0) || "?"}
        </div>

        <h2 className="mt-4 text-xl font-bold">
          {customer.contactPerson}
        </h2>

        <p className="text-slate-500">
          {customer.companyName}
        </p>

      </div>

      <div className="mt-8 space-y-5">

        <div>
          <p className="text-sm text-slate-500">
            Phone
          </p>

          <p className="font-medium">
            {customer.phone || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            City
          </p>

          <p className="font-medium">
            {customer.city || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Email
          </p>

          <p className="font-medium">
            {customer.email || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Total Orders
          </p>

          <p className="font-medium">
            {orders.length}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Outstanding Amount
          </p>

          <p className="font-medium text-red-600">
            ₹{customer.outstandingAmount || 0}
          </p>
        </div>

      </div>

      <div className="mt-8">

        <h3 className="font-semibold mb-4">
          Recent Orders
        </h3>

        <div
          className="
            rounded-xl
            border
            border-dashed
            border-slate-300
            p-6
            text-center
            text-slate-500
          "
        >
          {orders.length === 0 ? (
  <div className="text-slate-500">
    No orders available
  </div>
) : (
  <div className="space-y-3">
    {orders.slice(0, 5).map((order) => (
      <div
        key={order._id}
        className="border rounded-lg p-3"
      >
        <div className="font-medium">
          {order.orderNumber}
        </div>

        <div className="text-sm text-slate-500">
          {order.status}
        </div>
      </div>
    ))}
  </div>
)}
        </div>

      </div>

    </div>
  );
};

export default CustomerProfile;