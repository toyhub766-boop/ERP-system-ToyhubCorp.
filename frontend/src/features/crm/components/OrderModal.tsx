import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiPackage,
  FiX,
} from "react-icons/fi";

import {
  createOrder,
  updateOrder,
} from "../services/order.service";

interface Props {
  open: boolean;
  customer: any;
  order?: any;
  onClose: () => void;
  onSuccess: () => void;
}

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "In Production"
  | "Dispatched"
  | "Delivered"
  | "Cancelled";

const statusOptions: {
  value: OrderStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "Pending",
    label: "Pending",
    description: "Awaiting confirmation",
  },
  {
    value: "Confirmed",
    label: "Confirmed",
    description: "Order confirmed",
  },
  {
    value: "In Production",
    label: "In Production",
    description: "Currently being produced",
  },
  {
    value: "Dispatched",
    label: "Dispatched",
    description: "Sent for delivery",
  },
  {
    value: "Delivered",
    label: "Delivered",
    description: "Successfully delivered",
  },
  {
    value: "Cancelled",
    label: "Cancelled",
    description: "Order cancelled",
  },
];

const getStatusStyles = (status: OrderStatus) => {
  switch (status) {
    case "Confirmed":
      return {
        dot: "bg-blue-500",
        active:
          "border-blue-200 bg-blue-50 text-blue-800 ring-2 ring-blue-100",
      };

    case "In Production":
      return {
        dot: "bg-violet-500",
        active:
          "border-violet-200 bg-violet-50 text-violet-800 ring-2 ring-violet-100",
      };

    case "Dispatched":
      return {
        dot: "bg-indigo-500",
        active:
          "border-indigo-200 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-100",
      };

    case "Delivered":
      return {
        dot: "bg-emerald-500",
        active:
          "border-emerald-200 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100",
      };

    case "Cancelled":
      return {
        dot: "bg-red-500",
        active:
          "border-red-200 bg-red-50 text-red-800 ring-2 ring-red-100",
      };

    default:
      return {
        dot: "bg-amber-500",
        active:
          "border-amber-200 bg-amber-50 text-amber-800 ring-2 ring-amber-100",
      };
  }
};

const formatAmount = (value: any) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  return Number(value).toLocaleString("en-IN");
};

const OrderModal = ({
  open,
  customer,
  order,
  onClose,
  onSuccess,
}: Props) => {
  const [form, setForm] = useState<{
    totalAmount: string | number;
    dueDate: string;
    status: OrderStatus;
  }>({
    totalAmount: order?.totalAmount || "",
    dueDate: order?.dueDate?.substring(0, 10) || "",
    status: order?.status || "Pending",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Reset form whenever the modal/order changes
   */
  useEffect(() => {
    if (!open) return;

    setForm({
      totalAmount: order?.totalAmount || "",
      dueDate: order?.dueDate?.substring(0, 10) || "",
      status: order?.status || "Pending",
    });

    setError("");
  }, [open, order]);

  /*
   * Escape key
   */
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const amount = Number(form.totalAmount);

    if (!form.totalAmount || Number.isNaN(amount)) {
      setError("Please enter a valid order amount.");
      return;
    }

    if (amount <= 0) {
      setError("Order amount must be greater than ₹0.");
      return;
    }

    if (!form.dueDate) {
      setError("Please select a due date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        ...form,
        totalAmount: amount,
        customer: customer._id,
      };

      if (order?._id) {
        await updateOrder(
          order._id,
          payload
        );
      } else {
        await createOrder(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        "Unable to save the order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedStatus = statusOptions.find(
    (item) => item.value === form.status
  );

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/60
        p-3
        backdrop-blur-sm
        sm:p-5
        animate-in
        fade-in
        duration-200
      "
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-[24px]
          border
          border-slate-200
          bg-white
          shadow-[0_24px_80px_rgba(15,23,42,0.22)]
          animate-in
          zoom-in-95
          duration-200
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            relative
            shrink-0
            border-b
            border-slate-100
            bg-white
            px-5
            py-5
            sm:px-6
          "
        >
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
                bg-[#172B6B]
                text-white
                shadow-sm
              "
            >
              <FiPackage size={20} />
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex items-center gap-2">

                <h2
                  id="order-modal-title"
                  className="
                    text-lg
                    font-bold
                    tracking-tight
                    text-slate-900
                    sm:text-xl
                  "
                >
                  {order
                    ? "Edit Order"
                    : "Create New Order"}
                </h2>

                {order && (
                  <span
                    className="
                      hidden
                      rounded-md
                      bg-slate-100
                      px-2
                      py-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                      sm:inline-flex
                    "
                  >
                    Edit
                  </span>
                )}

              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                {order
                  ? "Update the order details and current status."
                  : "Create a new order for this customer."}
              </p>

            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Close modal"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FiX size={19} />
            </button>

          </div>

          {/* Customer context */}

          {customer && (
            <div
              className="
                mt-5
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-100
                bg-slate-50
                px-3
                py-2.5
              "
            >

              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#172B6B]/10
                  text-xs
                  font-bold
                  text-[#172B6B]
                "
              >
                {customer.companyName
                  ?.charAt(0)
                  ?.toUpperCase() || "C"}
              </div>

              <div className="min-w-0">

                <p className="truncate text-xs font-bold text-slate-800">
                  {customer.companyName ||
                    "Customer"}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                  {customer.customerCode
                    ? `Customer ${customer.customerCode}`
                    : "Selected customer"}
                </p>

              </div>

              {customer.status && (
                <span
                  className={`
                    ml-auto
                    hidden
                    rounded-full
                    px-2
                    py-1
                    text-[10px]
                    font-bold
                    sm:inline-flex
                    ${
                      customer.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }
                  `}
                >
                  {customer.status}
                </span>
              )}

            </div>
          )}

        </div>


        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >

          <div className="flex-1 overflow-y-auto">

            <div className="space-y-7 p-5 sm:p-6">

              {/* ------------------------------------------
                  ORDER DETAILS
              ------------------------------------------ */}

              <div>

                <div className="mb-4">

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-[#172B6B]
                    "
                  >
                    Order Details
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Set the commercial and delivery details for this order.
                  </p>

                </div>


                <div className="grid gap-5 sm:grid-cols-2">

                  {/* Amount */}

                  <div>

                    <label
                      htmlFor="totalAmount"
                      className="
                        mb-2
                        flex
                        items-center
                        gap-2
                        text-xs
                        font-bold
                        text-slate-700
                      "
                    >
                      <FiDollarSign
                        size={14}
                        className="text-slate-400"
                      />

                      Total Amount

                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">

                      <span
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          -translate-y-1/2
                          text-sm
                          font-semibold
                          text-slate-400
                        "
                      >
                        ₹
                      </span>

                      <input
                        id="totalAmount"
                        name="totalAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={form.totalAmount}
                        onChange={handleChange}
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          pl-8
                          pr-4
                          text-sm
                          font-semibold
                          text-slate-800
                          outline-none
                          transition
                          placeholder:text-slate-400
                          hover:border-slate-300
                          focus:border-[#172B6B]
                          focus:bg-white
                          focus:ring-4
                          focus:ring-blue-50
                        "
                      />

                    </div>

                    {form.totalAmount && (
                      <p className="mt-1.5 text-[10px] text-slate-400">
                        ₹{formatAmount(form.totalAmount)}
                      </p>
                    )}

                  </div>


                  {/* Due date */}

                  <div>

                    <label
                      htmlFor="dueDate"
                      className="
                        mb-2
                        flex
                        items-center
                        gap-2
                        text-xs
                        font-bold
                        text-slate-700
                      "
                    >
                      <FiCalendar
                        size={14}
                        className="text-slate-400"
                      />

                      Due Date

                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      value={form.dueDate}
                      onChange={handleChange}
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-3.5
                        text-sm
                        font-medium
                        text-slate-700
                        outline-none
                        transition
                        hover:border-slate-300
                        focus:border-[#172B6B]
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-50
                      "
                    />

                  </div>

                </div>

              </div>


              {/* ------------------------------------------
                  STATUS
              ------------------------------------------ */}

              <div>

                <div className="mb-4">

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-[#172B6B]
                    "
                  >
                    Order Status
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Select the current stage of this order.
                  </p>

                </div>


                <div className="grid gap-2 sm:grid-cols-2">

                  {statusOptions.map(
                    (option) => {
                      const selected =
                        form.status ===
                        option.value;

                      const styles =
                        getStatusStyles(
                          option.value
                        );

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setForm(
                              (prev) => ({
                                ...prev,
                                status:
                                  option.value,
                              })
                            )
                          }
                          className={`
                            group
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            border
                            px-3.5
                            py-3
                            text-left
                            transition-all
                            duration-150
                            ${
                              selected
                                ? styles.active
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }
                          `}
                        >

                          <span
                            className={`
                              h-2.5
                              w-2.5
                              shrink-0
                              rounded-full
                              ${styles.dot}
                            `}
                          />

                          <span className="min-w-0 flex-1">

                            <span
                              className={`
                                block
                                text-xs
                                font-bold
                                ${
                                  selected
                                    ? ""
                                    : "text-slate-700"
                                }
                              `}
                            >
                              {option.label}
                            </span>

                            <span
                              className="
                                mt-0.5
                                block
                                truncate
                                text-[10px]
                                text-slate-400
                              "
                            >
                              {option.description}
                            </span>

                          </span>

                          {selected && (
                            <FiCheckCircle
                              size={16}
                              className="shrink-0"
                            />
                          )}

                        </button>
                      );
                    }
                  )}

                </div>


                {/* Current status summary */}

                {selectedStatus && (
                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-slate-50
                      px-3
                      py-2.5
                    "
                  >
                    <FiClock
                      size={13}
                      className="text-slate-400"
                    />

                    <p className="text-[11px] text-slate-500">
                      Current status:
                      {" "}
                      <span className="font-bold text-slate-700">
                        {selectedStatus.label}
                      </span>
                    </p>
                  </div>
                )}

              </div>


              {/* Error */}

              {error && (
                <div
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-red-100
                    bg-red-50
                    px-4
                    py-3
                  "
                >

                  <FiX
                    size={16}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <p className="text-xs font-medium leading-5 text-red-700">
                    {error}
                  </p>

                </div>
              )}

            </div>

          </div>


          {/* ==================================================
              FOOTER
          ================================================== */}

          <div
            className="
              shrink-0
              border-t
              border-slate-100
              bg-slate-50/80
              px-5
              py-4
              sm:px-6
            "
          >

            <div
              className="
                flex
                flex-col-reverse
                gap-2
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <p className="hidden text-[10px] text-slate-400 sm:block">
                Press Esc to close
              </p>

              <div className="flex w-full gap-2 sm:w-auto">

                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="
                    h-11
                    flex-1
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    text-xs
                    font-bold
                    text-slate-700
                    transition
                    hover:bg-slate-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    sm:flex-none
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    inline-flex
                    h-11
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#172B6B]
                    px-6
                    text-xs
                    font-bold
                    text-white
                    shadow-sm
                    transition-all
                    hover:bg-[#20398F]
                    hover:shadow-md
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    sm:flex-none
                  "
                >

                  {loading ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={15} />

                      {order
                        ? "Update Order"
                        : "Create Order"}
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </form>

      </div>
    </div>
  );
};

export default OrderModal;