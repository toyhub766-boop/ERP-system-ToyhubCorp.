import { useEffect, useState } from "react";
import { createTransaction } from "../services/accountTransaction.service";

interface Props {
  open: boolean;
  onClose: () => void;

  customerId: string;

  transactionType: "MONEY_IN" | "MONEY_OUT";

  onSuccess: () => void;
}

const TransactionModal = ({
  open,
  onClose,
  customerId,
  transactionType,
  onSuccess,
}: Props) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState("Cash");
  const [remarks, setRemarks] =
    useState("");
  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setPaymentMethod("Cash");
      setRemarks("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!amount) {
      alert("Please enter amount");
      return;
    }

    try {
      setSaving(true);

      await createTransaction({
        customer: customerId,
        transactionType,
        amount: Number(amount),
        paymentMethod,
        remarks,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-2xl font-bold">
            {transactionType === "MONEY_IN"
              ? "You Got"
              : "You Gave"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Record a transaction
          </p>
        </div>

        <div className="space-y-5 p-6">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Amount
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="Enter amount"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#17357A]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Payment Method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#17357A]"
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Remarks
            </label>

            <textarea
              rows={4}
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
              placeholder="Optional remarks..."
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#17357A]"
            />
          </div>

        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={handleSubmit}
            className={`rounded-xl px-5 py-2 font-semibold text-white ${
              transactionType === "MONEY_IN"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {saving
              ? "Saving..."
              : transactionType === "MONEY_IN"
              ? "Save Money In"
              : "Save Money Out"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default TransactionModal;