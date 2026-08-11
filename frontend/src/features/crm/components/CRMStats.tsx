import {
  FiUsers,
  FiUserCheck,
  FiPackage,
  FiCreditCard,
} from "react-icons/fi";

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
      description: "Customers registered in CRM",
      icon: <FiUsers size={19} />,
      iconClass: "bg-blue-50 text-[#17357A]",
    },
    {
      title: "Active Customers",
      value: activeCustomers,
      description: "Customers with recorded orders",
      icon: <FiUserCheck size={19} />,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      description: "Orders awaiting processing",
      icon: <FiPackage size={19} />,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      title: "Outstanding",
      value: `₹${outstandingAmount.toLocaleString("en-IN")}`,
      description: "Amount currently receivable",
      icon: <FiCreditCard size={19} />,
      iconClass: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {cards.map((card) => (
          <div
            key={card.title}
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-md
            "
          >

            {/* Top row */}

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">

                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.1em]
                    text-slate-400
                  "
                >
                  {card.title}
                </p>

                <p
                  className="
                    mt-2
                    truncate
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-900
                    sm:text-3xl
                  "
                >
                  {card.value}
                </p>

              </div>


              {/* Icon */}

              <div
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  transition-transform
                  duration-200
                  group-hover:scale-105
                  ${card.iconClass}
                `}
              >
                {card.icon}
              </div>

            </div>


            {/* Description */}

            <div
              className="
                mt-5
                flex
                items-center
                gap-2
                border-t
                border-slate-100
                pt-3
              "
            >

              <span
                className="
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  bg-slate-300
                "
              />

              <p
                className="
                  truncate
                  text-xs
                  font-medium
                  text-slate-500
                "
              >
                {card.description}
              </p>

            </div>

          </div>
        ))}

      </div>
    </section>
  );
};

export default CRMStats;