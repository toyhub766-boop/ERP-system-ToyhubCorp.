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
    <div className="grid grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white border border-slate-200 rounded-2xl p-6"
        >
          <p className="text-sm text-slate-500">
            {card.title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default CRMStats;