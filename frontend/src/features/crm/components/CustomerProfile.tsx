interface Props {
  customer: any;
  orders: any[];
  onEdit: (customer: any) => void;
  onDelete: (customer: any) => void;
  onCreateOrder: (customer: any) => void;
  onRecordPayment: (customer: any) => void;
}

const CustomerProfile = ({
  customer,
  orders,
  onEdit,
  onDelete,
  onCreateOrder,
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

    <div className="flex flex-col">

  {/* ================= PROFILE HEADER ================= */}

  <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-8">

    <div
      className="
        flex
        h-24
        w-24
        items-center
        justify-center
        rounded-full
        bg-[#172B6B]
        text-3xl
        font-bold
        text-white
        shadow-lg
      "
    >
      {customer.contactPerson?.charAt(0) || "?"}
    </div>

    <h2 className="mt-5 text-2xl font-bold text-slate-900">
      {customer.contactPerson}
    </h2>

    <p className="mt-1 text-base text-slate-500">
      {customer.companyName}
    </p>

  </div>

  {/* ================= ACTIONS ================= */}

  <div className="mt-6 grid gap-3 sm:grid-cols-3">

    <button
      onClick={() => onEdit(customer)}
      className="
        rounded-xl
        bg-[#172B6B]
        px-4
        py-3
        text-sm
        font-semibold
        text-white
        transition
        hover:bg-[#20398F]
      "
    >
      Edit Customer
    </button>

    <button
      onClick={() => onDelete(customer)}
      className="
        rounded-xl
        bg-red-600
        px-4
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

    <button
      onClick={() => onCreateOrder(customer)}
      className="
        rounded-xl
        bg-green-600
        px-4
        py-3
        text-sm
        font-semibold
        text-white
        transition
        hover:bg-green-700
      "
    >
      New Order
    </button>

  </div>

  {/* ================= CUSTOMER INFO ================= */}

        <div className="mt-8 space-y-6">

  <div className="grid gap-6 md:grid-cols-2">

    <div className="rounded-2xl border border-slate-200 p-5">

      <p className="text-sm font-medium text-slate-500">
        Phone
      </p>

      <p className="mt-2 text-lg font-semibold text-slate-800">
        {customer.phone || "-"}
      </p>

    </div>

    <div className="rounded-2xl border border-slate-200 p-5">

      <p className="text-sm font-medium text-slate-500">
        Email
      </p>

      <p className="mt-2 break-all text-lg font-semibold text-slate-800">
        {customer.email || "-"}
      </p>

    </div>

    <div className="rounded-2xl border border-slate-200 p-5">

      <p className="text-sm font-medium text-slate-500">
        City
      </p>

      <p className="mt-2 text-lg font-semibold text-slate-800">
        {customer.city || "-"}
      </p>

    </div>

    <div className="rounded-2xl border border-slate-200 p-5">

      <p className="text-sm font-medium text-slate-500">
        Total Orders
      </p>

      <p className="mt-2 text-3xl font-bold text-[#172B6B]">
        {orders.length}
      </p>

    </div>

  </div>

  <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

    <p className="text-sm font-medium text-slate-500">
      Outstanding Amount
    </p>

    <h2 className="mt-3 text-4xl font-bold text-red-600">
      ₹{customer.outstandingAmount || 0}
    </h2>

    <p className="mt-2 text-sm text-slate-500">
      Pending payment from this customer.
    </p>

  </div>

</div>
        {/* ================= RECENT ORDERS ================= */}

<div className="mt-8">

  <div className="mb-5 flex items-center justify-between">

    <div>

      <h3 className="text-xl font-bold text-slate-900">
        Recent Orders
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Latest orders placed by this customer.
      </p>

    </div>

    <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
      {orders.length} Orders
    </div>

  </div>

  {orders.length === 0 ? (

    <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">

      <div className="mb-4 text-5xl">
        📦
      </div>

      <h4 className="text-lg font-semibold text-slate-700">
        No Orders Found
      </h4>

      <p className="mt-2 text-center text-sm text-slate-500">
        This customer hasn't placed any orders yet.
      </p>

    </div>

  ) : (

    <div className="space-y-4">

      {orders.slice(0, 5).map((order) => (

        <div
          key={order._id}
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            transition
            hover:border-[#172B6B]/30
            hover:shadow-sm
          "
        >

          <div className="flex items-start justify-between">

            <div>

              <h4 className="text-lg font-semibold text-slate-900">
                {order.orderNumber}
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                {order.status}
              </p>

            </div>

            <span
              className={`
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold

                ${
                  order.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : order.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : order.status === "Cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }
              `}
            >
              {order.status}
            </span>

          </div>

        </div>

      ))}

    </div>

  )}

</div>

</div></div>

  );
};

export default CustomerProfile;