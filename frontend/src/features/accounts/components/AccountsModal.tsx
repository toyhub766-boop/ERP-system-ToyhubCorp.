import { useEffect, useState } from "react";

import {
  createAccount,
  updateAccount,
} from "../services/account.service";

interface Props {
  open: boolean;
  transaction?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const AccountsModal = ({
  open,
  transaction,
  onClose,
  onSuccess,
}: Props) => {
  const [form, setForm] = useState({
    type: "Income",
    category: "",
    amount: "",
    paymentMethod: "Cash",
    description: "",
  });

  useEffect(() => {
    if (transaction) {
      setForm({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        description: transaction.description || "",
      });
    } else {
      setForm({
        type: "Income",
        category: "",
        amount: "",
        paymentMethod: "Cash",
        description: "",
      });
    }
  }, [transaction, open]);

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      if (transaction) {
        await updateAccount(transaction._id, payload);
      } else {
        await createAccount(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

    return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
    <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-200 px-7 py-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Record an income or expense transaction.
          </p>
        </div>

        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      {/* Body */}

      <div className="space-y-5 p-7">

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Transaction Type
          </label>

          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#17357A]"
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value,
              })
            }
          >
            <option>Income</option>
            <option>Expense</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Category
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
            placeholder="e.g. Sales, Rent, Transport"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Amount
          </label>

          <input
            type="number"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
            placeholder="Enter amount"
            value={form.amount}
            onChange={(e) =>
              setForm({
                ...form,
                amount: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Payment Method
          </label>

          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#17357A]"
            value={form.paymentMethod}
            onChange={(e) =>
              setForm({
                ...form,
                paymentMethod: e.target.value,
              })
            }
          >
            <option>Cash</option>
            <option>Bank</option>
            <option>UPI</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </label>

          <textarea
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17357A]"
            placeholder="Additional notes..."
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </div>

      </div>

      {/* Footer */}

      <div className="flex justify-end gap-3 border-t border-slate-200 px-7 py-5">

        <button
          onClick={onClose}
          className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="rounded-xl bg-[#17357A] px-6 py-3 font-semibold text-white transition hover:bg-[#21439A]"
        >
          {transaction ? "Update Transaction" : "Save Transaction"}
        </button>

      </div>

    </div>
  </div>
);
};

export default AccountsModal;