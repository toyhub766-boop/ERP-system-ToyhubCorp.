interface Props {
  customers: any[];
  orders: any[];
  payments: any[];
}

const CRMStats = ({
  customers,
  orders,
  payments,
}: Props) => {
  const totalCustomers = customers.length;

  const activeCustomers = new Set(
    orders.map((order) => order.customer)
  ).size;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const outstandingAmount = payments.reduce(
    (total, payment) => {
      const order = payment.order;

      if (!order) return total;

      return (
        total +
        (order.totalAmount - payment.amountPaid)
      );
    },
    0
  );

  const cards = [
    {
      title: "Total Customers",
      value: totalCustomers,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Active Customers",
      value: activeCustomers,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Outstanding",
      value: `₹${outstandingAmount.toLocaleString()}`,
      color: "bg-red-100 text-red-700",
    },
  ];

return (
  <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

    {cards.map((card) => (

      <div
        key={card.title}
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          transition
          hover:shadow-md
        "
      >

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {card.title}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {card.value}
            </h2>

          </div>

          <div
            className={`
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              text-lg
              ${card.color}
            `}
          >
            {card.title === "Total Customers" && "👥"}
            {card.title === "Active Customers" && "✅"}
            {card.title === "Pending Orders" && "📦"}
            {card.title === "Outstanding" && "₹"}
          </div>

        </div>

      </div>

    ))}

  </div>
);
};

export default CRMStats;