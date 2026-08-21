import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

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

  const [savedDueDate, setSavedDueDate] =
    useState<string | null>(null);

  const [savingDueDate, setSavingDueDate] =
    useState(false);

  const [exportOpen, setExportOpen] =
    useState(false);

  const exportRef =
    useRef<HTMLDivElement>(null);

  /* ============================================================
     PARTY DATA
  ============================================================ */

  const customer =
    selectedParty?.customerDetails;

  const supplier =
    selectedParty?.supplierDetails;

  const existingDueDate =
    customer?.dueDate ||
    supplier?.dueDate ||
    null;

  const effectiveDueDate =
    savedDueDate ?? existingDueDate;

  /* ============================================================
     DATE HELPERS
  ============================================================ */

  const formatInputDate = (
    value: string | Date | null
  ) => {
    if (!value) {
      return "";
    }

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
    if (!value) {
      return "--";
    }

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

  /* ============================================================
     RESET WHEN PARTY CHANGES
  ============================================================ */

  useEffect(() => {
    setEditingDueDate(false);
    setExportOpen(false);
    setSavedDueDate(null);

    setDueDateInput(
      formatInputDate(existingDueDate)
    );
  }, [selectedParty?._id]);

  /* ============================================================
     CLOSE EXPORT MENU WHEN CLICKING OUTSIDE
  ============================================================ */

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

  /* ============================================================
     SAVE DUE DATE
  ============================================================ */

  const handleSaveDueDate = async () => {
    if (!selectedParty) {
      return;
    }

    try {
      setSavingDueDate(true);

      const updatedParty =
        await updatePartyDueDate(
          selectedParty._id,
          dueDateInput || null
        );

      const updatedDate =
        updatedParty?.customerDetails?.dueDate ||
        updatedParty?.supplierDetails?.dueDate ||
        null;

      setSavedDueDate(updatedDate);

      setDueDateInput(
        formatInputDate(updatedDate)
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

  /* ============================================================
     CANCEL DUE DATE
  ============================================================ */

  const handleCancelDueDate = () => {
    setDueDateInput(
      formatInputDate(effectiveDueDate)
    );

    setEditingDueDate(false);
  };

  /* ============================================================
     NO PARTY SELECTED
  ============================================================ */

  if (!selectedParty) {
    return (
      <div
        className="
          flex
          h-full
          min-h-0
          flex-col
          overflow-hidden
          bg-[#F7F8FC]
        "
      >
        <div
          className="
            shrink-0
            border-b
            border-slate-200
            bg-white
            px-5
            py-5
            sm:px-6
          "
        >
          <h2 className="text-lg font-bold text-slate-900">
            Accounts
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a customer, supplier or company
            expense from the list.
          </p>
        </div>

        <div
          className="
            flex
            min-h-0
            flex-1
            items-center
            justify-center
            overflow-y-auto
            p-6
          "
        >
          <div className="max-w-sm text-center">
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-white
                text-xl
                font-bold
                text-slate-400
                shadow-sm
                ring-1
                ring-slate-200
              "
            >
              A
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No Party Selected
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Select a party to view account details,
              balance and transactions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     DERIVED DATA
  ============================================================ */

  const balance =
    Number(
      selectedParty.currentBalance || 0
    );

  const isCustomer =
    selectedParty.partyType === "CUSTOMER";

  const isSupplier =
    selectedParty.partyType === "SUPPLIER";

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
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "?";

  const partyTypeLabel = isExpense
    ? "COMPANY EXPENSE"
    : isCustomer
    ? "CUSTOMER"
    : "SUPPLIER";

  const balanceLabel =
    balance >= 0
      ? "You'll Get"
      : "You'll Give";

  const balanceColor =
    balance >= 0
      ? "text-emerald-400"
      : "text-red-400";

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        min-w-0
        flex-col
        overflow-hidden
        bg-[#F7F8FC]
      "
    >
      {/* ========================================================
          FIXED PARTY HEADER
      ======================================================== */}

      <header
        className="
          relative
          z-30
          shrink-0
          border-b
          border-slate-200
          bg-white
          p-3
          sm:p-4
        "
      >
        <div
          className="
            overflow-visible
            rounded-2xl
            bg-[#17357A]
            shadow-[0_8px_25px_rgba(23,53,122,0.18)]
          "
        >
          {/* PARTY SUMMARY */}

          <div
            className="
              flex
              items-start
              justify-between
              gap-4
              px-4
              py-4
              sm:px-5
              sm:py-5
            "
          >
            <div
              className="
                flex
                min-w-0
                items-start
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/10
                  text-sm
                  font-bold
                  text-white
                  ring-1
                  ring-white/20
                "
              >
                {initial}
              </div>

              <div className="min-w-0">
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-x-2
                    gap-y-1
                  "
                >
                  <h1
                    className="
                      truncate
                      text-base
                      font-bold
                      text-white
                      sm:text-lg
                    "
                  >
                    {selectedParty.companyName}
                  </h1>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-[10px]
                      font-semibold
                      text-emerald-300
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {selectedParty.status ||
                      "Active"}
                  </span>
                </div>

                <p className="mt-0.5 truncate text-xs text-blue-100">
                  {selectedParty.contactPerson ||
                    "--"}
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span
                    className="
                      rounded-md
                      bg-white/10
                      px-2
                      py-1
                      text-[10px]
                      font-semibold
                      text-white
                    "
                  >
                    {selectedParty.partyCode ||
                      "--"}
                  </span>

                  <span
                    className="
                      rounded-md
                      bg-white/10
                      px-2
                      py-1
                      text-[10px]
                      font-semibold
                      text-blue-100
                    "
                  >
                    {partyTypeLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* BALANCE */}

            <div className="shrink-0 text-right">
              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  text-blue-200
                "
              >
                Outstanding
              </p>

              <p
                className="
                  mt-0.5
                  text-xl
                  font-bold
                  tracking-tight
                  text-white
                  sm:text-2xl
                "
              >
                ₹
                {Math.abs(
                  balance
                ).toLocaleString("en-IN")}
              </p>

              <p
                className={`
                  mt-0.5
                  text-[10px]
                  font-semibold
                  ${balanceColor}
                `}
              >
                {balanceLabel}
              </p>
            </div>
          </div>

          {/* ACTION BAR */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
              border-t
              border-white/10
              px-4
              py-3
              sm:px-5
            "
          >
            <button
              type="button"
              onClick={onEditParty}
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                bg-white
                px-3
                py-2
                text-xs
                font-semibold
                text-[#17357A]
                shadow-sm
                transition
                hover:bg-blue-50
                active:scale-[0.98]
              "
            >
              <Pencil size={13} />
              Edit Party
            </button>

            <button
  type="button"
  onClick={() => {
  console.log("DELETE BUTTON CLICKED");
  console.log("onDeleteParty:", onDeleteParty);

  onDeleteParty?.();
}}
  title="Delete party"
  aria-label="Delete party"
  className="
    inline-flex
    h-8
    w-8
    items-center
    justify-center
    rounded-lg
    bg-white
    text-red-500
    shadow-sm
    transition
    hover:bg-red-50
    active:scale-[0.98]
  "
>
  <Trash2 size={14} />
</button>

            <button
              type="button"
              onClick={onViewReport}
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                bg-white
                px-3
                py-2
                text-xs
                font-semibold
                text-[#17357A]
                shadow-sm
                transition
                hover:bg-blue-50
                active:scale-[0.98]
              "
            >
              <FileText size={13} />
              View Report
            </button>

            {/* CLICK-BASED EXPORT MENU */}

            <div
              ref={exportRef}
              className="
                relative
                ml-auto
              "
            >
              <button
                type="button"
                onClick={() =>
                  setExportOpen(
                    (open) => !open
                  )
                }
                aria-expanded={exportOpen}
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-lg
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-[#17357A]
                  shadow-sm
                  transition
                  hover:bg-blue-50
                  active:scale-[0.98]
                "
              >
                <Download size={13} />
                Export
                <ChevronDown
                  size={13}
                  className={
                    exportOpen
                      ? "rotate-180 transition-transform"
                      : "transition-transform"
                  }
                />
              </button>

              {exportOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-[calc(100%+8px)]
                    z-[100]
                    w-48
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-1
                    shadow-[0_15px_40px_rgba(15,23,42,0.18)]
                  "
                >
                  <button
                    type="button"
                    onClick={() => {
                      setExportOpen(false);
                      onExportPdf();
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-2.5
                      rounded-lg
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-semibold
                      text-slate-700
                      transition
                      hover:bg-slate-50
                    "
                  >
                    <span
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        bg-red-50
                        text-red-500
                      "
                    >
                      <FileText size={13} />
                    </span>

                    Export PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setExportOpen(false);
                      onExportExcel();
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-2.5
                      rounded-lg
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-semibold
                      text-slate-700
                      transition
                      hover:bg-slate-50
                    "
                  >
                    <span
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        bg-emerald-50
                        text-emerald-600
                      "
                    >
                      <Download size={13} />
                    </span>

                    Export Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          ONLY SCROLL CONTAINER
      ======================================================== */}

      <main
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          px-3
          py-3
          sm:px-4
          sm:py-4
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-4xl
            space-y-4
            pb-2
          "
        >
          {/* ====================================================
              RECORD TRANSACTION
          ==================================================== */}

          <InfoSection
            title="Record Transaction"
            description="Record money given to or received from this party."
          >
            <div
              className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
              "
            >
              <TransactionAction
                type="out"
                onClick={onMoneyOut}
              />

              <TransactionAction
                type="in"
                onClick={onMoneyIn}
              />
            </div>
          </InfoSection>

          {/* ====================================================
              ACCOUNT LEDGER
          ==================================================== */}

          <section
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-[0_2px_12px_rgba(15,23,42,0.04)]
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                border-b
                border-slate-200
                px-4
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-5
              "
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Wallet
                    size={16}
                    className="shrink-0 text-[#17357A]"
                  />

                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    Account Ledger
                  </h2>
                </div>

                <p className="mt-1 text-[11px] text-slate-500">
                  Complete transaction history for this party.
                </p>
              </div>

              <div
                className="
                  w-fit
                  rounded-lg
                  bg-slate-50
                  px-3
                  py-2
                  sm:text-right
                "
              >
                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                  "
                >
                  Transactions
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {ledger.length}
                </p>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              {loading ? (
                <div
                  className="
                    flex
                    min-h-[180px]
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-50
                  "
                >
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600">
                      Loading transactions...
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Please wait.
                    </p>
                  </div>
                </div>
              ) : ledger.length === 0 ? (
                <div
                  className="
                    flex
                    min-h-[180px]
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-dashed
                    border-slate-200
                    bg-slate-50/70
                    p-6
                  "
                >
                  <div className="max-w-sm text-center">
                    <div
                      className="
                        mx-auto
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        text-slate-400
                        shadow-sm
                        ring-1
                        ring-slate-200
                      "
                    >
                      <Wallet size={17} />
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-slate-900">
                      No Transactions Yet
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Record the first transaction
                      using the buttons above.
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-100
                  "
                >
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

          {/* ====================================================
              COMMERCIAL INFORMATION
          ==================================================== */}

          <InfoSection
            title="Commercial Information"
            description="Account terms, balances and payment details."
          >
            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                xl:grid-cols-5
              "
            >
              {isCustomer && (
                <>
                  <MetricCard
                    label="Packing"
                    value={Number(
                      customer?.packingCharges ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  />

                  <MetricCard
                    label="Transport"
                    value={Number(
                      customer?.transportCharges ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
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
                danger={balance < 0}
              />
            </div>

            {!isExpense && (
              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-4
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-white
                        text-[#17357A]
                        shadow-sm
                        ring-1
                        ring-slate-200
                      "
                    >
                      <CalendarDays size={15} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.08em]
                          text-slate-400
                        "
                      >
                        Due Date
                      </p>

                      {!editingDueDate ? (
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {formatDisplayDate(
                            effectiveDueDate
                          )}
                        </p>
                      ) : (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <input
                            type="date"
                            value={
                              dueDateInput
                            }
                            onChange={(event) =>
                              setDueDateInput(
                                event.target.value
                              )
                            }
                            className="
                              h-9
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              px-2.5
                              text-xs
                              font-medium
                              text-slate-700
                              outline-none
                              ring-[#17357A]/20
                              focus:border-[#17357A]
                              focus:ring-2
                            "
                          />

                          <button
                            type="button"
                            disabled={
                              savingDueDate
                            }
                            onClick={
                              handleSaveDueDate
                            }
                            className="
                              rounded-lg
                              bg-[#17357A]
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-white
                              transition
                              hover:bg-[#10295d]
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                            "
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
                            className="
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-slate-600
                              transition
                              hover:bg-slate-50
                            "
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {!editingDueDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setDueDateInput(
                          formatInputDate(
                            effectiveDueDate
                          )
                        );

                        setEditingDueDate(
                          true
                        );
                      }}
                      className="
                        inline-flex
                        shrink-0
                        items-center
                        gap-1.5
                        self-start
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-[#17357A]
                        shadow-sm
                        transition
                        hover:border-[#17357A]/20
                        hover:bg-blue-50
                        sm:self-auto
                      "
                    >
                      <Pencil size={12} />
                      Edit Due Date
                    </button>
                  )}
                </div>
              </div>
            )}
          </InfoSection>

          {/* ====================================================
              BUSINESS INFORMATION
          ==================================================== */}

          <InfoSection
            title="Business Information"
            description="Registration and business-specific details."
          >
            {!isExpense ? (
              <div
                className="
                  grid
                  grid-cols-1
                  gap-x-8
                  gap-y-5
                  sm:grid-cols-2
                "
              >
                <InfoItem
                  label="Firm Name"
                  value={
                    selectedParty.firmName ||
                    "--"
                  }
                />

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
              <div className="grid gap-5 sm:grid-cols-2">
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
          </InfoSection>

          {/* ====================================================
              CONTACT INFORMATION
          ==================================================== */}

          <InfoSection
            title="Contact Information"
            description="Party contact and address details."
          >
            <div
              className="
                grid
                grid-cols-1
                gap-x-8
                gap-y-5
                sm:grid-cols-2
              "
            >
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
          </InfoSection>
        </div>
      </main>

      {/* ========================================================
          FIXED BALANCE FOOTER
      ======================================================== */}

      <footer
        className="
          shrink-0
          border-t
          border-slate-200
          bg-white
          px-4
          py-3
          sm:px-5
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
          <div>
            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.08em]
                text-slate-400
              "
            >
              Current Balance
            </p>

            <p
              className={`
                mt-0.5
                text-sm
                font-bold
                ${
                  balance >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }
              `}
            >
              ₹
              {Math.abs(
                balance
              ).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="text-right">
            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.08em]
                text-slate-400
              "
            >
              Account Status
            </p>

            <p
              className={`
                mt-0.5
                text-xs
                font-semibold
                ${
                  selectedParty.status ===
                  "Active"
                    ? "text-emerald-600"
                    : "text-red-600"
                }
              `}
            >
              {selectedParty.status ||
                "Active"}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ================================================================
   INFO SECTION
================================================================ */

interface InfoSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const InfoSection = ({
  title,
  description,
  children,
}: InfoSectionProps) => {
  return (
    <section
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
        sm:p-5
      "
    >
      <div className="mb-4">
        <h2
          className="
            text-sm
            font-bold
            text-slate-900
            sm:text-base
          "
        >
          {title}
        </h2>

        {description && (
          <p
            className="
              mt-1
              text-[11px]
              leading-5
              text-slate-500
            "
          >
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
};

/* ================================================================
   INFO ITEM
================================================================ */

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
      <p
        className="
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.08em]
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          break-words
          text-xs
          font-semibold
          leading-5
          text-slate-800
          sm:text-sm
        "
      >
        {value}
      </p>
    </div>
  );
};

/* ================================================================
   METRIC CARD
================================================================ */

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
      className={`
        min-w-0
        rounded-xl
        border
        p-3
        ${
          danger
            ? "border-red-100 bg-red-50/70"
            : "border-slate-100 bg-slate-50"
        }
      `}
    >
      <p
        className={`
          truncate
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.08em]
          ${
            danger
              ? "text-red-400"
              : "text-slate-400"
          }
        `}
      >
        {label}
      </p>

      <p
        className={`
          mt-1
          truncate
          text-sm
          font-bold
          ${
            danger
              ? "text-red-600"
              : "text-slate-900"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
};

/* ================================================================
   TRANSACTION ACTION
================================================================ */

interface TransactionActionProps {
  type: "in" | "out";
  onClick: () => void;
}

const TransactionAction = ({
  type,
  onClick,
}: TransactionActionProps) => {
  const isIn = type === "in";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        rounded-xl
        border
        p-4
        text-left
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-sm
        active:scale-[0.99]
        ${
          isIn
            ? "border-emerald-100 bg-emerald-50/60 hover:border-emerald-200 hover:bg-emerald-50"
            : "border-red-100 bg-red-50/60 hover:border-red-200 hover:bg-red-50"
        }
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className={`
              text-[9px]
              font-bold
              uppercase
              tracking-[0.08em]
              ${
                isIn
                  ? "text-emerald-500"
                  : "text-red-500"
              }
            `}
          >
            {isIn
              ? "Money In"
              : "Money Out"}
          </p>

          <p
            className={`
              mt-0.5
              text-sm
              font-bold
              ${
                isIn
                  ? "text-emerald-700"
                  : "text-red-700"
              }
            `}
          >
            {isIn
              ? "You Got"
              : "You Gave"}
          </p>
        </div>

        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-white
            shadow-sm
          "
        >
          {isIn ? (
            <ArrowDownLeft
              size={15}
              className="text-emerald-500"
            />
          ) : (
            <ArrowUpRight
              size={15}
              className="text-red-500"
            />
          )}
        </div>
      </div>

      <p
        className={`
          mt-2
          text-[11px]
          leading-4
          ${
            isIn
              ? "text-emerald-600/80"
              : "text-red-600/80"
          }
        `}
      >
        {isIn
          ? "Record a payment received from this party."
          : "Record a payment made to this party."}
      </p>
    </button>
  );
};

export default LedgerPanel;