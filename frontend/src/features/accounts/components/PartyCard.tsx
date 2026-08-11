import { useEffect, useState } from "react";

import {
  updatePartyDueDate,
} from "../services/accountParty.service";

interface Props {
  party: any;
  selected: boolean;
  onClick: () => void;
}

const PartyCard = ({
  party,
  selected,
  onClick,
}: Props) => {
  const customer = party.customerDetails;
  const supplier = party.supplierDetails;

  const existingDueDate =
    customer?.dueDate ||
    supplier?.dueDate ||
    null;

  const balance = party.currentBalance || 0;

  const [editingDueDate, setEditingDueDate] =
    useState(false);

  const [dueDate, setDueDate] =
    useState("");

  const [savingDueDate, setSavingDueDate] =
    useState(false);

  // --------------------------------
  // Format date for <input type=date>
  // --------------------------------

  const formatInputDate = (
    value: string | Date | null
  ) => {
    if (!value) return "";

    const date = new Date(value);

    return new Date(
      date.getTime() -
        date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];
  };

  useEffect(() => {
    setDueDate(
      formatInputDate(existingDueDate)
    );
  }, [existingDueDate]);

  // --------------------------------
  // Save Due Date
  // --------------------------------

  const handleSaveDueDate = async (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    try {
      setSavingDueDate(true);

      const updatedParty =
        await updatePartyDueDate(
          party._id,
          dueDate || null
        );

      if (
        party.partyType === "CUSTOMER"
      ) {
        party.customerDetails =
          updatedParty.customerDetails;
      }

      if (
        party.partyType === "SUPPLIER"
      ) {
        party.supplierDetails =
          updatedParty.supplierDetails;
      }

      setEditingDueDate(false);
    } catch (error) {
      console.error(error);

      alert(
        "Failed to update due date."
      );
    } finally {
      setSavingDueDate(false);
    }
  };

  // --------------------------------
  // Cancel Due Date
  // --------------------------------

  const handleCancelDueDate = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    setDueDate(
      formatInputDate(existingDueDate)
    );

    setEditingDueDate(false);
  };

  // --------------------------------
  // Party Type
  // --------------------------------

  const partyTypeLabel =
    party.partyType ===
    "COMPANY_EXPENSE"
      ? "COMPANY EXPENSE"
      : party.partyType;

  // --------------------------------
  // Party Type Styling
  // --------------------------------

  const partyTypeStyle =
    party.partyType === "CUSTOMER"
      ? "text-blue-700"
      : party.partyType === "SUPPLIER"
      ? "text-orange-600"
      : "text-purple-700";

  // --------------------------------
  // Initial
  // --------------------------------

  const initial =
    party.companyName
      ?.charAt(0)
      ?.toUpperCase() || "?";

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border px-4 py-4 transition-all ${
        selected
          ? "border-[#17357A] bg-blue-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* ==============================
          HEADER
      ============================== */}

      <div className="flex items-start gap-3">
        {/* Avatar */}

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${
            selected
              ? "bg-[#17357A] text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {initial}
        </div>

        {/* Name */}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {party.companyName}
            </h3>

            {party.status === "Active" && (
              <span className="shrink-0 text-[11px] font-medium text-green-600">
                Active
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-xs text-slate-600">
            {party.contactPerson ||
              "--"}
          </p>

          {/* Transport phone */}

          {customer?.transportPhone && (
            <p className="mt-1 text-xs text-slate-500">
              ☎ {customer.transportPhone}
            </p>
          )}
        </div>
      </div>

      {/* ==============================
          PARTY META
      ============================== */}

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
        <span className="font-medium text-slate-500">
          {party.partyCode}
        </span>

        <span className="text-slate-300">
          •
        </span>

        <span
          className={`font-semibold ${partyTypeStyle}`}
        >
          {partyTypeLabel}
        </span>
      </div>

      {/* ==============================
          BALANCE + DUE DATE
      ============================== */}

      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="grid grid-cols-2 gap-4">
          {/* Balance */}

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Outstanding
            </p>

            <p
              className={`mt-1 text-base font-bold ${
                balance >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₹
              {Math.abs(
                balance
              ).toLocaleString("en-IN")}
            </p>
          </div>

          {/* Due Date */}

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Due Date
            </p>

            {!editingDueDate ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("DUE Date CLiced")
                  setEditingDueDate(true);
                }}
                className="mt-1 text-left text-sm font-semibold text-slate-800 transition hover:text-[#17357A]"
              >
                {existingDueDate
                  ? new Date(
                      existingDueDate
                    ).toLocaleDateString(
                      "en-IN"
                    )
                  : "Set date"}
              </button>
            ) : (
              <div className="mt-1">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(
                      e.target.value
                    )
                  }
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#17357A] focus:ring-1 focus:ring-[#17357A]/20"
                />

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={
                      savingDueDate
                    }
                    onClick={
                      handleSaveDueDate
                    }
                    className="rounded-md bg-[#17357A] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-[#10295d] disabled:opacity-50"
                  >
                    {savingDueDate
                      ? "..."
                      : "Save"}
                  </button>

                  <button
                    type="button"
                    disabled={
                      savingDueDate
                    }
                    onClick={
                      handleCancelDueDate
                    }
                    className="rounded-md border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyCard;