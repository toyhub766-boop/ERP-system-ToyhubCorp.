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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">

        <h2 className="text-2xl font-bold mb-6">
          {payment ? "Edit Payment" : "Record Payment"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="number"
            name="amountPaid"
            placeholder="Amount Paid"
            value={form.amountPaid}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            required
          />

          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          >
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
            <option value="UPI">UPI</option>
          </select>

          <input
            name="remarks"
            placeholder="Remarks"
            value={form.remarks}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="border rounded-lg px-5 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-[#172B6B] text-white rounded-lg px-5 py-2"
            >
              Save
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default PaymentModal;