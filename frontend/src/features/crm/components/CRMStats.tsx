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
  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

    {cards.map((card) => (

      <div
        key={card.title}
        className="
          group
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
          transition-all
          duration-200
          hover:-translate-y-1
          hover:shadow-lg
        "
      >

        <div className="flex items-start justify-between">

          <div>

            <p className="text-sm font-medium text-slate-500">
              {card.title}
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
              {card.value}
            </h2>

          </div>

          <div
            className={`
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              text-xl
              font-bold
              ${card.color}
            `}
          >
            {card.title === "Total Customers" && "👥"}
            {card.title === "Active Customers" && "✅"}
            {card.title === "Pending Orders" && "📦"}
            {card.title === "Outstanding" && "₹"}
          </div>

        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">

          <div
            className={`
              h-full
              rounded-full
              transition-all
              duration-300

              ${
                card.title === "Total Customers"
                  ? "w-full bg-blue-500"
                  : card.title === "Active Customers"
                  ? "w-4/5 bg-green-500"
                  : card.title === "Pending Orders"
                  ? "w-2/3 bg-yellow-500"
                  : "w-3/5 bg-red-500"
              }
            `}
          />

        </div>

      </div>

    ))}

  </div>
);
};

export default CRMStats;