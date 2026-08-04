import { useEffect, useState } from "react";

import {
  createTransaction,
  updateTransaction,
} from "../services/accountTransaction.service";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;

  partyId: string;

  transactionType:
    | "MONEY_IN"
    | "MONEY_OUT";

  editTransaction?: any;
}

const TransactionModal = ({
  open,
  onClose,
  onSuccess,

  partyId,

  transactionType,

  editTransaction,
}: Props) => {
  const [saving, setSaving] =
    useState(false);

  const [form, setForm] = useState({
    amount: 0,

    paymentMethod: "Cash",

    utrNumber: "",

    otherReason: "",

    remarks: "",

    date: new Date()
      .toISOString()
      .substring(0, 10),
  });

  const [attachment, setAttachment] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  useEffect(() => {
    if (!open) return;

    if (editTransaction) {
      setForm({
        amount:
          editTransaction.amount || 0,

        paymentMethod:
          editTransaction.paymentMethod ||
          "Cash",

        utrNumber:
          editTransaction.utrNumber ||
          "",

        otherReason:
          editTransaction.otherReason ||
          "",

        remarks:
          editTransaction.remarks ||
          "",

        date:
          editTransaction.date
            ?.substring(0, 10) ||
          new Date()
            .toISOString()
            .substring(0, 10),
      });

      setPreview(
        editTransaction.attachment ||
          ""
      );

      setAttachment(null);

      return;
    }

    setForm({
      amount: 0,

      paymentMethod: "Cash",

      utrNumber: "",

      otherReason: "",

      remarks: "",

      date: new Date()
        .toISOString()
        .substring(0, 10),
    });

    setAttachment(null);

    setPreview("");

  }, [open, editTransaction]);

  const updateField = (
    key: keyof typeof form,
    value: any
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

    const handleSubmit = async () => {
  if (!partyId) {
    alert("Please select a party.");
    return;
  }

  if (!form.amount || form.amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  if (
    form.paymentMethod === "Bank Transfer" &&
    !form.utrNumber.trim()
  ) {
    alert("Please enter the UTR Number.");
    return;
  }

  if (
    form.paymentMethod === "Other" &&
    !form.otherReason.trim()
  ) {
    alert("Please enter the reason.");
    return;
  }

  try {
    setSaving(true);

    const data = new FormData();

    data.append("party", partyId);

    data.append(
      "transactionType",
      transactionType
    );

    data.append(
      "amount",
      String(form.amount)
    );

    data.append(
      "paymentMethod",
      form.paymentMethod
    );

    data.append(
      "utrNumber",
      form.utrNumber
    );

    data.append(
      "otherReason",
      form.otherReason
    );

    data.append(
      "remarks",
      form.remarks
    );

    data.append(
      "date",
      form.date
    );

    if (attachment) {
      data.append(
        "attachment",
        attachment
      );
    }

    if (editTransaction) {
      await updateTransaction(
        editTransaction._id,
        data
      );
    } else {
      await createTransaction(data);
    }

    onSuccess();
    onClose();

  } catch (error) {

    console.error(error);

    alert("Failed to save transaction.");

  } finally {

    setSaving(false);

  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">

      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="border-b border-slate-200 px-8 py-6">

          <h2 className="text-3xl font-bold">

            {editTransaction
              ? "Edit Transaction"
              : transactionType ===
                "MONEY_IN"
              ? "Money In"
              : "Money Out"}

          </h2>

          <p className="mt-2 text-slate-500">

            Record a transaction for this party.

          </p>

        </div>

        {/* BODY */}

        <div className="max-h-[70vh] overflow-y-auto p-8 space-y-6">

          {/* Amount */}

<div>
  <label className="mb-2 block text-sm font-medium">
    Amount <span className="text-red-500">*</span>
  </label>

  <input
    type="number"
    value={form.amount}
    onChange={(e) =>
      updateField(
        "amount",
        Number(e.target.value)
      )
    }
    placeholder="Enter amount"
    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#17357A]"
  />
</div>

{/* Payment Method */}

<div>
  <label className="mb-2 block text-sm font-medium">
    Payment Method
  </label>

  <select
    value={form.paymentMethod}
    onChange={(e) =>
      updateField(
        "paymentMethod",
        e.target.value
      )
    }
    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#17357A]"
  >
    <option value="Cash">Cash</option>
    <option value="UPI">UPI</option>
    <option value="Bank Transfer">
      Bank Transfer
    </option>
    <option value="Cheque">
      Cheque
    </option>
    <option value="Other">
      Other
    </option>
  </select>
</div>

{/* UTR */}

{form.paymentMethod ===
  "Bank Transfer" && (
  <div>
    <label className="mb-2 block text-sm font-medium">
      UTR Number
    </label>

    <input
      value={form.utrNumber}
      onChange={(e) =>
        updateField(
          "utrNumber",
          e.target.value
        )
      }
      placeholder="Enter UTR Number"
      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#17357A]"
    />
  </div>
)}

{/* Other Reason */}

{form.paymentMethod ===
  "Other" && (
  <div>
    <label className="mb-2 block text-sm font-medium">
      Reason
    </label>

    <input
      value={form.otherReason}
      onChange={(e) =>
        updateField(
          "otherReason",
          e.target.value
        )
      }
      placeholder="Reason for payment"
      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#17357A]"
    />
  </div>
)}

{/* Transaction Date */}

<div>
  <label className="mb-2 block text-sm font-medium">
    Transaction Date
  </label>

  <input
    type="date"
    value={form.date}
    onChange={(e) =>
      updateField(
        "date",
        e.target.value
      )
    }
    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#17357A]"
  />
</div>

{/* Upload Slip */}

<div>
  <label className="mb-2 block text-sm font-medium">
    Payment Slip
  </label>

  <input
    type="file"
    accept="image/*,.pdf"
    onChange={(e) => {
      const file =
        e.target.files?.[0];

      if (!file) return;

      setAttachment(file);

      setPreview(
        URL.createObjectURL(file)
      );
    }}
    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
  />

  {preview && (
    <div className="mt-4">
      <img
        src={preview}
        alt="Slip Preview"
        className="h-40 w-40 rounded-xl border object-cover"
      />
    </div>
  )}
</div>

{/* Remarks */}

<div>
  <label className="mb-2 block text-sm font-medium">
    Remarks
  </label>

  <textarea
    rows={4}
    value={form.remarks}
    onChange={(e) =>
      updateField(
        "remarks",
        e.target.value
      )
    }
    placeholder="Enter remarks..."
    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#17357A]"
  />
</div>

        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-4 border-t border-slate-200 px-8 py-6">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-6 py-3"
          >
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={handleSubmit}
            className="rounded-xl bg-[#17357A] px-6 py-3 font-semibold text-white hover:bg-[#20459D]"
          >
            {saving
              ? "Saving..."
              : editTransaction
              ? "Update Transaction"
              : "Save Transaction"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default TransactionModal;