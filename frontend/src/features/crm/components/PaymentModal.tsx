import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiCreditCard,
  FiFileText,
  FiX,
} from "react-icons/fi";

import {
  createPayment,
  updatePayment,
} from "../services/payment.service";

interface Props {
  open: boolean;
  order: any;
  payment?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  {
    value: "Cash",
    label: "Cash",
    description: "Physical cash payment",
  },
  {
    value: "Bank Transfer",
    label: "Bank Transfer",
    description: "Direct bank transfer",
  },
  {
    value: "Cheque",
    label: "Cheque",
    description: "Cheque payment",
  },
  {
    value: "UPI",
    label: "UPI",
    description: "Digital UPI payment",
  },
];

const formatAmount = (value: any) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const PaymentModal = ({
  open,
  order,
  payment,
  onClose,
  onSuccess,
}: Props) => {
  const [form, setForm] = useState({
    amountPaid: "",
    paymentMethod: "Cash",
    remarks: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (payment) {
      setForm({
        amountPaid:
          payment.amountPaid?.toString() || "",
        paymentMethod:
          payment.paymentMethod || "Cash",
        remarks:
          payment.remarks || "",
      });
    } else {
      setForm({
        amountPaid: "",
        paymentMethod: "Cash",
        remarks: "",
      });
    }

    setError("");
    setSubmitting(false);
  }, [payment, open]);

  if (!open) return null;

  const orderAmount = Number(
    order?.totalAmount || 0
  );

  const enteredAmount = Number(
    form.amountPaid || 0
  );

  const remainingAmount = Math.max(
    orderAmount - enteredAmount,
    0
  );

  const isValidAmount =
    enteredAmount > 0 &&
    enteredAmount <= orderAmount;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setError("");

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!order?._id) {
      setError(
        "Please select an order before recording a payment."
      );
      return;
    }

    if (!enteredAmount || enteredAmount <= 0) {
      setError(
        "Please enter a valid payment amount."
      );
      return;
    }

    if (enteredAmount > orderAmount) {
      setError(
        "Payment amount cannot exceed the order value."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        order: order._id,
        amountPaid: enteredAmount,
        paymentMethod: form.paymentMethod,
        remarks: form.remarks.trim(),
      };

      if (payment?._id) {
        await updatePayment(
          payment._id,
          payload
        );
      } else {
        await createPayment(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to save the payment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={
          payment
            ? "Edit payment"
            : "Record payment"
        }
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-xl
          flex-col
          overflow-hidden
          rounded-[28px]
          border
          border-slate-200
          bg-white
          shadow-[0_25px_80px_rgba(15,23,42,0.22)]
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-slate-100
            px-6
            py-5
            sm:px-7
          "
        >
          <div className="flex items-start gap-3.5">

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
              <FiCreditCard size={20} />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  font-bold
                  tracking-tight
                  text-slate-900
                  sm:text-xl
                "
              >
                {payment
                  ? "Edit Payment"
                  : "Record Payment"}
              </h2>

              <p
                className="
                  mt-1
                  max-w-sm
                  text-xs
                  leading-5
                  text-slate-500
                  sm:text-sm
                "
              >
                {payment
                  ? "Update the payment information for this order."
                  : "Record a customer payment against this order."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
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

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >

          {/* SCROLLABLE CONTENT */}

          <div
            className="
              overflow-y-auto
              px-6
              py-6
              sm:px-7
            "
          >

            {/* ORDER SUMMARY */}

            <div
              className="
                rounded-2xl
                border
                border-slate-200
                bg-slate-50/80
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div className="min-w-0">
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-slate-400
                    "
                  >
                    Order
                  </p>

                  <p
                    className="
                      mt-1
                      truncate
                      text-sm
                      font-bold
                      text-slate-900
                    "
                  >
                    {order?.orderNumber ||
                      "Selected Order"}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-slate-400
                    "
                  >
                    Order Value
                  </p>

                  <p
                    className="
                      mt-1
                      text-base
                      font-bold
                      text-[#172B6B]
                    "
                  >
                    ₹{formatAmount(orderAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* AMOUNT */}

            <div className="mt-6">

              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                "
              >
                <label
                  htmlFor="amountPaid"
                  className="
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  Amount Paid
                </label>

                <span
                  className="
                    text-[11px]
                    font-medium
                    text-slate-400
                  "
                >
                  Required
                </span>
              </div>

              <div className="relative">

                <span
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-lg
                    font-semibold
                    text-slate-400
                  "
                >
                  ₹
                </span>

                <input
                  id="amountPaid"
                  type="number"
                  name="amountPaid"
                  min="0"
                  max={orderAmount}
                  step="0.01"
                  placeholder="0.00"
                  value={form.amountPaid}
                  onChange={handleChange}
                  required
                  className="
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    pl-10
                    pr-4
                    text-xl
                    font-bold
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-300
                    focus:border-[#172B6B]
                    focus:ring-4
                    focus:ring-[#172B6B]/10
                  "
                />
              </div>

              {/* AMOUNT SUMMARY */}

              <div
                className="
                  mt-3
                  grid
                  grid-cols-2
                  gap-2
                "
              >
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
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    Order Total
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >
                    ₹{formatAmount(orderAmount)}
                  </p>
                </div>

                <div
                  className={`
                    rounded-xl
                    border
                    px-3
                    py-2.5
                    ${
                      enteredAmount >
                      orderAmount
                        ? "border-red-100 bg-red-50"
                        : "border-emerald-100 bg-emerald-50"
                    }
                  `}
                >
                  <p
                    className={`
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      ${
                        enteredAmount >
                        orderAmount
                          ? "text-red-500"
                          : "text-emerald-600"
                      }
                    `}
                  >
                    Remaining
                  </p>

                  <p
                    className={`
                      mt-0.5
                      text-sm
                      font-bold
                      ${
                        enteredAmount >
                        orderAmount
                          ? "text-red-700"
                          : "text-emerald-700"
                      }
                    `}
                  >
                    ₹{formatAmount(remainingAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}

            <div className="mt-6">

              <label
                className="
                  mb-3
                  block
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                Payment Method
              </label>

              <div
                className="
                  grid
                  grid-cols-2
                  gap-2.5
                "
              >
                {PAYMENT_METHODS.map(
                  (method) => {
                    const selected =
                      form.paymentMethod ===
                      method.value;

                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            paymentMethod:
                              method.value,
                          }))
                        }
                        className={`
                          group
                          relative
                          rounded-2xl
                          border
                          p-3.5
                          text-left
                          transition-all
                          ${
                            selected
                              ? "border-[#172B6B] bg-[#172B6B]/[0.04] shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }
                        `}
                      >
                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-2
                          "
                        >
                          <span
                            className={`
                              text-sm
                              font-bold
                              ${
                                selected
                                  ? "text-[#172B6B]"
                                  : "text-slate-700"
                              }
                            `}
                          >
                            {method.label}
                          </span>

                          {selected && (
                            <FiCheckCircle
                              size={16}
                              className="text-[#172B6B]"
                            />
                          )}
                        </div>

                        <p
                          className="
                            mt-1
                            text-[10px]
                            leading-4
                            text-slate-400
                          "
                        >
                          {method.description}
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* REMARKS */}

            <div className="mt-6">

              <label
                htmlFor="remarks"
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                <FiFileText
                  size={14}
                  className="text-slate-400"
                />

                Remarks

                <span
                  className="
                    text-[10px]
                    font-medium
                    text-slate-400
                  "
                >
                  Optional
                </span>
              </label>

              <textarea
                id="remarks"
                name="remarks"
                rows={3}
                placeholder="Add a note about this payment..."
                value={form.remarks}
                onChange={handleChange}
                className="
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-[#172B6B]
                  focus:ring-4
                  focus:ring-[#172B6B]/10
                "
              />
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-red-700
                "
              >
                {error}
              </div>
            )}
          </div>

          {/* FOOTER */}

          <div
            className="
              shrink-0
              border-t
              border-slate-100
              bg-white
              px-6
              py-4
              sm:px-7
            "
          >
            <div
              className="
                flex
                flex-col-reverse
                gap-2.5
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  hover:text-slate-900
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !isValidAmount
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#172B6B]
                  px-6
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-[#20398F]
                  hover:shadow-md
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:bg-slate-300
                  disabled:shadow-none
                "
              >
                {submitting ? (
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
                    {payment
                      ? "Update Payment"
                      : "Record Payment"}

                    <FiArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PaymentModal;