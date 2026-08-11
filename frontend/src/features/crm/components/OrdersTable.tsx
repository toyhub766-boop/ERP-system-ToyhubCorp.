import {
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiEdit2,
  FiPackage,
  FiTrash2,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";

interface Props {
  orders: any[];
  onEdit: (order: any) => void;
  onDelete: (order: any) => void;
  onRecordPayment: (order: any) => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "Delivered":
      return {
        icon: FiCheckCircle,
        dot: "bg-emerald-500",
        badge:
          "border-emerald-100 bg-emerald-50 text-emerald-700",
      };

    case "Pending":
      return {
        icon: FiClock,
        dot: "bg-amber-500",
        badge:
          "border-amber-100 bg-amber-50 text-amber-700",
      };

    case "Cancelled":
      return {
        icon: FiXCircle,
        dot: "bg-red-500",
        badge:
          "border-red-100 bg-red-50 text-red-700",
      };

    case "Dispatched":
      return {
        icon: FiTruck,
        dot: "bg-indigo-500",
        badge:
          "border-indigo-100 bg-indigo-50 text-indigo-700",
      };

    case "In Production":
      return {
        icon: FiPackage,
        dot: "bg-violet-500",
        badge:
          "border-violet-100 bg-violet-50 text-violet-700",
      };

    default:
      return {
        icon: FiClock,
        dot: "bg-blue-500",
        badge:
          "border-blue-100 bg-blue-50 text-blue-700",
      };
  }
};

const formatDate = (value?: string) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatAmount = (value: any) => {
  return Number(value || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
};

const OrdersTable = ({
  orders,
  onEdit,
  onDelete,
  onRecordPayment,
}: Props) => {
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "Pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.status === "Delivered"
  ).length;

  const totalValue = orders.reduce(
    (total, order) =>
      total +
      Number(order.totalAmount || 0),
    0
  );

  return (
    <section
      className="
        overflow-hidden
        rounded-[24px]
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        className="
          border-b
          border-slate-100
          bg-white
          px-5
          py-5
          sm:px-6
          sm:py-6
        "
      >

        <div
          className="
            flex
            flex-col
            gap-5
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >

          {/* Title */}

          <div className="flex items-start gap-4">

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#172B6B]/10
                text-[#172B6B]
              "
            >
              <FiPackage size={20} />
            </div>

            <div>

              <div className="flex items-center gap-3">

                <h2
                  className="
                    text-lg
                    font-bold
                    tracking-tight
                    text-slate-900
                    sm:text-xl
                  "
                >
                  Orders
                </h2>

                <span
                  className="
                    rounded-full
                    bg-slate-100
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    text-slate-500
                  "
                >
                  {totalOrders}
                </span>

              </div>

              <p
                className="
                  mt-1
                  max-w-xl
                  text-xs
                  leading-5
                  text-slate-500
                  sm:text-sm
                "
              >
                Track customer orders, fulfillment
                progress and payment activity.
              </p>

            </div>

          </div>


          {/* Summary */}

          <div
            className="
              grid
              grid-cols-2
              gap-2
              sm:grid-cols-4
              xl:min-w-[560px]
            "
          >

            {/* Total */}

            <div
              className="
                rounded-xl
                border
                border-slate-100
                bg-slate-50
                px-3
                py-2.5
              "
            >
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Total Orders
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                {totalOrders}
              </p>
            </div>


            {/* Pending */}

            <div
              className="
                rounded-xl
                border
                border-amber-100
                bg-amber-50/60
                px-3
                py-2.5
              "
            >
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-amber-600
                "
              >
                Pending
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-amber-700
                "
              >
                {pendingOrders}
              </p>
            </div>


            {/* Delivered */}

            <div
              className="
                rounded-xl
                border
                border-emerald-100
                bg-emerald-50/60
                px-3
                py-2.5
              "
            >
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-emerald-600
                "
              >
                Delivered
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-emerald-700
                "
              >
                {deliveredOrders}
              </p>
            </div>


            {/* Value */}

            <div
              className="
                rounded-xl
                border
                border-blue-100
                bg-blue-50/60
                px-3
                py-2.5
              "
            >
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-blue-600
                "
              >
                Order Value
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-lg
                  font-bold
                  text-[#172B6B]
                "
                title={`₹${formatAmount(totalValue)}`}
              >
                ₹{formatAmount(totalValue)}
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          TABLE
      ====================================================== */}

      <div
        className="
          overflow-x-auto
          scrollbar-thin
          scrollbar-thumb-slate-300
          scrollbar-track-transparent
        "
      >

        <table className="min-w-[900px] w-full">

          {/* Header */}

          <thead>

            <tr
              className="
                border-b
                border-slate-100
                bg-slate-50/70
              "
            >

              <th
                className="
                  px-6
                  py-3.5
                  text-left
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Order
              </th>

              <th
                className="
                  px-6
                  py-3.5
                  text-left
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Status
              </th>

              <th
                className="
                  px-6
                  py-3.5
                  text-right
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Amount
              </th>

              <th
                className="
                  px-6
                  py-3.5
                  text-center
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Created
              </th>

              <th
                className="
                  px-6
                  py-3.5
                  text-center
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Actions
              </th>

            </tr>

          </thead>


          {/* Body */}

          <tbody>

            {orders.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="px-6 py-20"
                >

                  <div
                    className="
                      mx-auto
                      flex
                      max-w-sm
                      flex-col
                      items-center
                      text-center
                    "
                  >

                    <div
                      className="
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        bg-slate-100
                        text-slate-400
                      "
                    >
                      <FiPackage size={27} />
                    </div>

                    <h3
                      className="
                        mt-5
                        text-base
                        font-bold
                        text-slate-800
                      "
                    >
                      No orders yet
                    </h3>

                    <p
                      className="
                        mt-1.5
                        text-sm
                        leading-5
                        text-slate-500
                      "
                    >
                      Orders created for this
                      customer will appear here.
                    </p>

                  </div>

                </td>

              </tr>

            ) : (

              orders.map((order) => {

                const status =
                  getStatusConfig(
                    order.status
                  );

                const StatusIcon =
                  status.icon;

                return (
                  <tr
                    key={order._id}
                    className="
                      group
                      border-b
                      border-slate-100
                      transition-colors
                      last:border-b-0
                      hover:bg-slate-50/70
                    "
                  >

                    {/* Order */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#172B6B]/8
                            text-[#172B6B]
                          "
                        >
                          <FiPackage size={16} />
                        </div>

                        <div className="min-w-0">

                          <p
                            className="
                              truncate
                              text-sm
                              font-bold
                              text-slate-900
                            "
                          >
                            {order.orderNumber ||
                              "Order"}
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-[11px]
                              text-slate-400
                            "
                          >
                            Customer Order
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* Status */}

                    <td className="px-6 py-5">

                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          border
                          px-3
                          py-1.5
                          text-[11px]
                          font-bold
                          ${status.badge}
                        `}
                      >

                        <span
                          className={`
                            h-1.5
                            w-1.5
                            rounded-full
                            ${status.dot}
                          `}
                        />

                        <StatusIcon size={12} />

                        {order.status}

                      </span>

                    </td>


                    {/* Amount */}

                    <td
                      className="
                        px-6
                        py-5
                        text-right
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-bold
                          text-slate-900
                        "
                      >
                        ₹
                        {formatAmount(
                          order.totalAmount
                        )}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          text-slate-400
                        "
                      >
                        Total value
                      </p>

                    </td>


                    {/* Date */}

                    <td
                      className="
                        px-6
                        py-5
                        text-center
                      "
                    >

                      <p
                        className="
                          text-xs
                          font-semibold
                          text-slate-700
                        "
                      >
                        {formatDate(
                          order.createdAt
                        )}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          text-slate-400
                        "
                      >
                        Created
                      </p>

                    </td>


                    {/* Actions */}

                    <td className="px-6 py-5">

                      <div
                        className="
                          flex
                          items-center
                          justify-center
                          gap-1.5
                        "
                      >

                        {/* Payment */}

                        <button
                          type="button"
                          title="Record payment"
                          onClick={() =>
                            onRecordPayment(
                              order
                            )
                          }
                          className="
                            inline-flex
                            h-9
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            border-emerald-100
                            bg-emerald-50
                            px-3
                            text-[11px]
                            font-bold
                            text-emerald-700
                            transition
                            hover:border-emerald-200
                            hover:bg-emerald-100
                            active:scale-[0.97]
                          "
                        >
                          <FiCreditCard
                            size={14}
                          />

                          Payment
                        </button>


                        {/* Edit */}

                        <button
                          type="button"
                          title="Edit order"
                          onClick={() =>
                            onEdit(order)
                          }
                          className="
                            inline-flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            text-slate-500
                            transition
                            hover:border-blue-200
                            hover:bg-blue-50
                            hover:text-blue-700
                            active:scale-[0.97]
                          "
                        >
                          <FiEdit2
                            size={14}
                          />
                        </button>


                        {/* Delete */}

                        <button
                          type="button"
                          title="Delete order"
                          onClick={() =>
                            onDelete(order)
                          }
                          className="
                            inline-flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            text-slate-400
                            transition
                            hover:border-red-200
                            hover:bg-red-50
                            hover:text-red-600
                            active:scale-[0.97]
                          "
                        >
                          <FiTrash2
                            size={14}
                          />
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              })

            )}

          </tbody>

        </table>

      </div>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      {orders.length > 0 && (
        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-slate-100
            bg-slate-50/50
            px-5
            py-3
            sm:px-6
          "
        >

          <p
            className="
              text-[11px]
              text-slate-400
            "
          >
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {orders.length}
            </span>{" "}
            {orders.length === 1
              ? "order"
              : "orders"}
          </p>

          <p
            className="
              text-[11px]
              font-medium
              text-slate-400
            "
          >
            Total value{" "}
            <span className="font-bold text-slate-700">
              ₹{formatAmount(totalValue)}
            </span>
          </p>

        </div>
      )}

    </section>
  );
};

export default OrdersTable;