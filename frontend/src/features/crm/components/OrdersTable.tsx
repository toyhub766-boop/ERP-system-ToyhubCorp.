import { useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiEdit2,
  FiFileText,
  FiImage,
  FiPackage,
  FiRefreshCw,
  FiTrash2,
  FiTruck,
  FiUser,
  FiXCircle,
} from "react-icons/fi";

interface Props {
  orders: any[];
  onEdit: (order: any) => void;
  onDelete: (order: any) => void;
}

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getClientName = (order: any) => {
  if (typeof order?.client === "string") {
    return order.client;
  }

  return (
    order?.client?.name ||
    order?.client?.companyName ||
    order?.customer?.name ||
    order?.customer?.companyName ||
    "Unknown Client"
  );
};

const getProducts = (order: any) => {
  if (Array.isArray(order?.items)) {
    return order.items;
  }

  if (Array.isArray(order?.products)) {
    return order.products;
  }

  return [];
};

const getProductName = (item: any) => {
  if (typeof item?.product === "string") {
    return item.product;
  }

  return (
    item?.product?.name ||
    item?.name ||
    item?.productName ||
    "Product"
  );
};

const getProductImage = (item: any) => {
  return (
    item?.image ||
    item?.product?.image ||
    item?.product?.photo ||
    item?.photo ||
    ""
  );
};

const getProductMarka = (item: any) => {
  return (
    item?.marka ||
    item?.product?.marka ||
    item?.brand ||
    item?.product?.brand ||
    ""
  );
};

const getProductCategory = (item: any) => {
  const category = item?.category || item?.product?.category;

  if (typeof category === "string") {
    return category;
  }

  return category?.name || "";
};

const getQuantity = (item: any) => {
  return Number(item?.quantity || 0);
};

const getActualQuantity = (item: any) => {
  return Number(item?.actualQuantity || 0);
};

const getRemainingQuantity = (item: any) => {
  const quantity = getQuantity(item);
  const actual = getActualQuantity(item);

  return Math.max(quantity - actual, 0);
};

const getProgressPercentage = (item: any) => {
  const quantity = getQuantity(item);
  const actual = getActualQuantity(item);

  if (!quantity) return 0;

  return Math.min(Math.round((actual / quantity) * 100), 100);
};

const getStatusConfig = (status?: string) => {
  const normalized = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");

  if (
    normalized.includes("complete") ||
    normalized.includes("completed")
  ) {
    return {
      label: "Completed",
      icon: FiCheckCircle,
      dot: "bg-emerald-500",
      badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    };
  }

  if (
    normalized.includes("dispatch") ||
    normalized.includes("ready")
  ) {
    return {
      label: "Ready for Dispatch",
      icon: FiTruck,
      dot: "bg-indigo-500",
      badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
    };
  }

  if (
    normalized.includes("progress") ||
    normalized.includes("production") ||
    normalized.includes("processing")
  ) {
    return {
      label: "In Production",
      icon: FiPackage,
      dot: "bg-violet-500",
      badge: "border-violet-100 bg-violet-50 text-violet-700",
    };
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("cancelled")
  ) {
    return {
      label: "Cancelled",
      icon: FiXCircle,
      dot: "bg-red-500",
      badge: "border-red-100 bg-red-50 text-red-700",
    };
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("waiting")
  ) {
    return {
      label: "Pending",
      icon: FiClock,
      dot: "bg-amber-500",
      badge: "border-amber-100 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: status || "Pending",
    icon: FiClock,
    dot: "bg-slate-400",
    badge: "border-slate-200 bg-slate-50 text-slate-600",
  };
};

const getChecklistState = (item: any) => {
  const preparing = Boolean(item?.checklist?.preparing);
  const leaving = Boolean(item?.checklist?.leaving);

  if (item?.completed) {
    return "Completed";
  }

  if (item?.readyForDispatch) {
    return "Ready for Dispatch";
  }

  if (leaving) {
    return "Leaving";
  }

  if (preparing) {
    return "Preparing";
  }

  return "Not Started";
};

const getOrderProgress = (order: any) => {
  const products = getProducts(order);

  if (!products.length) {
    return {
      completed: 0,
      total: 0,
      remaining: 0,
      percentage: 0,
    };
  }

  const total = products.reduce(
    (sum: number, item: any) =>
      sum + getQuantity(item),
    0
  );

  const completed = products.reduce(
    (sum: number, item: any) =>
      sum + getActualQuantity(item),
    0
  );

  const remaining = Math.max(total - completed, 0);

  const percentage = total
    ? Math.min(Math.round((completed / total) * 100), 100)
    : 0;

  return {
    completed,
    total,
    remaining,
    percentage,
  };
};

const getTimeline = (order: any) => {
  const timeline: Array<{
    title: string;
    description: string;
    date?: string;
    icon: any;
    state: "done" | "current" | "pending";
  }> = [];

  timeline.push({
    title: "Order Created",
    description: "Production order was created from CRM.",
    date: order?.createdAt,
    icon: FiFileText,
    state: "done",
  });

  const status = String(order?.status || "")
    .toLowerCase()
    .replace(/_/g, " ");

  const products = getProducts(order);

  const hasPreparing = products.some(
    (item: any) =>
      Boolean(item?.checklist?.preparing)
  );

  const hasLeaving = products.some(
    (item: any) =>
      Boolean(item?.checklist?.leaving)
  );

  const hasActualQuantity = products.some(
    (item: any) =>
      getActualQuantity(item) > 0
  );

  const isCompleted = products.length
    ? products.every(
        (item: any) =>
          Boolean(item?.completed)
      )
    : status.includes("complete");

  const isReadyForDispatch =
    Boolean(order?.readyForDispatch) ||
    products.some(
      (item: any) =>
        Boolean(item?.readyForDispatch)
    );

  timeline.push({
    title: "Production Started",
    description: hasPreparing
      ? "Production preparation has started."
      : "Waiting for production preparation.",
    date: hasPreparing
      ? order?.updatedAt
      : undefined,
    icon: FiPackage,
    state: hasPreparing
      ? "done"
      : "pending",
  });

  timeline.push({
    title: "Production In Progress",
    description: hasActualQuantity
      ? "Production quantity is being completed."
      : "Production progress has not been recorded yet.",
    date: hasActualQuantity
      ? order?.updatedAt
      : undefined,
    icon: FiRefreshCw,
    state: hasActualQuantity
      ? "done"
      : hasPreparing
      ? "current"
      : "pending",
  });

  timeline.push({
    title: "Production Completed",
    description: isCompleted
      ? "All production quantities have been completed."
      : "Waiting for production completion.",
    date: isCompleted
      ? order?.updatedAt
      : undefined,
    icon: FiCheckCircle,
    state: isCompleted
      ? "done"
      : hasActualQuantity
      ? "current"
      : "pending",
  });

  timeline.push({
    title: "Ready for Dispatch",
    description: isReadyForDispatch
      ? "Order has been marked ready for dispatch."
      : hasLeaving
      ? "Dispatch preparation is in progress."
      : "Waiting for dispatch readiness.",
    date: isReadyForDispatch
      ? order?.updatedAt
      : undefined,
    icon: FiTruck,
    state: isReadyForDispatch
      ? "done"
      : isCompleted || hasLeaving
      ? "current"
      : "pending",
  });

  return timeline;
};

const OrdersTable = ({
  orders,
  onEdit,
  onDelete,
}: Props) => {
  const [expandedOrder, setExpandedOrder] =
    useState<string | null>(null);

  const summary = useMemo(() => {
    let totalQuantity = 0;
    let completedQuantity = 0;
    let remainingQuantity = 0;

    orders.forEach((order) => {
      const progress = getOrderProgress(order);

      totalQuantity += progress.total;
      completedQuantity += progress.completed;
      remainingQuantity += progress.remaining;
    });

    return {
      totalOrders: orders.length,
      activeOrders: orders.filter((order) => {
        const normalized = String(
          order?.status || ""
        ).toLowerCase();

        return (
          !normalized.includes("complete") &&
          !normalized.includes("cancel")
        );
      }).length,
      completedOrders: orders.filter((order) => {
        const products = getProducts(order);

        if (products.length) {
          return products.every(
            (item: any) =>
              Boolean(item?.completed)
          );
        }

        return String(
          order?.status || ""
        )
          .toLowerCase()
          .includes("complete");
      }).length,
      totalQuantity,
      completedQuantity,
      remainingQuantity,
    };
  }, [orders]);

  const toggleOrder = (id: string) => {
    setExpandedOrder((current) =>
      current === id ? null : id
    );
  };

  return (
    <section
      className="
        overflow-hidden
        rounded-[24px]
        border border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* Header */}

      <div
        className="
          border-b border-slate-100
          bg-white
          px-5 py-5
          sm:px-6 sm:py-6
        "
      >
        <div
          className="
            flex flex-col gap-5
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex h-11 w-11 shrink-0
                items-center justify-center
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
                    text-lg font-bold
                    tracking-tight text-slate-900
                    sm:text-xl
                  "
                >
                  Production Orders
                </h2>

                <span
                  className="
                    rounded-full
                    bg-slate-100
                    px-2.5 py-1
                    text-[10px]
                    font-bold text-slate-500
                  "
                >
                  {summary.totalOrders}
                </span>
              </div>

              <p
                className="
                  mt-1 max-w-xl
                  text-xs leading-5
                  text-slate-500
                  sm:text-sm
                "
              >
                Complete order history and
                production tracking for customer
                communication.
              </p>
            </div>
          </div>

          {/* Summary */}

          <div
            className="
              grid grid-cols-2
              gap-2
              sm:grid-cols-4
              xl:min-w-[600px]
            "
          >
            <div
              className="
                rounded-xl
                border border-slate-100
                bg-slate-50
                px-3 py-2.5
              "
            >
              <p
                className="
                  text-[9px] font-bold
                  uppercase tracking-wider
                  text-slate-400
                "
              >
                Orders
              </p>

              <p
                className="
                  mt-1 text-lg
                  font-bold text-slate-900
                "
              >
                {summary.totalOrders}
              </p>
            </div>

            <div
              className="
                rounded-xl
                border border-blue-100
                bg-blue-50/60
                px-3 py-2.5
              "
            >
              <p
                className="
                  text-[9px] font-bold
                  uppercase tracking-wider
                  text-blue-600
                "
              >
                Active
              </p>

              <p
                className="
                  mt-1 text-lg
                  font-bold text-blue-700
                "
              >
                {summary.activeOrders}
              </p>
            </div>

            <div
              className="
                rounded-xl
                border border-emerald-100
                bg-emerald-50/60
                px-3 py-2.5
              "
            >
              <p
                className="
                  text-[9px] font-bold
                  uppercase tracking-wider
                  text-emerald-600
                "
              >
                Completed
              </p>

              <p
                className="
                  mt-1 text-lg
                  font-bold text-emerald-700
                "
              >
                {summary.completedOrders}
              </p>
            </div>

            <div
              className="
                rounded-xl
                border border-violet-100
                bg-violet-50/60
                px-3 py-2.5
              "
            >
              <p
                className="
                  text-[9px] font-bold
                  uppercase tracking-wider
                  text-violet-600
                "
              >
                Remaining
              </p>

              <p
                className="
                  mt-1 text-lg
                  font-bold text-violet-700
                "
              >
                {summary.remainingQuantity}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full">
          <thead>
            <tr
              className="
                border-b border-slate-100
                bg-slate-50/70
              "
            >
              <th className="w-12 px-4 py-3" />

              <th
                className="
                  px-4 py-3.5
                  text-left
                  text-[10px] font-bold
                  uppercase tracking-[0.12em]
                  text-slate-400
                "
              >
                Order
              </th>

              <th
                className="
                  px-4 py-3.5
                  text-left
                  text-[10px] font-bold
                  uppercase tracking-[0.12em]
                  text-slate-400
                "
              >
                Client
              </th>

              <th
                className="
                  px-4 py-3.5
                  text-left
                  text-[10px] font-bold
                  uppercase tracking-[0.12em]
                  text-slate-400
                "
              >
                Products
              </th>

              <th
                className="
                  px-4 py-3.5
                  text-left
                  text-[10px] font-bold
                  uppercase tracking-[0.12em]
                  text-slate-400
                "
              >
                Progress
              </th>

              <th
                className="
                  px-4 py-3.5
                  text-left
                  text-[10px] font-bold
                  uppercase tracking-[0.12em]
                  text-slate-400
                "
              >
                Status
              </th>

              <th
                className="
                  px-4 py-3.5
                  text-left
                  text-[10px] font-bold
                  uppercase tracking-[0.12em]
                  text-slate-400
                "
              >
                Target
              </th>

              <th
                className="
                  px-4 py-3.5
                  text-center
                  text-[10px] font-bold
                  uppercase tracking-[0.12em]
                  text-slate-400
                "
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-20">
                  <div
                    className="
                      mx-auto flex max-w-sm
                      flex-col items-center
                      text-center
                    "
                  >
                    <div
                      className="
                        flex h-16 w-16
                        items-center justify-center
                        rounded-2xl
                        bg-slate-100
                        text-slate-400
                      "
                    >
                      <FiPackage size={27} />
                    </div>

                    <h3
                      className="
                        mt-5 text-base
                        font-bold text-slate-800
                      "
                    >
                      No production orders yet
                    </h3>

                    <p
                      className="
                        mt-1.5 text-sm
                        leading-5 text-slate-500
                      "
                    >
                      Orders created by CRM will
                      appear here with their complete
                      production history.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const orderId = order?._id;

                const expanded =
                  expandedOrder === orderId;

                const products =
                  getProducts(order);

                const progress =
                  getOrderProgress(order);

                const status =
                  getStatusConfig(
                    order?.status
                  );

                const StatusIcon =
                  status.icon;

                return (
                  <tr
                    key={orderId}
                    className="
                      border-b border-slate-100
                      last:border-b-0
                    "
                  >
                    {/* Main Row */}

                    <td
                      colSpan={8}
                      className="p-0"
                    >
                      <div
                        className="
                          grid
                          grid-cols-[48px_1.1fr_1.2fr_1.5fr_1.4fr_1.25fr_1fr_150px]
                          items-center
                          min-w-[1050px]
                          transition
                          hover:bg-slate-50/60
                        "
                      >
                        {/* Expand */}

                        <div className="flex justify-center">
                          <button
                            type="button"
                            title={
                              expanded
                                ? "Collapse order"
                                : "View order tracking"
                            }
                            onClick={() =>
                              toggleOrder(
                                orderId
                              )
                            }
                            className="
                              flex h-8 w-8
                              items-center justify-center
                              rounded-lg
                              border border-slate-200
                              bg-white
                              text-slate-500
                              transition
                              hover:border-[#172B6B]/20
                              hover:bg-[#172B6B]/5
                              hover:text-[#172B6B]
                            "
                          >
                            {expanded ? (
                              <FiChevronUp
                                size={15}
                              />
                            ) : (
                              <FiChevronDown
                                size={15}
                              />
                            )}
                          </button>
                        </div>

                        {/* Order */}

                        <div className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className="
                                flex h-9 w-9 shrink-0
                                items-center justify-center
                                rounded-xl
                                bg-[#172B6B]/8
                                text-[#172B6B]
                              "
                            >
                              <FiPackage
                                size={16}
                              />
                            </div>

                            <div className="min-w-0">
                              <p
                                className="
                                  truncate text-sm
                                  font-bold text-slate-900
                                "
                              >
                                {order?.orderNumber ||
                                  "Production Order"}
                              </p>

                              <p
                                className="
                                  mt-0.5 text-[10px]
                                  text-slate-400
                                "
                              >
                                {formatDate(
                                  order?.createdAt
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Client */}

                        <div className="px-4 py-5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="
                                flex h-8 w-8 shrink-0
                                items-center justify-center
                                rounded-lg
                                bg-slate-100
                                text-slate-500
                              "
                            >
                              <FiUser size={14} />
                            </div>

                            <div className="min-w-0">
                              <p
                                className="
                                  truncate text-sm
                                  font-semibold
                                  text-slate-800
                                "
                              >
                                {getClientName(
                                  order
                                )}
                              </p>

                              <p
                                className="
                                  mt-0.5 text-[10px]
                                  text-slate-400
                                "
                              >
                                Customer
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Products */}

                        <div className="px-4 py-5">
                          {products.length ? (
                            <div className="space-y-1.5">
                              {products
                                .slice(0, 2)
                                .map(
                                  (
                                    item: any,
                                    index: number
                                  ) => (
                                    <div
                                      key={
                                        item?._id ||
                                        index
                                      }
                                      className="
                                        flex
                                        items-center
                                        gap-2
                                      "
                                    >
                                      <div
                                        className="
                                          flex h-7 w-7
                                          shrink-0
                                          items-center
                                          justify-center
                                          overflow-hidden
                                          rounded-lg
                                          bg-slate-100
                                          text-slate-400
                                        "
                                      >
                                        {getProductImage(
                                          item
                                        ) ? (
                                          <img
                                            src={getProductImage(
                                              item
                                            )}
                                            alt=""
                                            className="
                                              h-full w-full
                                              object-cover
                                            "
                                          />
                                        ) : (
                                          <FiPackage
                                            size={12}
                                          />
                                        )}
                                      </div>

                                      <div className="min-w-0">
                                        <p
                                          className="
                                            truncate
                                            text-xs
                                            font-semibold
                                            text-slate-700
                                          "
                                        >
                                          {getProductName(
                                            item
                                          )}
                                        </p>

                                        <p
                                          className="
                                            text-[9px]
                                            text-slate-400
                                          "
                                        >
                                          Qty{" "}
                                          {getQuantity(
                                            item
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                )}

                              {products.length > 2 && (
                                <p
                                  className="
                                    text-[10px]
                                    font-semibold
                                    text-[#172B6B]
                                  "
                                >
                                  +{" "}
                                  {products.length -
                                    2}{" "}
                                  more products
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No products
                            </span>
                          )}
                        </div>

                        {/* Progress */}

                        <div className="px-4 py-5">
                          <div className="flex items-center justify-between">
                            <span
                              className="
                                text-xs font-bold
                                text-slate-700
                              "
                            >
                              {progress.percentage}%
                            </span>

                            <span
                              className="
                                text-[10px]
                                text-slate-400
                              "
                            >
                              {progress.completed}/
                              {progress.total}
                            </span>
                          </div>

                          <div
                            className="
                              mt-2 h-1.5
                              overflow-hidden
                              rounded-full
                              bg-slate-100
                            "
                          >
                            <div
                              className="
                                h-full
                                rounded-full
                                bg-[#172B6B]
                                transition-all
                              "
                              style={{
                                width: `${progress.percentage}%`,
                              }}
                            />
                          </div>

                          <p
                            className="
                              mt-1.5
                              text-[9px]
                              text-slate-400
                            "
                          >
                            {progress.remaining}{" "}
                            remaining
                          </p>
                        </div>

                        {/* Status */}

                        <div className="px-4 py-5">
                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              border
                              px-3 py-1.5
                              text-[10px]
                              font-bold
                              ${status.badge}
                            `}
                          >
                            <span
                              className={`
                                h-1.5 w-1.5
                                rounded-full
                                ${status.dot}
                              `}
                            />

                            <StatusIcon
                              size={11}
                            />

                            {status.label}
                          </span>
                        </div>

                        {/* Target */}

                        <div className="px-4 py-5">
                          <div className="flex items-center gap-2">
                            <FiCalendar
                              size={13}
                              className="text-slate-400"
                            />

                            <div>
                              <p
                                className="
                                  text-xs
                                  font-semibold
                                  text-slate-700
                                "
                              >
                                {formatDate(
                                  order?.targetDate
                                )}
                              </p>

                              <p
                                className="
                                  mt-0.5 text-[9px]
                                  text-slate-400
                                "
                              >
                                Target date
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}

                        <div
                          className="
                            flex
                            items-center
                            justify-center
                            gap-1.5
                            px-4 py-5
                          "
                        >
                          <button
                            type="button"
                            title="Edit order"
                            onClick={() =>
                              onEdit(order)
                            }
                            className="
                              inline-flex
                              h-9 w-9
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
                            "
                          >
                            <FiEdit2
                              size={14}
                            />
                          </button>

                          <button
                            type="button"
                            title="Delete order"
                            onClick={() =>
                              onDelete(order)
                            }
                            className="
                              inline-flex
                              h-9 w-9
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
                            "
                          >
                            <FiTrash2
                              size={14}
                            />
                          </button>

                          <button
                            type="button"
                            title={
                              expanded
                                ? "Hide tracking"
                                : "View tracking"
                            }
                            onClick={() =>
                              toggleOrder(
                                orderId
                              )
                            }
                            className="
                              inline-flex
                              h-9 w-9
                              items-center
                              justify-center
                              rounded-lg
                              bg-[#172B6B]
                              text-white
                              transition
                              hover:bg-[#102158]
                            "
                          >
                            {expanded ? (
                              <FiChevronUp
                                size={14}
                              />
                            ) : (
                              <FiChevronDown
                                size={14}
                              />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Tracking */}

                      {expanded && (
                        <div
                          className="
                            border-t
                            border-slate-100
                            bg-slate-50/60
                            px-5 py-6
                            sm:px-8
                          "
                        >
                          <div
                            className="
                              grid
                              gap-6
                              xl:grid-cols-[1.4fr_1fr]
                            "
                          >
                            {/* Left: Order Information */}

                            <div className="space-y-5">
                              <div>
                                <div className="flex items-center gap-2">
                                  <FiFileText
                                    size={15}
                                    className="text-[#172B6B]"
                                  />

                                  <h3
                                    className="
                                      text-sm
                                      font-bold
                                      text-slate-900
                                    "
                                  >
                                    Order Information
                                  </h3>

                                  <span
                                    className="
                                      rounded-full
                                      bg-white
                                      px-2 py-0.5
                                      text-[9px]
                                      font-semibold
                                      text-slate-400
                                    "
                                  >
                                    CRM View
                                  </span>
                                </div>

                                <p
                                  className="
                                    mt-1
                                    text-[11px]
                                    text-slate-400
                                  "
                                >
                                  Customer-facing order
                                  information and
                                  production status.
                                </p>
                              </div>

                              {/* Order Meta */}

                              <div
                                className="
                                  grid
                                  gap-3
                                  sm:grid-cols-3
                                "
                              >
                                <div
                                  className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-4
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
                                    Order
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-sm
                                      font-bold
                                      text-slate-800
                                    "
                                  >
                                    {order?.orderNumber ||
                                      "-"}
                                  </p>
                                </div>

                                <div
                                  className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-4
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
                                    Created
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-sm
                                      font-bold
                                      text-slate-800
                                    "
                                  >
                                    {formatDate(
                                      order?.createdAt
                                    )}
                                  </p>
                                </div>

                                <div
                                  className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-4
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
                                    Target
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-sm
                                      font-bold
                                      text-slate-800
                                    "
                                  >
                                    {formatDate(
                                      order?.targetDate
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Product Details */}

                              <div
                                className="
                                  overflow-hidden
                                  rounded-2xl
                                  border
                                  border-slate-200
                                  bg-white
                                "
                              >
                                <div
                                  className="
                                    border-b
                                    border-slate-100
                                    px-4 py-3
                                  "
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <FiPackage
                                        size={14}
                                        className="text-[#172B6B]"
                                      />

                                      <h4
                                        className="
                                          text-xs
                                          font-bold
                                          text-slate-800
                                        "
                                      >
                                        Products in Order
                                      </h4>
                                    </div>

                                    <span
                                      className="
                                        rounded-full
                                        bg-slate-100
                                        px-2 py-1
                                        text-[9px]
                                        font-bold
                                        text-slate-500
                                      "
                                    >
                                      {products.length}
                                    </span>
                                  </div>
                                </div>

                                <div className="divide-y divide-slate-100">
                                  {products.length ? (
                                    products.map(
                                      (
                                        item: any,
                                        index: number
                                      ) => {
                                        const itemProgress =
                                          getProgressPercentage(
                                            item
                                          );

                                        const remaining =
                                          getRemainingQuantity(
                                            item
                                          );

                                        const checklist =
                                          getChecklistState(
                                            item
                                          );

                                        return (
                                          <div
                                            key={
                                              item?._id ||
                                              index
                                            }
                                            className="p-4"
                                          >
                                            <div
                                              className="
                                                flex
                                                flex-col
                                                gap-4
                                                sm:flex-row
                                              "
                                            >
                                              {/* Image */}

                                              <div
                                                className="
                                                  flex
                                                  h-16 w-16
                                                  shrink-0
                                                  items-center
                                                  justify-center
                                                  overflow-hidden
                                                  rounded-xl
                                                  bg-slate-100
                                                  text-slate-400
                                                "
                                              >
                                                {getProductImage(
                                                  item
                                                ) ? (
                                                  <img
                                                    src={getProductImage(
                                                      item
                                                    )}
                                                    alt={getProductName(
                                                      item
                                                    )}
                                                    className="
                                                      h-full
                                                      w-full
                                                      object-cover
                                                    "
                                                  />
                                                ) : (
                                                  <FiImage
                                                    size={22}
                                                  />
                                                )}
                                              </div>

                                              <div className="min-w-0 flex-1">
                                                <div
                                                  className="
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    gap-2
                                                  "
                                                >
                                                  <h5
                                                    className="
                                                      text-sm
                                                      font-bold
                                                      text-slate-900
                                                    "
                                                  >
                                                    {getProductName(
                                                      item
                                                    )}
                                                  </h5>

                                                  <span
                                                    className="
                                                      rounded-full
                                                      bg-slate-100
                                                      px-2
                                                      py-1
                                                      text-[9px]
                                                      font-semibold
                                                      text-slate-500
                                                    "
                                                  >
                                                    {
                                                      checklist
                                                    }
                                                  </span>
                                                </div>

                                                <div
                                                  className="
                                                    mt-2
                                                    flex
                                                    flex-wrap
                                                    gap-x-4
                                                    gap-y-1
                                                  "
                                                >
                                                  {getProductMarka(
                                                    item
                                                  ) && (
                                                    <span className="text-[10px] text-slate-500">
                                                      <strong className="text-slate-700">
                                                        Marka:
                                                      </strong>{" "}
                                                      {getProductMarka(
                                                        item
                                                      )}
                                                    </span>
                                                  )}

                                                  {getProductCategory(
                                                    item
                                                  ) && (
                                                    <span className="text-[10px] text-slate-500">
                                                      <strong className="text-slate-700">
                                                        Category:
                                                      </strong>{" "}
                                                      {getProductCategory(
                                                        item
                                                      )}
                                                    </span>
                                                  )}

                                                  <span className="text-[10px] text-slate-500">
                                                    <strong className="text-slate-700">
                                                      Quantity:
                                                    </strong>{" "}
                                                    {getQuantity(
                                                      item
                                                    )}
                                                  </span>
                                                </div>

                                                {/* Progress */}

                                                <div className="mt-4">
                                                  <div className="flex items-center justify-between">
                                                    <span
                                                      className="
                                                        text-[10px]
                                                        font-semibold
                                                        text-slate-500
                                                      "
                                                    >
                                                      Production
                                                      progress
                                                    </span>

                                                    <span
                                                      className="
                                                        text-[10px]
                                                        font-bold
                                                        text-slate-700
                                                      "
                                                    >
                                                      {
                                                        itemProgress
                                                      }
                                                      %
                                                    </span>
                                                  </div>

                                                  <div
                                                    className="
                                                      mt-1.5
                                                      h-1.5
                                                      overflow-hidden
                                                      rounded-full
                                                      bg-slate-100
                                                    "
                                                  >
                                                    <div
                                                      className="
                                                        h-full
                                                        rounded-full
                                                        bg-[#172B6B]
                                                      "
                                                      style={{
                                                        width: `${itemProgress}%`,
                                                      }}
                                                    />
                                                  </div>

                                                  <div
                                                    className="
                                                      mt-1.5
                                                      flex
                                                      justify-between
                                                      text-[9px]
                                                      text-slate-400
                                                    "
                                                  >
                                                    <span>
                                                      Done{" "}
                                                      <strong className="text-slate-600">
                                                        {
                                                          getActualQuantity(
                                                            item
                                                          )
                                                        }
                                                      </strong>
                                                    </span>

                                                    <span>
                                                      Remaining{" "}
                                                      <strong className="text-slate-600">
                                                        {
                                                          remaining
                                                        }
                                                      </strong>
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Production Notes */}

                                            {(item
                                              ?.importantNotes ||
                                              item
                                                ?.checklist
                                                ?.reason ||
                                              item?.remarks) && (
                                              <div
                                                className="
                                                  mt-4
                                                  grid
                                                  gap-2
                                                  sm:grid-cols-3
                                                "
                                              >
                                                {item?.importantNotes && (
                                                  <div
                                                    className="
                                                      rounded-xl
                                                      border
                                                      border-amber-100
                                                      bg-amber-50
                                                      p-3
                                                    "
                                                  >
                                                    <div className="flex items-center gap-1.5">
                                                      <FiAlertCircle
                                                        size={12}
                                                        className="text-amber-600"
                                                      />

                                                      <p
                                                        className="
                                                          text-[9px]
                                                          font-bold
                                                          uppercase
                                                          tracking-wider
                                                          text-amber-700
                                                        "
                                                      >
                                                        Important
                                                        Notes
                                                      </p>
                                                    </div>

                                                    <p
                                                      className="
                                                        mt-1.5
                                                        text-[10px]
                                                        leading-4
                                                        text-amber-800
                                                      "
                                                    >
                                                      {
                                                        item.importantNotes
                                                      }
                                                    </p>
                                                  </div>
                                                )}

                                                {item?.checklist
                                                  ?.reason && (
                                                  <div
                                                    className="
                                                      rounded-xl
                                                      border
                                                      border-red-100
                                                      bg-red-50
                                                      p-3
                                                    "
                                                  >
                                                    <div className="flex items-center gap-1.5">
                                                      <FiAlertCircle
                                                        size={12}
                                                        className="text-red-600"
                                                      />

                                                      <p
                                                        className="
                                                          text-[9px]
                                                          font-bold
                                                          uppercase
                                                          tracking-wider
                                                          text-red-700
                                                        "
                                                      >
                                                        Pending
                                                        Reason
                                                      </p>
                                                    </div>

                                                    <p
                                                      className="
                                                        mt-1.5
                                                        text-[10px]
                                                        leading-4
                                                        text-red-800
                                                      "
                                                    >
                                                      {
                                                        item
                                                          .checklist
                                                          .reason
                                                      }
                                                    </p>
                                                  </div>
                                                )}

                                                {item?.remarks && (
                                                  <div
                                                    className="
                                                      rounded-xl
                                                      border
                                                      border-slate-200
                                                      bg-slate-50
                                                      p-3
                                                    "
                                                  >
                                                    <div className="flex items-center gap-1.5">
                                                      <FiFileText
                                                        size={12}
                                                        className="text-slate-500"
                                                      />

                                                      <p
                                                        className="
                                                          text-[9px]
                                                          font-bold
                                                          uppercase
                                                          tracking-wider
                                                          text-slate-500
                                                        "
                                                      >
                                                        Production
                                                        Remarks
                                                      </p>
                                                    </div>

                                                    <p
                                                      className="
                                                        mt-1.5
                                                        text-[10px]
                                                        leading-4
                                                        text-slate-600
                                                      "
                                                    >
                                                      {
                                                        item.remarks
                                                      }
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }
                                    )
                                  ) : (
                                    <div className="p-5 text-center text-xs text-slate-400">
                                      No product details
                                      available.
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Order Notes */}

                              {order?.notes && (
                                <div
                                  className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-4
                                  "
                                >
                                  <div className="flex items-center gap-2">
                                    <FiFileText
                                      size={14}
                                      className="text-slate-500"
                                    />

                                    <h4
                                      className="
                                        text-xs
                                        font-bold
                                        text-slate-800
                                      "
                                    >
                                      Order Notes
                                    </h4>
                                  </div>

                                  <p
                                    className="
                                      mt-2
                                      text-xs
                                      leading-5
                                      text-slate-600
                                    "
                                  >
                                    {order.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Right: Timeline */}

                            <div>
                              <div className="flex items-center gap-2">
                                <FiRefreshCw
                                  size={15}
                                  className="text-[#172B6B]"
                                />

                                <h3
                                  className="
                                    text-sm
                                    font-bold
                                    text-slate-900
                                  "
                                >
                                  Production Timeline
                                </h3>

                                <span
                                  className="
                                    rounded-full
                                    border
                                    border-slate-200
                                    bg-white
                                    px-2 py-0.5
                                    text-[9px]
                                    font-semibold
                                    text-slate-400
                                  "
                                >
                                  Read Only
                                </span>
                              </div>

                              <p
                                className="
                                  mt-1
                                  text-[11px]
                                  text-slate-400
                                "
                              >
                                Live execution tracking
                                provided by Production.
                                CRM cannot modify this
                                information.
                              </p>

                              <div
                                className="
                                  mt-5
                                  rounded-2xl
                                  border
                                  border-slate-200
                                  bg-white
                                  p-5
                                "
                              >
                                <div className="relative">
                                  {getTimeline(
                                    order
                                  ).map(
                                    (
                                      event,
                                      index,
                                      array
                                    ) => {
                                      const Icon =
                                        event.icon;

                                      return (
                                        <div
                                          key={`${event.title}-${index}`}
                                          className="
                                            relative
                                            flex gap-4
                                          "
                                        >
                                          {index <
                                            array.length -
                                              1 && (
                                            <div
                                              className={`
                                                absolute
                                                left-[15px]
                                                top-8
                                                h-[calc(100%-4px)]
                                                w-px
                                                ${
                                                  event.state ===
                                                  "done"
                                                    ? "bg-[#172B6B]/30"
                                                    : "bg-slate-200"
                                                }
                                              `}
                                            />
                                          )}

                                          <div
                                            className={`
                                              relative
                                              z-10
                                              flex
                                              h-8 w-8
                                              shrink-0
                                              items-center
                                              justify-center
                                              rounded-full
                                              border
                                              ${
                                                event.state ===
                                                "done"
                                                  ? "border-[#172B6B]/20 bg-[#172B6B]/10 text-[#172B6B]"
                                                  : event.state ===
                                                    "current"
                                                  ? "border-amber-200 bg-amber-50 text-amber-600"
                                                  : "border-slate-200 bg-slate-50 text-slate-300"
                                              }
                                            `}
                                          >
                                            {event.state ===
                                            "done" ? (
                                              <FiCheck
                                                size={13}
                                              />
                                            ) : (
                                              <Icon
                                                size={13}
                                              />
                                            )}
                                          </div>

                                          <div
                                            className={`
                                              min-w-0
                                              flex-1
                                              ${
                                                index <
                                                array.length -
                                                  1
                                                  ? "pb-7"
                                                  : ""
                                              }
                                            `}
                                          >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                              <h4
                                                className={`
                                                  text-xs
                                                  font-bold
                                                  ${
                                                    event.state ===
                                                    "pending"
                                                      ? "text-slate-400"
                                                      : "text-slate-800"
                                                  }
                                                `}
                                              >
                                                {
                                                  event.title
                                                }
                                              </h4>

                                              {event.date && (
                                                <span
                                                  className="
                                                    text-[9px]
                                                    text-slate-400
                                                  "
                                                >
                                                  {formatDateTime(
                                                    event.date
                                                  )}
                                                </span>
                                              )}
                                            </div>

                                            <p
                                              className="
                                                mt-1
                                                text-[10px]
                                                leading-4
                                                text-slate-500
                                              "
                                            >
                                              {
                                                event.description
                                              }
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>

                              {/* Overall Progress */}

                              <div
                                className="
                                  mt-4
                                  rounded-2xl
                                  border
                                  border-slate-200
                                  bg-white
                                  p-5
                                "
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p
                                      className="
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-400
                                      "
                                    >
                                      Overall Production
                                    </p>

                                    <p
                                      className="
                                        mt-1
                                        text-lg
                                        font-bold
                                        text-slate-900
                                      "
                                    >
                                      {
                                        progress.percentage
                                      }
                                      %
                                    </p>
                                  </div>

                                  <div
                                    className="
                                      flex
                                      items-center
                                      gap-4
                                      text-right
                                    "
                                  >
                                    <div>
                                      <p
                                        className="
                                          text-[9px]
                                          text-slate-400
                                        "
                                      >
                                        Completed
                                      </p>

                                      <p
                                        className="
                                          mt-0.5
                                          text-sm
                                          font-bold
                                          text-emerald-600
                                        "
                                      >
                                        {
                                          progress.completed
                                        }
                                      </p>
                                    </div>

                                    <div>
                                      <p
                                        className="
                                          text-[9px]
                                          text-slate-400
                                        "
                                      >
                                        Remaining
                                      </p>

                                      <p
                                        className="
                                          mt-0.5
                                          text-sm
                                          font-bold
                                          text-amber-600
                                        "
                                      >
                                        {
                                          progress.remaining
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div
                                  className="
                                    mt-4 h-2
                                    overflow-hidden
                                    rounded-full
                                    bg-slate-100
                                  "
                                >
                                  <div
                                    className="
                                      h-full
                                      rounded-full
                                      bg-[#172B6B]
                                      transition-all
                                    "
                                    style={{
                                      width: `${progress.percentage}%`,
                                    }}
                                  />
                                </div>

                                <div
                                  className="
                                    mt-2
                                    flex
                                    items-center
                                    justify-between
                                  "
                                >
                                  <span
                                    className="
                                      text-[9px]
                                      text-slate-400
                                    "
                                  >
                                    {progress.completed}{" "}
                                    completed
                                  </span>

                                  <span
                                    className="
                                      text-[9px]
                                      text-slate-400
                                    "
                                  >
                                    {progress.total}{" "}
                                    total
                                  </span>
                                </div>
                              </div>

                              {/* CRM Permission Notice */}

                              <div
                                className="
                                  mt-4
                                  flex items-start gap-3
                                  rounded-2xl
                                  border
                                  border-blue-100
                                  bg-blue-50/60
                                  p-4
                                "
                              >
                                <div
                                  className="
                                    mt-0.5
                                    flex h-7 w-7
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-white
                                    text-blue-600
                                    shadow-sm
                                  "
                                >
                                  <FiCheckCircle
                                    size={14}
                                  />
                                </div>

                                <div>
                                  <p
                                    className="
                                      text-[10px]
                                      font-bold
                                      text-blue-800
                                    "
                                  >
                                    Production tracking
                                    is read-only
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-[10px]
                                      leading-4
                                      text-blue-700
                                    "
                                  >
                                    CRM can view the
                                    current production
                                    progress and use it
                                    for customer
                                    communication.
                                    Production staff are
                                    responsible for
                                    updating execution
                                    details.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}

      {orders.length > 0 && (
        <div
          className="
            flex flex-col gap-2
            border-t border-slate-100
            bg-slate-50/50
            px-5 py-3
            sm:flex-row
            sm:items-center
            sm:justify-between
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
              ? "production order"
              : "production orders"}
          </p>

          <div
            className="
              flex items-center gap-4
              text-[10px]
            "
          >
            <span className="text-slate-400">
              Total Qty{" "}
              <strong className="text-slate-700">
                {summary.totalQuantity}
              </strong>
            </span>

            <span className="text-emerald-500">
              Done{" "}
              <strong>
                {summary.completedQuantity}
              </strong>
            </span>

            <span className="text-amber-500">
              Remaining{" "}
              <strong>
                {summary.remainingQuantity}
              </strong>
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default OrdersTable;