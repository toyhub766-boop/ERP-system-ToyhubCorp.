import { useEffect, useRef, useState } from "react";

import LedgerEntryCard from "./LedgerEntryCard";

import {
  updatePartyDueDate,
} from "../services/accountParty.service";

import {
  Trash2,
  Pencil,
  FileText,
  Download,
  ChevronDown,
  CalendarDays,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

interface Props {
  selectedParty: any;
  ledger: any[];
  loading: boolean;

  onMoneyIn: () => void;
  onMoneyOut: () => void;

  onDelete?: (id: string) => void;
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
  const [editingDueDate, setEditingDueDate] =
    useState(false);

  const [dueDateInput, setDueDateInput] =
    useState("");

  const [savingDueDate, setSavingDueDate] =
    useState(false);

  const [exportOpen, setExportOpen] =
    useState(false);

  const exportRef =
    useRef<HTMLDivElement>(null);

  const customer =
    selectedParty?.customerDetails;

  const supplier =
    selectedParty?.supplierDetails;

  const existingDueDate =
    customer?.dueDate ||
    supplier?.dueDate ||
    null;

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

  useEffect(() => {
    setEditingDueDate(false);
    setExportOpen(false);

    setDueDateInput(
      formatInputDate(existingDueDate)
    );
  }, [
    selectedParty?._id,
    existingDueDate,
  ]);

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        exportRef.current &&
        !exportRef.current.contains(
          event.target as Node
        )
      ) {
        setExportOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

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

  const handleCancelDueDate = () => {
    setDueDateInput(
      formatInputDate(existingDueDate)
    );

    setEditingDueDate(false);
  };

  if (!selectedParty) {
    return (
      <div className="flex min-h-[520px] items-center justify-center bg-slate-50 p-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-400 shadow-sm">
            A
          </div>

          <h3 className="mt-5 text-lg font-bold text-slate-900">
            No Party Selected
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select a customer, supplier or
            company expense from the list.
          </p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="flex min-h-0 flex-col bg-[#F7F8FC]">

      {/* =====================================================
          PARTY HEADER
      ===================================================== */}

      <div className="shrink-0 border-b border-slate-200 bg-white p-4 sm:p-5">

        <div className="overflow-visible rounded-2xl bg-[#17357A] shadow-[0_8px_30px_rgba(23,53,122,0.14)]">

          {/* TOP */}

          <div className="p-5 sm:p-6">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

              <div className="flex min-w-0 items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-bold text-white shadow-inner">
                  {initial}
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">

                    <h1 className="break-words text-xl font-bold tracking-tight text-white sm:text-2xl">
                      {selectedParty.companyName}
                    </h1>

                    <span
                      className={`text-xs font-semibold ${
                        selectedParty.status ===
                        "Active"
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      {selectedParty.status}
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-blue-100/80">
                    {selectedParty.contactPerson ||
                      "--"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-blue-50">
                      {selectedParty.partyCode}
                    </span>

                    <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-blue-50">
                      {partyTypeLabel}
                    </span>

                  </div>

                </div>

              </div>

              <div className="shrink-0 lg:min-w-[180px] lg:text-right">

                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-200">
                  Outstanding
                </p>

                <p
                  className={`mt-1 text-3xl font-bold tracking-tight ${
                    balance >= 0
                      ? "text-white"
                      : "text-red-200"
                  }`}
                >
                  ₹
                  {Math.abs(
                    balance
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>

                <p
                  className={`mt-1 text-xs font-semibold ${
                    balance >= 0
                      ? "text-emerald-300"
                      : "text-red-200"
                  }`}
                >
                  {balanceLabel}
                </p>

              </div>

            </div>

          </div>

          {/* ACTION BAR */}

          <div className="relative border-t border-white/10 bg-black/10 px-4 py-3 sm:px-5">

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={onEditParty}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-[0.98]"
              >
                <Pencil size={14} />
                <span className="hidden sm:inline">
                  Edit Party
                </span>
                <span className="sm:hidden">
                  Edit
                </span>
              </button>

              {onDeleteParty && (
                <button
                  type="button"
                  onClick={onDeleteParty}
                  aria-label="Delete party"
                  title="Delete party"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-500 shadow-sm transition hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
                >
                  <Trash2 size={15} />
                </button>
              )}

              <button
                type="button"
                onClick={onViewReport}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-[#17357A] shadow-sm transition hover:bg-blue-50 active:scale-[0.98]"
              >
                <FileText size={14} />
                <span className="hidden sm:inline">
                  View Report
                </span>
                <span className="sm:hidden">
                  Report
                </span>
              </button>

              {/* CLICK EXPORT MENU */}

              <div
                ref={exportRef}
                className="relative ml-auto"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExportOpen(
                      (value) => !value
                    )
                  }
                  aria-expanded={
                    exportOpen
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-[0.98]"
                >
                  <Download size={14} />
                  Export

                  <ChevronDown
                    size={13}
                    className={`transition-transform ${
                      exportOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {exportOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-[100] w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">

                    <button
                      type="button"
                      onClick={() => {
                        setExportOpen(
                          false
                        );
                        onExportPdf();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <FileText
                        size={15}
                        className="text-red-500"
                      />

                      <span>
                        Export PDF
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExportOpen(
                          false
                        );
                        onExportExcel();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <Download
                        size={15}
                        className="text-emerald-600"
                      />

                      <span>
                        Export Excel
                      </span>
                    </button>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          SCROLLABLE CONTENT
      ===================================================== */}

      <div className="min-h-0 flex-1 overflow-y-auto">

        <div className="space-y-5 p-4 sm:p-5">

          {/* CONTACT + BUSINESS */}

          <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900">
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

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900">
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

          {/* COMMERCIAL */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

            <div className="mb-5">
              <h2 className="text-base font-bold text-slate-900">
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
                      Number(
                        customer?.packingCharges ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )
                    }
                  />

                  <MetricCard
                    label="Transport"
                    value={
                      Number(
                        customer?.transportCharges ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )
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
                value={Number(
                  selectedParty.openingBalance ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              />

              <MetricCard
                label="Outstanding"
                value={Math.abs(
                  balance
                ).toLocaleString(
                  "en-IN"
                )}
                danger={
                  balance < 0
                }
              />

            </div>

            {!isExpense && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#17357A] shadow-sm">
                      <CalendarDays
                        size={16}
                      />
                    </div>

                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
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
                          className="mt-1 text-left text-sm font-bold text-[#17357A] transition hover:text-[#10295d]"
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
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#17357A] focus:ring-2 focus:ring-[#17357A]/10"
                          />

                          <button
                            type="button"
                            disabled={
                              savingDueDate
                            }
                            onClick={
                              handleSaveDueDate
                            }
                            className="rounded-lg bg-[#17357A] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#10295d] disabled:opacity-50"
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
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                          >
                            Cancel
                          </button>

                        </div>
                      )}

                    </div>

                  </div>

                  {!editingDueDate && (
                    <p className="text-xs text-slate-400">
                      Click to edit
                    </p>
                  )}

                </div>

              </div>
            )}

          </section>

          {/* TRANSACTION ACTIONS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">
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
                className="group rounded-xl border border-red-100 bg-red-50/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-red-500">
                      Money Out
                    </p>

                    <p className="mt-1 text-base font-bold text-red-700">
                      You Gave
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-500 shadow-sm">
                    <ArrowUpRight
                      size={17}
                    />
                  </div>

                </div>

                <p className="mt-2 text-xs text-red-500/80">
                  Record a payment made to this party.
                </p>
              </button>

              <button
                type="button"
                onClick={onMoneyIn}
                className="group rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-500">
                      Money In
                    </p>

                    <p className="mt-1 text-base font-bold text-emerald-700">
                      You Got
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-500 shadow-sm">
                    <ArrowDownLeft
                      size={17}
                    />
                  </div>

                </div>

                <p className="mt-2 text-xs text-emerald-500/80">
                  Record a payment received from this party.
                </p>
              </button>

            </div>

          </section>

          {/* LEDGER */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

            <div className="border-b border-slate-200 px-5 py-5">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <div className="flex items-center gap-2">
                    <Wallet
                      size={17}
                      className="text-[#17357A]"
                    />

                    <h2 className="text-base font-bold text-slate-900">
                      Account Ledger
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Complete transaction history for this party.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-3 py-2 text-left sm:text-right">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    Transactions
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {ledger.length}
                  </p>

                </div>

              </div>

            </div>

            <div className="p-4 sm:p-5">

              {loading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#17357A]" />

                    <p className="mt-4 text-sm font-medium text-slate-600">
                      Loading transactions...
                    </p>
                  </div>
                </div>
              ) : ledger.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70">

                  <div className="max-w-sm text-center">

                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                      <Wallet size={18} />
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-slate-900">
                      No Transactions Yet
                    </h3>

                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      Record the first transaction using the buttons above.
                    </p>

                  </div>

                </div>
              ) : (
                <div className="space-y-2">
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

      {/* FOOTER */}

      <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-3.5">

        <div className="flex items-center justify-between gap-4">

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Current Balance
            </p>

            <p
              className={`mt-0.5 text-base font-bold ${
                balance >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              ₹
              {Math.abs(
                balance
              ).toLocaleString(
                "en-IN"
              )}
            </p>
          </div>

          <div className="text-right">

            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Account Status
            </p>

            <p
              className={`mt-0.5 text-sm font-semibold ${
                selectedParty.status ===
                "Active"
                  ? "text-emerald-600"
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
};

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
      className={`rounded-xl border p-3.5 ${
        danger
          ? "border-red-100 bg-red-50/70"
          : "border-slate-100 bg-slate-50"
      }`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${
          danger
            ? "text-red-400"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 text-base font-bold ${
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