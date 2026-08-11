import { useEffect, useState } from "react";

import LedgerEntryCard from "./LedgerEntryCard";

import {
  updatePartyDueDate,
} from "../services/accountParty.service";

import {
  Trash2,
  Pencil,
  FileText,
  Download,
} from "lucide-react";

interface Props {
  selectedParty: any;
  ledger: any[];
  loading: boolean;

  onMoneyIn: () => void;
  onMoneyOut: () => void;

  // Optional:
  // Admin can delete transactions.
  onDelete?: (id: string) => void;

  // Optional:
  // Only Admin should receive this prop.
  onDeleteParty?: () => void;

  onEditParty: () => void;
  onViewReport: () => void;

  onExportPdf: () => void;
  onExportExcel: () => void;
}

const LedgerPanel = ({
  selectedParty,
  ledger,
  loading,

  onMoneyIn,
  onMoneyOut,

  onDelete,
  onDeleteParty,

  onEditParty,
  onViewReport,

  onExportPdf,
  onExportExcel,
}: Props) => {
  // ==========================================
  // STATE
  // ==========================================

  const [editingDueDate, setEditingDueDate] =
    useState(false);

  const [dueDateInput, setDueDateInput] =
    useState("");

  const [savingDueDate, setSavingDueDate] =
    useState(false);

  // ==========================================
  // PARTY DETAILS
  // ==========================================

  const customer =
    selectedParty?.customerDetails;

  const supplier =
    selectedParty?.supplierDetails;

  const existingDueDate =
    customer?.dueDate ||
    supplier?.dueDate ||
    null;

  // ==========================================
  // DATE HELPERS
  // ==========================================

  const formatInputDate = (
    value: string | Date | null
  ) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Date(
      date.getTime() -
        date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];
  };

  const formatDisplayDate = (
    value: string | Date | null
  ) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // RESET WHEN PARTY CHANGES
  // ==========================================

  useEffect(() => {
    setEditingDueDate(false);

    setDueDateInput(
      formatInputDate(existingDueDate)
    );
  }, [
    selectedParty?._id,
    existingDueDate,
  ]);

  // ==========================================
  // SAVE DUE DATE
  // ==========================================

  const handleSaveDueDate = async () => {
    if (!selectedParty) return;

    try {
      setSavingDueDate(true);

      const updatedParty =
        await updatePartyDueDate(
          selectedParty._id,
          dueDateInput || null
        );

      if (
        selectedParty.partyType ===
        "CUSTOMER"
      ) {
        selectedParty.customerDetails = {
          ...selectedParty.customerDetails,
          ...updatedParty.customerDetails,
        };
      }

      if (
        selectedParty.partyType ===
        "SUPPLIER"
      ) {
        selectedParty.supplierDetails = {
          ...selectedParty.supplierDetails,
          ...updatedParty.supplierDetails,
        };
      }

      setDueDateInput(
        formatInputDate(
          updatedParty.customerDetails
            ?.dueDate ||
            updatedParty.supplierDetails
              ?.dueDate ||
            null
        )
      );

      setEditingDueDate(false);
    } catch (error) {
      console.error(
        "Failed to update due date:",
        error
      );

      alert(
        "Failed to update due date."
      );
    } finally {
      setSavingDueDate(false);
    }
  };

  // ==========================================
  // CANCEL DUE DATE
  // ==========================================

  const handleCancelDueDate = () => {
    setDueDateInput(
      formatInputDate(existingDueDate)
    );

    setEditingDueDate(false);
  };

  // ==========================================
  // NO PARTY SELECTED
  // ==========================================

  if (!selectedParty) {
    return (
      <div className="flex h-full flex-col bg-slate-50">

        <div className="border-b border-slate-200 bg-white px-6 py-6">

          <h2 className="text-2xl font-bold text-slate-900">
            Accounts
          </h2>

          <p className="mt-1.5 text-sm text-slate-500">
            Select a Customer, Supplier or
            Company Expense from the left panel.
          </p>

        </div>

        <div className="flex flex-1 items-center justify-center p-6">

          <div className="max-w-sm text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-500">
              A
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No Party Selected
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Select a party to view account
              details, balance and transactions.
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // DERIVED DATA
  // ==========================================

  const balance =
    Number(
      selectedParty.currentBalance
    ) || 0;

  const isCustomer =
    selectedParty.partyType ===
    "CUSTOMER";

  const isSupplier =
    selectedParty.partyType ===
    "SUPPLIER";

  const isExpense =
    selectedParty.partyType ===
    "COMPANY_EXPENSE";

  const gstNumber =
    customer?.gstNumber ||
    supplier?.gstNumber ||
    "--";

  const paymentTerms =
    customer?.paymentTerms ??
    supplier?.paymentTerms ??
    0;

  const initial =
    selectedParty.companyName
      ?.charAt(0)
      ?.toUpperCase() || "?";

  const partyTypeLabel =
    selectedParty.partyType ===
    "COMPANY_EXPENSE"
      ? "COMPANY EXPENSE"
      : selectedParty.partyType;

  const balanceLabel =
    balance >= 0
      ? "You'll Get"
      : "You'll Give";

  const formattedDueDate =
    formatDisplayDate(
      existingDueDate
    );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="flex h-full flex-col bg-slate-50">

      {/* ======================================
          PARTY HEADER
      ====================================== */}

      <div className="px-4 pt-4 sm:px-5 sm:pt-5">

        <div className="overflow-hidden rounded-2xl bg-[#17357A] shadow-sm">

          <div className="p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

              {/* PARTY INFORMATION */}

              <div className="flex min-w-0 items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-xl font-bold text-white">
                  {initial}
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-3">

                    <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
                      {selectedParty.companyName}
                    </h1>

                    <span
                      className={`text-xs font-semibold ${
                        selectedParty.status ===
                        "Active"
                          ? "text-green-300"
                          : "text-red-300"
                      }`}
                    >
                      {selectedParty.status}
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-blue-100">
                    {selectedParty.contactPerson ||
                      "--"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">
                      {selectedParty.partyCode}
                    </span>

                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">
                      {partyTypeLabel}
                    </span>

                  </div>

                </div>

              </div>

              {/* BALANCE */}

              <div className="lg:min-w-[180px] lg:text-right">

                <p className="text-[11px] font-medium uppercase tracking-wide text-blue-200">
                  Outstanding
                </p>

                <p
                  className={`mt-1 text-3xl font-bold ${
                    balance >= 0
                      ? "text-white"
                      : "text-red-200"
                  }`}
                >
                  {Math.abs(
                    balance
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>

                <p
                  className={`mt-1 text-xs font-semibold ${
                    balance >= 0
                      ? "text-green-300"
                      : "text-red-200"
                  }`}
                >
                  {balanceLabel}
                </p>

              </div>

            </div>

          </div>

          {/* ==================================
              ACTION BAR
          ================================== */}

          <div className="border-t border-white/10 bg-black/10 px-5 py-3 sm:px-6">

            <div className="flex flex-wrap items-center justify-end gap-2">

              {/* EDIT PARTY */}

              <button
                type="button"
                onClick={onEditParty}
                title="Edit party"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Pencil
                  size={14}
                  strokeWidth={1.8}
                />

                Edit Party
              </button>

              {/* DELETE PARTY — ADMIN ONLY */}

              {onDeleteParty && (
                <button
                  type="button"
                  onClick={onDeleteParty}
                  title="Delete party"
                  aria-label="Delete party"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2
                    size={15}
                    strokeWidth={1.8}
                  />
                </button>
              )}

              {/* VIEW REPORT */}

              <button
                type="button"
                onClick={onViewReport}
                title="View report"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-[#17357A] transition hover:bg-blue-50"
              >
                <FileText
                  size={14}
                  strokeWidth={1.8}
                />

                View Report
              </button>

              {/* EXPORT */}

              <div className="group relative">

                <button
                  type="button"
                  title="Export ledger"
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Download
                    size={14}
                    strokeWidth={1.8}
                  />

                  Export

                  <span className="text-[9px]">
                    ▼
                  </span>
                </button>

                <div className="absolute right-0 top-full z-50 hidden w-44 pt-2 group-hover:block">

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">

                    <button
                      type="button"
                      onClick={
                        onExportPdf
                      }
                      className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      Export PDF
                    </button>

                    <button
                      type="button"
                      onClick={
                        onExportExcel
                      }
                      className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      Export Excel
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">

        <div className="space-y-5">

          {/* ==================================
              CONTACT + BUSINESS
          ================================== */}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {/* CONTACT */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5">

                <h2 className="text-lg font-bold text-slate-900">
                  Contact Information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Party contact and address details.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">

                <InfoItem
                  label="Contact Person"
                  value={
                    selectedParty.contactPerson ||
                    "--"
                  }
                />

                <InfoItem
                  label="Email"
                  value={
                    selectedParty.email ||
                    "--"
                  }
                />

                {isCustomer && (
                  <InfoItem
                    label="Transport Phone"
                    value={
                      customer?.transportPhone ||
                      "--"
                    }
                  />
                )}

                <InfoItem
                  label="City"
                  value={
                    selectedParty.city ||
                    "--"
                  }
                />

                <InfoItem
                  label="State"
                  value={
                    selectedParty.state ||
                    "--"
                  }
                />

                <InfoItem
                  label="Pincode"
                  value={
                    selectedParty.pincode ||
                    "--"
                  }
                />

                <div className="sm:col-span-2">

                  <InfoItem
                    label="Address"
                    value={
                      selectedParty.address ||
                      "--"
                    }
                  />

                </div>

              </div>

            </section>

            {/* BUSINESS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5">

                <h2 className="text-lg font-bold text-slate-900">
                  Business Information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Registration and business-specific details.
                </p>

              </div>

              {!isExpense ? (

                <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">

                  <InfoItem
                    label="GST Number"
                    value={gstNumber}
                  />

                  {isCustomer && (
                    <>
                      <InfoItem
                        label="Billing Name"
                        value={
                          customer?.billingName ||
                          "--"
                        }
                      />

                      <InfoItem
                        label="Transport Name"
                        value={
                          customer?.transportName ||
                          "--"
                        }
                      />

                      <InfoItem
                        label="Transport Number"
                        value={
                          customer?.transportNumber ||
                          "--"
                        }
                      />

                      <InfoItem
                        label="Marka"
                        value={
                          customer?.marka ||
                          "--"
                        }
                      />

                      <InfoItem
                        label="Station"
                        value={
                          customer?.station ||
                          "--"
                        }
                      />
                    </>
                  )}

                  {isSupplier && (
                    <InfoItem
                      label="Party Type"
                      value="Supplier"
                    />
                  )}

                  <InfoItem
                    label="Status"
                    value={
                      selectedParty.status ||
                      "--"
                    }
                  />

                </div>

              ) : (

                <div className="grid gap-5">

                  <InfoItem
                    label="Expense Category"
                    value={
                      selectedParty
                        .companyExpenseDetails
                        ?.expenseCategory ||
                      "--"
                    }
                  />

                  <InfoItem
                    label="Description"
                    value={
                      selectedParty
                        .companyExpenseDetails
                        ?.description ||
                      "--"
                    }
                  />

                </div>

              )}

            </section>

          </div>

          {/* ==================================
              COMMERCIAL INFORMATION
          ================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5">

              <h2 className="text-lg font-bold text-slate-900">
                Commercial Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Account terms, balances and payment details.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">

              {isCustomer && (
                <>
                  <MetricCard
                    label="Packing"
                    value={
                      customer?.packingCharges
                        ?.toLocaleString(
                          "en-IN"
                        ) || "0"
                    }
                  />

                  <MetricCard
                    label="Transport"
                    value={
                      customer?.transportCharges
                        ?.toLocaleString(
                          "en-IN"
                        ) || "0"
                    }
                  />
                </>
              )}

              <MetricCard
                label="Payment Terms"
                value={`${paymentTerms} Days`}
              />

              <MetricCard
                label="Opening Balance"
                value={
                  Number(
                    selectedParty.openingBalance
                  ).toLocaleString(
                    "en-IN"
                  )
                }
              />

              <MetricCard
                label="Outstanding"
                value={Math.abs(
                  balance
                ).toLocaleString(
                  "en-IN"
                )}
                danger={balance < 0}
              />

            </div>

            {/* DUE DATE */}

            {!isExpense && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Due Date
                    </p>

                    {!editingDueDate ? (

                      <button
                        type="button"
                        onClick={() =>
                          setEditingDueDate(
                            true
                          )
                        }
                        className="mt-1 text-left text-sm font-bold text-[#17357A] hover:underline"
                      >
                        {formattedDueDate !==
                        "--"
                          ? formattedDueDate
                          : "+ Set Due Date"}
                      </button>

                    ) : (

                      <div className="mt-2 flex flex-wrap gap-2">

                        <input
                          type="date"
                          value={
                            dueDateInput
                          }
                          onChange={(e) =>
                            setDueDateInput(
                              e.target.value
                            )
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#17357A] focus:ring-2 focus:ring-[#17357A]/10"
                        />

                        <button
                          type="button"
                          disabled={
                            savingDueDate
                          }
                          onClick={
                            handleSaveDueDate
                          }
                          className="rounded-lg bg-[#17357A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#10295d] disabled:opacity-50"
                        >
                          {savingDueDate
                            ? "Saving..."
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
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>

                      </div>

                    )}

                  </div>

                  {!editingDueDate && (
                    <p className="text-xs text-slate-400">
                      Click the date to edit
                    </p>
                  )}

                </div>

              </div>
            )}

          </section>

          {/* ==================================
              RECORD TRANSACTION
          ================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-4">

              <h2 className="text-lg font-bold text-slate-900">
                Record Transaction
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Record money given to or received from this party.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={onMoneyOut}
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-left transition hover:bg-red-100"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                  Money Out
                </p>

                <p className="mt-1 text-base font-bold text-red-700">
                  You Gave
                </p>

                <p className="mt-1 text-xs text-red-500">
                  Record a payment made to this party.
                </p>
              </button>

              <button
                type="button"
                onClick={onMoneyIn}
                className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-left transition hover:bg-green-100"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-green-500">
                  Money In
                </p>

                <p className="mt-1 text-base font-bold text-green-700">
                  You Got
                </p>

                <p className="mt-1 text-xs text-green-500">
                  Record a payment received from this party.
                </p>
              </button>

            </div>

          </section>

          {/* ==================================
              ACCOUNT LEDGER
          ================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-5">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Account Ledger
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Complete transaction history for this party.
                  </p>

                </div>

                <div className="text-left sm:text-right">

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Total Transactions
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {ledger.length}
                  </p>

                </div>

              </div>

            </div>

            <div className="p-5">

              {loading ? (

                <div className="flex min-h-[220px] items-center justify-center">

                  <div className="text-center">

                    <p className="text-sm font-medium text-slate-600">
                      Loading transactions...
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Please wait.
                    </p>

                  </div>

                </div>

              ) : ledger.length === 0 ? (

                <div className="flex min-h-[220px] items-center justify-center">

                  <div className="max-w-sm text-center">

                    <h3 className="text-base font-bold text-slate-900">
                      No Transactions Yet
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-slate-500">
                      Record the first transaction
                      using the buttons above.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="space-y-3">

                  {ledger.map(
                    (transaction: any) => (
                      <LedgerEntryCard
                        key={
                          transaction._id
                        }
                        transaction={
                          transaction
                        }
                        onDelete={
                          onDelete
                        }
                      />
                    )
                  )}

                </div>

              )}

            </div>

          </section>

        </div>

      </div>

      {/* ======================================
          FOOTER
      ====================================== */}

      <div className="border-t border-slate-200 bg-white px-5 py-4">

        <div className="flex items-center justify-between gap-4">

          <div>

            <p className="text-xs text-slate-400">
              Current Balance
            </p>

            <p
              className={`mt-0.5 text-lg font-bold ${
                balance >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {Math.abs(
                balance
              ).toLocaleString(
                "en-IN"
              )}
            </p>

          </div>

          <div className="text-right">

            <p className="text-xs text-slate-400">
              Account Status
            </p>

            <p
              className={`mt-0.5 text-sm font-semibold ${
                selectedParty.status ===
                "Active"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {selectedParty.status}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

// ==========================================
// INFO ITEM
// ==========================================

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem = ({
  label,
  value,
}: InfoItemProps) => {
  return (
    <div className="min-w-0">

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
};

// ==========================================
// METRIC CARD
// ==========================================

interface MetricCardProps {
  label: string;
  value: string;
  danger?: boolean;
}

const MetricCard = ({
  label,
  value,
  danger = false,
}: MetricCardProps) => {
  return (
    <div
      className={`rounded-xl px-4 py-3 ${
        danger
          ? "bg-red-50"
          : "bg-slate-50"
      }`}
    >

      <p
        className={`text-[10px] font-semibold uppercase tracking-wide ${
          danger
            ? "text-red-400"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-bold ${
          danger
            ? "text-red-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>

    </div>
  );
};

export default LedgerPanel;