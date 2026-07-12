import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (payment) {
      setForm({
        amountPaid: payment.amountPaid?.toString() || "",
        paymentMethod: payment.paymentMethod || "Cash",
        remarks: payment.remarks || "",
      });
    } else {
      setForm({
        amountPaid: "",
        paymentMethod: "Cash",
        remarks: "",
      });
    }
  }, [payment, open]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!order?._id) {
      alert("Please select an order first.");
      return;
    }

    const payload = {
      order: order._id,
      amountPaid: Number(form.amountPaid),
      paymentMethod: form.paymentMethod,
      remarks: form.remarks,
    };

    try {
      if (payment?._id) {
        await updatePayment(payment._id, payload);
      } else {
        await createPayment(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

    <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">

      {/* Header */}

      <div className="border-b border-slate-200 px-6 py-5">

        <h2 className="text-2xl font-bold text-slate-900">
          {payment ? "Edit Payment" : "Record Payment"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {payment
            ? "Update the payment information."
            : "Record a payment against the selected customer order."}
        </p>

      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6"
      >

        <div className="grid gap-5 md:grid-cols-2">

          {/* Amount */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Amount Paid
            </label>

            <input
              type="number"
              name="amountPaid"
              placeholder="Enter amount"
              value={form.amountPaid}
              onChange={handleChange}
              required
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-300
                px-4
                outline-none
                transition
                focus:border-[#172B6B]
                focus:ring-4
                focus:ring-blue-100
              "
            />

          </div>

          {/* Method */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Payment Method
            </label>

            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-300
                px-4
                outline-none
                transition
                focus:border-[#172B6B]
                focus:ring-4
                focus:ring-blue-100
              "
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">
                Bank Transfer
              </option>
              <option value="Cheque">
                Cheque
              </option>
              <option value="UPI">
                UPI
              </option>
            </select>

          </div>

          {/* Remarks */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Remarks
            </label>

            <input
              name="remarks"
              placeholder="Additional remarks..."
              value={form.remarks}
              onChange={handleChange}
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-300
                px-4
                outline-none
                transition
                focus:border-[#172B6B]
                focus:ring-4
                focus:ring-blue-100
              "
            />

          </div>

        </div>

        {/* Footer */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              border
              border-slate-300
              px-6
              py-3
              font-semibold
              transition
              hover:bg-slate-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            className="
              rounded-xl
              bg-[#172B6B]
              px-6
              py-3
              font-semibold
              text-white
              transition
              hover:bg-[#20398F]
            "
          >
            {payment ? "Update Payment" : "Record Payment"}
          </button>

        </div>

      </form>

    </div>

  </div>
);
};

export default PaymentModal;