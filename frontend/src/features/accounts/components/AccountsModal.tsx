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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[500px] p-6 space-y-4">

        <h2 className="text-2xl font-bold">
          {transaction ? "Edit" : "Add"} Transaction
        </h2>

        <select
          className="w-full border rounded-lg p-3"
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

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Category"
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
            })
          }
        />

        <input
          type="number"
          className="w-full border rounded-lg p-3"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({
              ...form,
              amount: e.target.value,
            })
          }
        />

        <select
          className="w-full border rounded-lg p-3"
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

        <textarea
          className="w-full border rounded-lg p-3"
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-[#172B6B] text-white px-5 py-2 rounded-lg"
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
};

export default AccountsModal;