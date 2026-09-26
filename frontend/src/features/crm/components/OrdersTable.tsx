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
  FiFilter,
  FiImage,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiTruck,
  FiUser,
  FiX,
} from "react-icons/fi";

interface Props {
  orders: any[];
  productionOrders?: any[];
  dispatches?: any[];
  onEdit: (order: any) => void;
  onDelete: (order: any) => void;
  onConfirm?: (order: any) => void;
  onSendToProduction?: (order: any) => void;
  onBulkDelete?: (orders: any[]) => void;
  onRefill?: (
    order: any,
    remainingItems: Array<{
      catalogueProduct: string;
      quantity: number;
    }>,
  ) => void;
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
  const category =
    item?.category ||
    item?.product?.category;

  if (typeof category === "string") {
    return category;
  }

  return category?.name || "";
};

const getQuantity = (item: any) => {
  return Number(item?.quantity || 0);
};

const getActualQuantity = (item: any) => {
  const ordered = getQuantity(item);
  return Math.min(ordered, Math.max(0, Number(item?.actualQuantity || 0)));
};

const getExistingStockQuantity = (item: any) => {
  const ordered = getQuantity(item);
  const actual = getActualQuantity(item);

  return Math.min(
    Math.max(0, ordered - actual),
    Math.max(0, Number(item?.existingStockQuantity || 0))
  );
};

const getAvailableQuantity = (item: any) => {
  const ordered = getQuantity(item);
  const actual = getActualQuantity(item);
  const existingStock = getExistingStockQuantity(item);

  return Math.min(ordered, actual + existingStock);
};

const getReadyQuantity = (item: any) => {
  return Math.min(
    getAvailableQuantity(item),
    Math.max(0, Number(item?.readyForDispatchQuantity || 0))
  );
};

const getCatalogueProductId = (item: any) => {
  const value =
    item?.catalogueProduct?._id ||
    item?.catalogueProduct ||
    item?.product?._id ||
    item?.product;

  return value ? String(value) : "";
};

const getProductionItemId = (item: any) =>
  item?._id ? String(item._id) : "";

const getDispatchedQuantity = (
  productionId: string,
  productionItemId: string,
  dispatches: any[] = [],
) => {
  if (!productionId || !productionItemId) return 0;

  return dispatches
    .filter((dispatch: any) => {
      const dispatchProduction = String(
        dispatch?.production?._id ||
          dispatch?.production ||
          "",
      );

      const dispatchItem = String(
        dispatch?.productionItem?._id ||
          dispatch?.productionItem ||
          "",
      );

      const status = String(
        dispatch?.status || "",
      ).toLowerCase();

      return (
        dispatchProduction === productionId &&
        dispatchItem === productionItemId &&
        ["dispatched", "delivered"].includes(status)
      );
    })
    .reduce(
      (sum: number, dispatch: any) =>
        sum + Math.max(0, Number(dispatch?.quantity || 0)),
      0,
    );
};

const getOrderDispatchSummary = (
  order: any,
  productionOrders: any[] = [],
  dispatches: any[] = [],
) => {
  const products = getTrackingProducts(order, productionOrders);
  const ordered = products.reduce(
    (sum: number, item: any) => sum + getQuantity(item),
    0,
  );

  const productionId = String(
    order?.production?._id ||
      order?.production ||
      getLinkedProduction(order, productionOrders)?._id ||
      "",
  );

  const dispatched = products.reduce(
    (sum: number, item: any) =>
      sum +
      getDispatchedQuantity(
        productionId,
        getProductionItemId(item),
        dispatches,
      ),
    0,
  );

  return {
    ordered,
    dispatched: Math.min(dispatched, ordered),
    remaining: Math.max(0, ordered - dispatched),
  };
};

// const getRefillRemainingQuantity = (
//   order: any,
//   item: any,
//   dispatches: any[] = [],
// ) => {
//   const ordered = getQuantity(item);
//   const productionId = String(
//     getLinkedProduction(order, [])?._id ||
//       order?.production?._id ||
//       order?.production ||
//       "",
//   );

//   const dispatched = getDispatchedQuantity(
//     productionId,
//     getProductionItemId(item),
//     dispatches,
//   );

//   return Math.max(0, ordered - dispatched);
// };

const getRemainingQuantity = (item: any) => {
  return Math.max(getQuantity(item) - getAvailableQuantity(item), 0);
};

const getProgressPercentage = (item: any) => {
  const quantity = getQuantity(item);
  const available = getAvailableQuantity(item);

  if (!quantity) return 0;

  return Math.min(
    Math.round((available / quantity) * 100),
    100
  );
};

const getLinkedProduction = (order: any, productionOrders: any[] = []) => {
  const orderId = String(order?._id || "");
  const productionId = String(
    order?.production?._id || order?.production || ""
  );

  return productionOrders.find((production: any) => {
    const crmOrderId = String(
      production?.crmOrder?._id || production?.crmOrder || ""
    );

    return (orderId && crmOrderId === orderId) ||
      (productionId && String(production?._id || "") === productionId);
  }) || null;
};

const getTrackingProducts = (order: any, productionOrders: any[] = []) => {
  const production = getLinkedProduction(order, productionOrders);

  if (Array.isArray(production?.items) && production.items.length) {
    return production.items;
  }

  return getProducts(order);
};

const getStatusConfig = (status?: string) => {
  const normalized = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");

  if (normalized === "delivered") {
    return {
      label: "Delivered",
      icon: FiCheckCircle,
      dot: "bg-emerald-500",
      badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    };
  }

  if (normalized === "dispatched") {
    return {
      label: "Dispatched",
      icon: FiTruck,
      dot: "bg-emerald-500",
      badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    };
  }

  if (normalized === "partially dispatched") {
    return {
      label: "Partially Dispatched",
      icon: FiTruck,
      dot: "bg-amber-500",
      badge: "border-amber-100 bg-amber-50 text-amber-700",
    };
  }

  if (normalized === "ready for dispatch") {
    return {
      label: "Ready for Dispatch",
      icon: FiTruck,
      dot: "bg-indigo-500",
      badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
    };
  }

  if (normalized === "partially produced") {
    return {
      label: "Partially Produced",
      icon: FiPackage,
      dot: "bg-violet-500",
      badge: "border-violet-100 bg-violet-50 text-violet-700",
    };
  }

  if (normalized === "in production") {
    return {
      label: "In Production",
      icon: FiPackage,
      dot: "bg-violet-500",
      badge: "border-violet-100 bg-violet-50 text-violet-700",
    };
  }

  if (normalized === "confirmed") {
    return {
      label: "Confirmed",
      icon: FiCheck,
      dot: "bg-blue-500",
      badge: "border-blue-100 bg-blue-50 text-blue-700",
    };
  }

  if (normalized === "cancelled") {
    return {
      label: "Cancelled",
      icon: FiX,
      dot: "bg-red-500",
      badge: "border-red-100 bg-red-50 text-red-700",
    };
  }

  return {
    label: status || "Pending",
    icon: FiClock,
    dot: "bg-amber-500",
    badge: "border-amber-100 bg-amber-50 text-amber-700",
  };
};
const getChecklistState = (item: any) => {
  const preparing = Boolean(
    item?.checklist?.preparing
  );

  const leaving = Boolean(
    item?.checklist?.leaving
  );

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

const getOrderProgress = (order: any, productionOrders: any[] = []) => {
  const products = getTrackingProducts(order, productionOrders);

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

  const produced = products.reduce(
    (sum: number, item: any) =>
      sum + getActualQuantity(item),
    0
  );

  const existingStock = products.reduce(
    (sum: number, item: any) =>
      sum + getExistingStockQuantity(item),
    0
  );

  const available = products.reduce(
    (sum: number, item: any) =>
      sum + getAvailableQuantity(item),
    0
  );

  const ready = products.reduce(
    (sum: number, item: any) =>
      sum + getReadyQuantity(item),
    0
  );

  const remaining = Math.max(total - available, 0);

  const percentage = total
    ? Math.min(Math.round((available / total) * 100), 100)
    : 0;

  return {
    produced,
    existingStock,
    available,
    ready,
    total,
    remaining,
    percentage,
  };
};

const getTimeline = (order: any, productionOrders: any[] = []) => {
  const timeline: Array<{
    title: string;
    description: string;
    date?: string;
    icon: any;
    state:
      | "done"
      | "current"
      | "pending";
  }> = [];

  timeline.push({
    title: "Order Created",
    description:
      "Production order was created from CRM.",
    date: order?.createdAt,
    icon: FiFileText,
    state: "done",
  });

  const status = String(
    order?.status || ""
  )
    .toLowerCase()
    .replace(/_/g, " ");

  const products = getTrackingProducts(order, productionOrders);

  const hasPreparing = products.some(
    (item: any) =>
      Boolean(
        item?.checklist?.preparing
      )
  );

  const hasLeaving = products.some(
    (item: any) =>
      Boolean(
        item?.checklist?.leaving
      )
  );

  const hasActualQuantity = products.some(
    (item: any) =>
      getActualQuantity(item) > 0
  );

  const isCompleted = products.length
    ? products.every(
        (item: any) =>
          getAvailableQuantity(item) >= getQuantity(item)
      )
    : ["dispatched", "delivered"].some((value) =>
        status.includes(value)
      );

  const isReadyForDispatch =
    Boolean(order?.readyForDispatch) ||
    products.some(
      (item: any) =>
        getReadyQuantity(item) > 0
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
    title: "Order Fulfilment Complete",
    description: isCompleted
      ? "The full ordered quantity is now available through production and/or existing stock."
      : "Some quantity is still outstanding on this order.",
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
  productionOrders = [],
  dispatches = [],
  onEdit,
  onDelete,
  onConfirm,
  onSendToProduction,
  onBulkDelete,
  onRefill,
}: Props) => {
  const [expandedOrder, setExpandedOrder] =
    useState<string | null>(null);

  const [selectedOrderIds, setSelectedOrderIds] =
    useState<string[]>([]);

  const [showFilters, setShowFilters] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [clientFilter, setClientFilter] =
    useState("all");

  const clients = useMemo(() => {
    const names = orders
      .map((order) =>
        getClientName(order)
      )
      .filter(Boolean);

    return Array.from(
      new Set(names)
    ).sort();
  }, [orders, productionOrders]);

  const filteredOrders = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const client = getClientName(
        order
      ).toLowerCase();

      const orderNumber = String(
        order?.orderNumber || ""
      ).toLowerCase();

      const normalizedStatus =
        String(
          order?.status || ""
        )
          .toLowerCase()
          .replace(/_/g, " ");

      const matchesSearch =
        !query ||
        orderNumber.includes(query) ||
        client.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        normalizedStatus ===
          statusFilter;

      const matchesClient =
        clientFilter === "all" ||
        client === clientFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesClient
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    clientFilter,
  ]);

  const summary = useMemo(() => {
    let totalQuantity = 0;
    let completedQuantity = 0;
    let remainingQuantity = 0;

    orders.forEach((order) => {
      const progress =
        getOrderProgress(order, productionOrders);

      totalQuantity += progress.total;
      completedQuantity +=
        progress.available;
      remainingQuantity +=
        progress.remaining;
    });

    return {
      totalOrders: orders.length,

      activeOrders: orders.filter(
        (order) => {
          const normalized =
            String(
              order?.status || ""
            ).toLowerCase();

          return (
            !normalized.includes(
              "complete"
            ) &&
            !normalized.includes(
              "cancel"
            )
          );
        }
      ).length,

      completedOrders:
        orders.filter((order) => {
          const products =
            getProducts(order);

          if (products.length) {
            return products.every(
              (item: any) =>
                Boolean(
                  item?.completed
                )
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
  }, [orders, productionOrders]);

  const toggleOrder = (id: string) => {
    setExpandedOrder(
      (current) =>
        current === id
          ? null
          : id
    );
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setClientFilter("all");
  };

  const hasActiveFilters =
    Boolean(search) ||
    statusFilter !== "all" ||
    clientFilter !== "all";

  const getOrderRefillItems = (order: any) => {
    const products = getTrackingProducts(
      order,
      productionOrders,
    );

    const productionId = String(
      order?.production?._id ||
        order?.production ||
        getLinkedProduction(order, productionOrders)?._id ||
        "",
    );

    if (!productionId) return [];

    const childRefills = orders.filter(
      (candidate: any) =>
        String(
          candidate?.refillOf?._id ||
            candidate?.refillOf ||
            "",
        ) === String(order?._id || ""),
    );

    const refillCreatedByProduct = new Map<string, number>();

    childRefills.forEach((child: any) => {
      (child?.items || []).forEach((childItem: any) => {
        const catalogueId = String(
          childItem?.catalogueProduct?._id ||
            childItem?.catalogueProduct ||
            "",
        );

        if (!catalogueId) return;

        refillCreatedByProduct.set(
          catalogueId,
          (refillCreatedByProduct.get(catalogueId) || 0) +
            Math.max(0, Number(childItem?.quantity || 0)),
        );
      });
    });

    const refillItems = products
      .map((item: any) => {
        const catalogueProduct = getCatalogueProductId(item);
        const ordered = getQuantity(item);
        const dispatched = getDispatchedQuantity(
          productionId,
          getProductionItemId(item),
          dispatches,
        );
        const alreadyRefilled =
          refillCreatedByProduct.get(catalogueProduct) || 0;

        return {
          catalogueProduct,
          quantity: Math.max(
            0,
            ordered - dispatched - alreadyRefilled,
          ),
        };
      })
      .filter(
        (item: { catalogueProduct: string; quantity: number }) =>
          Boolean(item.catalogueProduct) && item.quantity > 0,
      );

    // A refill is offered only when there is an actual dispatched quantity
    // and an outstanding quantity that has not already been allocated to a
    // child/refill order.
    const totalDispatched = products.reduce(
      (sum: number, item: any) =>
        sum +
        getDispatchedQuantity(
          productionId,
          getProductionItemId(item),
          dispatches,
        ),
      0,
    );

    if (totalDispatched <= 0 || !refillItems.length) return [];

    return refillItems;
  };

  const selectedOrders = filteredOrders.filter((order) =>
    selectedOrderIds.includes(String(order?._id))
  );

  const allFilteredSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((order) =>
      selectedOrderIds.includes(String(order?._id))
    );

  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedOrderIds((current) =>
        current.filter(
          (id) => !filteredOrders.some((order) => String(order?._id) === id)
        )
      );
      return;
    }

    setSelectedOrderIds((current) =>
      Array.from(
        new Set([
          ...current,
          ...filteredOrders.map((order) => String(order?._id)),
        ])
      )
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedOrders.length || !onBulkDelete) return;

    const confirmed = window.confirm(
      `Delete ${selectedOrders.length} selected order${selectedOrders.length === 1 ? "" : "s"}? This cannot be undone.`
    );

    if (!confirmed) return;

    await onBulkDelete(selectedOrders);
    setSelectedOrderIds([]);
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

          <div
            className="
              flex flex-wrap
              items-center
              gap-2
            "
          >
            <div
              className="
                grid grid-cols-2
                gap-2
                sm:grid-cols-4
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

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (current) =>
                    !current
                )
              }
              className={`
                inline-flex h-10
                items-center gap-2
                rounded-xl border
                px-3
                text-xs font-semibold
                transition
                ${
                  showFilters
                    ? "border-[#172B6B]/20 bg-[#172B6B]/5 text-[#172B6B]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              <FiFilter size={14} />

              Filters

              {hasActiveFilters && (
                <span
                  className="
                    flex h-4 min-w-4
                    items-center justify-center
                    rounded-full
                    bg-[#172B6B]
                    px-1
                    text-[9px]
                    text-white
                  "
                >
                  !
                </span>
              )}

              {showFilters ? (
                <FiChevronUp size={13} />
              ) : (
                <FiChevronDown size={13} />
              )}
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div
          className="
            border-b border-slate-100
            bg-slate-50/60
            px-5 py-4
            sm:px-6
          "
        >
          <div
            className="
              flex flex-col gap-3
              lg:flex-row
              lg:items-end
            "
          >
            <div className="min-w-0 flex-1">
              <label
                className="
                  mb-1.5 block
                  text-[10px] font-bold
                  uppercase tracking-wider
                  text-slate-400
                "
              >
                Search
              </label>

              <div className="relative">
                <FiSearch
                  size={14}
                  className="
                    absolute left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Order number or customer..."
                  className="
                    h-10 w-full
                    rounded-xl
                    border border-slate-200
                    bg-white
                    pl-9 pr-3
                    text-xs
                    outline-none
                    transition
                    focus:border-[#172B6B]/30
                    focus:ring-2
                    focus:ring-[#172B6B]/5
                  "
                />
              </div>
            </div>

            <div className="w-full lg:w-48">
              <label
                className="
                  mb-1.5 block
                  text-[10px] font-bold
                  uppercase tracking-wider
                  text-slate-400
                "
              >
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="
                  h-10 w-full
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-3
                  text-xs
                  outline-none
                "
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="in production">
                  In Production
                </option>

                <option value="partially produced">
                  Partially Produced
                </option>

                <option value="ready for dispatch">
                  Ready for Dispatch
                </option>

                <option value="partially dispatched">
                  Partially Dispatched
                </option>

                <option value="dispatched">
                  Dispatched
                </option>

                <option value="delivered">
                  Delivered
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            <div className="w-full lg:w-52">
              <label
                className="
                  mb-1.5 block
                  text-[10px] font-bold
                  uppercase tracking-wider
                  text-slate-400
                "
              >
                Customer
              </label>

              <select
                value={clientFilter}
                onChange={(e) =>
                  setClientFilter(
                    e.target.value
                  )
                }
                className="
                  h-10 w-full
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-3
                  text-xs
                  outline-none
                "
              >
                <option value="all">
                  All Customers
                </option>

                {clients.map(
                  (client) => (
                    <option
                      key={client}
                      value={client}
                    >
                      {client}
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="
                inline-flex h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                border border-slate-200
                bg-white
                px-3
                text-xs font-semibold
                text-slate-500
                hover:bg-slate-50
              "
            >
              <FiX size={13} />
              Clear
            </button>
          </div>
        </div>
      )}

      {selectedOrders.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-[#172B6B]/[0.035] px-5 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#172B6B] px-2.5 py-1 text-[10px] font-bold text-white">
              {selectedOrders.length} selected
            </span>
            <span className="text-xs text-slate-500">
              Select orders to perform a bulk action.
            </span>
          </div>

          {onBulkDelete && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 transition hover:bg-red-100"
            >
              <FiTrash2 size={13} />
              Delete Selected
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[1303px] w-full table-fixed">
          <colgroup>
            <col style={{ width: "48px" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "165px" }} />
            <col style={{ width: "180px" }} />
            <col style={{ width: "170px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "330px" }} />
          </colgroup>
          <thead>
            <tr
              className="
                border-b border-slate-100
                bg-slate-50/70
              "
            >
              <th className="w-12 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all orders"
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#172B6B]"
                />
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
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-20"
                >
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
                      <FiPackage
                        size={27}
                      />
                    </div>

                    <h3
                      className="
                        mt-5 text-base
                        font-bold text-slate-800
                      "
                    >
                      {hasActiveFilters
                        ? "No matching orders"
                        : "No production orders yet"}
                    </h3>

                    <p
                      className="
                        mt-1.5 text-sm
                        leading-5 text-slate-500
                      "
                    >
                      {hasActiveFilters
                        ? "Try changing or clearing your filters."
                        : "Orders created by CRM will appear here with their complete production history."}
                    </p>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={
                          clearFilters
                        }
                        className="
                          mt-4
                          inline-flex
                          items-center
                          gap-2
                          rounded-lg
                          border
                          border-slate-200
                          bg-white
                          px-3 py-2
                          text-xs
                          font-semibold
                          text-slate-600
                        "
                      >
                        <FiX size={13} />
                        Clear Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map(
                (order) => {
                  const orderId =
                    order?._id;

                  const expanded =
                    expandedOrder ===
                    orderId;

                  const products =
                    getTrackingProducts(
                      order,
                      productionOrders
                    );

                  const progress =
                    getOrderProgress(
                      order,
                      productionOrders
                    );

                  const orderProductionId = String(
                    order?.production?._id ||
                      order?.production ||
                      ""
                  );

                  const orderDispatches = dispatches
                    .filter((dispatch: any) => {
                      const dispatchProductionId = String(
                        dispatch?.production?._id ||
                          dispatch?.production ||
                          ""
                      );

                      return (
                        Boolean(orderProductionId) &&
                        dispatchProductionId === orderProductionId
                      );
                    })
                    .sort(
                      (a: any, b: any) =>
                        new Date(
                          b?.dispatchedAt || b?.createdAt || 0
                        ).getTime() -
                        new Date(
                          a?.dispatchedAt || a?.createdAt || 0
                        ).getTime()
                    );

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
                      <td
                        colSpan={8}
                        className="p-0"
                      >
                        <div
                          className="
                            grid
                            grid-cols-[48px_140px_165px_180px_170px_150px_120px_330px]
                            items-center
                            min-w-[1303px]
                            transition
                            hover:bg-slate-50/60
                          "
                        >
                          <div className="flex items-center justify-center gap-2 px-2">
                            <input
                              type="checkbox"
                              checked={selectedOrderIds.includes(String(orderId))}
                              onChange={() => toggleOrderSelection(String(orderId))}
                              aria-label={`Select ${order?.orderNumber || "order"}`}
                              className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#172B6B]"
                            />
                            <button
                              type="button"
                              title={expanded ? "Collapse order" : "View order tracking"}
                              onClick={() => toggleOrder(orderId)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#172B6B]/20 hover:bg-[#172B6B]/5 hover:text-[#172B6B]"
                            >
                              {expanded ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
                            </button>
                          </div>

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
                                <FiUser
                                  size={14}
                                />
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

                                {products.length >
                                  2 && (
                                  <p
                                    className="
                                      text-[10px]
                                      font-semibold
                                      text-[#172B6B]
                                    "
                                  >
                                    +
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

                          <div className="px-4 py-5">
                            {(() => {
                              const dispatchBalance =
                                getOrderDispatchSummary(
                                  order,
                                  productionOrders,
                                  dispatches,
                                );

                              return (
                                <>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-bold text-slate-700">
                                      {progress.available} / {progress.total} available
                                    </span>
                                    <span className="text-[10px] font-semibold text-amber-600">
                                      {dispatchBalance.remaining} remaining to dispatch
                                    </span>
                                  </div>

                                  <div className="mt-1 flex items-center justify-between text-[9px]">
                                    <span className="text-slate-400">
                                      Dispatched <strong className="text-slate-600">{dispatchBalance.dispatched}</strong>
                                    </span>
                                    <span className="text-slate-400">
                                      Ordered <strong className="text-slate-600">{dispatchBalance.ordered}</strong>
                                    </span>
                                  </div>
                                </>
                              );
                            })()}

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

                            <div className="mt-2 grid grid-cols-3 gap-1 text-[9px]">
                              <span className="rounded-md bg-slate-50 px-1.5 py-1 text-slate-500">
                                Produced <strong className="text-slate-700">{progress.produced}</strong>
                              </span>
                              <span className="rounded-md bg-blue-50 px-1.5 py-1 text-blue-600">
                                Stock <strong>{progress.existingStock}</strong>
                              </span>
                              <span className="rounded-md bg-emerald-50 px-1.5 py-1 text-emerald-600">
                                Ready <strong>{progress.ready}</strong>
                              </span>
                            </div>
                          </div>

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

                              {
                                status.label
                              }
                            </span>
                          </div>

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

                          <div
                            className="
                              flex
                              items-center
                              justify-center
                              gap-1.5
                              px-4 py-5
                            "
                          >
                            {String(order?.status || "").toLowerCase() === "pending" && onConfirm && (
                              <button
                                type="button"
                                title="Confirm order"
                                onClick={() => onConfirm(order)}
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[10px] font-bold text-emerald-700 transition hover:bg-emerald-100 hover:text-emerald-800"
                              >
                                <FiCheck size={13} />
                                <span>Confirm</span>
                              </button>
                            )}

                            {String(order?.status || "").toLowerCase() === "confirmed" &&
                              !order?.production &&
                              onSendToProduction && (
                                <button
                                  type="button"
                                  title="Send to Production"
                                  onClick={() => onSendToProduction(order)}
                                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 text-[10px] font-bold text-indigo-700 transition hover:bg-indigo-100 hover:text-indigo-800"
                                >
                                  <FiTruck size={13} />
                                  <span>Send to Production</span>
                                </button>
                              )}

                            {onRefill &&
                              getOrderRefillItems(order).length > 0 && (
                                <button
                                  type="button"
                                  title="Create refill order for remaining balance"
                                  onClick={() =>
                                    onRefill(
                                      order,
                                      getOrderRefillItems(order),
                                    )
                                  }
                                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-[10px] font-bold text-amber-700 transition hover:bg-amber-100 hover:text-amber-800"
                                >
                                  <FiRefreshCw size={13} />
                                  <span>Refill</span>
                                </button>
                              )}

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
                                        {
                                          products.length
                                        }
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
                                                <div
                                                  className="
                                                    flex
                                                    h-20 w-20
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    overflow-hidden
                                                    rounded-xl
                                                    border
                                                    border-slate-200
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
                                                          {getActualQuantity(
                                                            item
                                                          )}
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

                                              {(item?.importantNotes ||
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

                                                  {item
                                                    ?.checklist
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
                                      {
                                        order.notes
                                      }
                                    </p>
                                  </div>
                                )}
                              </div>

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
                                      order,
                                      productionOrders
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
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <FiTruck
                                          size={14}
                                          className="text-[#172B6B]"
                                        />
                                        <h3 className="text-sm font-bold text-slate-900">
                                          Dispatch History
                                        </h3>
                                      </div>
                                      <p className="mt-1 text-[11px] text-slate-400">
                                        Every partial dispatch made against this order.
                                      </p>
                                    </div>

                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-500">
                                      {orderDispatches.length} dispatch{orderDispatches.length === 1 ? "" : "es"}
                                    </span>
                                  </div>

                                  {orderDispatches.length === 0 ? (
                                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-[11px] text-slate-400">
                                      No dispatches recorded yet.
                                    </div>
                                  ) : (
                                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                                      <div className="grid grid-cols-[80px_minmax(110px,1fr)_90px_100px] gap-3 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                        <span>Dispatch</span>
                                        <span>Destination</span>
                                        <span>Quantity</span>
                                        <span>Status</span>
                                      </div>

                                      {orderDispatches.map((dispatch: any, index: number) => (
                                        <div
                                          key={String(dispatch?._id || `${orderId}-dispatch-${index}`)}
                                          className="grid grid-cols-[80px_minmax(110px,1fr)_90px_100px] items-center gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0"
                                        >
                                          <div>
                                            <p className="text-[10px] font-bold text-slate-700">
                                              #{orderDispatches.length - index}
                                            </p>
                                            <p className="mt-0.5 text-[9px] text-slate-400">
                                              {formatDateTime(
                                                dispatch?.dispatchedAt ||
                                                  dispatch?.createdAt
                                              )}
                                            </p>
                                          </div>

                                          <div className="min-w-0">
                                            <p className="truncate text-[10px] font-semibold text-slate-700">
                                              {dispatch?.destination || "—"}
                                            </p>
                                            {dispatch?.vehicleNumber && (
                                              <p className="mt-0.5 text-[9px] text-slate-400">
                                                Vehicle: {dispatch.vehicleNumber}
                                              </p>
                                            )}
                                          </div>

                                          <p className="text-[11px] font-bold text-slate-800">
                                            {Number(dispatch?.quantity || 0).toLocaleString("en-IN")}
                                          </p>

                                          <span className={`w-fit rounded-full border px-2 py-1 text-[9px] font-bold ${
                                            String(dispatch?.status || "Pending").toLowerCase() === "delivered"
                                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                              : String(dispatch?.status || "Pending").toLowerCase() === "dispatched"
                                              ? "border-blue-100 bg-blue-50 text-blue-700"
                                              : "border-amber-100 bg-amber-50 text-amber-700"
                                          }`}>
                                            {dispatch?.status || "Pending"}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

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
                                        <p className="text-[9px] text-slate-400">
                                          Available
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
                                            progress.available
                                          }
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-[9px] text-slate-400">
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

                                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                                      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Ordered</p>
                                      <p className="mt-0.5 text-xs font-bold text-slate-700">{progress.total}</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                                      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Produced</p>
                                      <p className="mt-0.5 text-xs font-bold text-slate-700">{progress.produced}</p>
                                    </div>
                                    <div className="rounded-lg bg-blue-50 px-2.5 py-2">
                                      <p className="text-[8px] font-bold uppercase tracking-wider text-blue-500">Existing Stock</p>
                                      <p className="mt-0.5 text-xs font-bold text-blue-700">{progress.existingStock}</p>
                                    </div>
                                    <div className="rounded-lg bg-amber-50 px-2.5 py-2">
                                      <p className="text-[8px] font-bold uppercase tracking-wider text-amber-600">Remaining</p>
                                      <p className="mt-0.5 text-xs font-bold text-amber-700">{progress.remaining}</p>
                                    </div>
                                  </div>

                                  <div
                                    className="
                                      mt-2
                                      flex
                                      items-center
                                      justify-between
                                    "
                                  >
                                    <span className="text-[9px] text-slate-400">
                                      {
                                        progress.available
                                      }{" "}
                                      available
                                    </span>

                                    <span className="text-[9px] text-slate-400">
                                      {
                                        progress.total
                                      }{" "}
                                      total
                                    </span>
                                  </div>
                                </div>

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
                }
              )
            )}
          </tbody>
        </table>
      </div>

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
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {orders.length}
            </span>{" "}
            production orders
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
              Available{" "}
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