import {
  useEffect,
  useState,
} from "react";

import type {
  MouseEvent,
} from "react";

import {
  FiCalendar,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiPhone,
  FiX,
} from "react-icons/fi";

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
  const customer =
    party.customerDetails;

  const supplier =
    party.supplierDetails;

  const existingDueDate =
    customer?.dueDate ||
    supplier?.dueDate ||
    null;

  const balance = Number(
    party.currentBalance || 0
  );

  const [
    editingDueDate,
    setEditingDueDate,
  ] = useState(false);

  const [dueDate, setDueDate] =
    useState("");

  const [
    savingDueDate,
    setSavingDueDate,
  ] = useState(false);

  /*
   * =========================================================
   * DATE HELPERS
   * =========================================================
   */

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
        date.getTimezoneOffset() *
          60000
    )
      .toISOString()
      .split("T")[0];
  };

  const formatDisplayDate = (
    value: string | Date | null
  ) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
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

  /*
   * =========================================================
   * INITIALISE DUE DATE
   * =========================================================
   */

  useEffect(() => {
    setDueDate(
      formatInputDate(
        existingDueDate
      )
    );
  }, [existingDueDate]);

  /*
   * =========================================================
   * DUE DATE SAVE
   * =========================================================
   */

  const handleSaveDueDate = async (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();

    try {
      setSavingDueDate(true);

      const updatedParty =
        await updatePartyDueDate(
          party._id,
          dueDate || null
        );

      /*
       * Keep the existing parent data structure
       * working exactly as before.
       */

      if (
        party.partyType ===
        "CUSTOMER"
      ) {
        party.customerDetails =
          updatedParty.customerDetails;
      }

      if (
        party.partyType ===
        "SUPPLIER"
      ) {
        party.supplierDetails =
          updatedParty.supplierDetails;
      }

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

  /*
   * =========================================================
   * CANCEL DUE DATE
   * =========================================================
   */

  const handleCancelDueDate = (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();

    setDueDate(
      formatInputDate(
        existingDueDate
      )
    );

    setEditingDueDate(false);
  };

  /*
   * =========================================================
   * PARTY TYPE
   * =========================================================
   */

  const partyTypeLabel =
    party.partyType ===
    "COMPANY_EXPENSE"
      ? "Company Expense"
      : party.partyType ===
        "CUSTOMER"
      ? "Customer"
      : party.partyType ===
        "SUPPLIER"
      ? "Supplier"
      : party.partyType || "Party";

  const partyTypeStyle =
    party.partyType ===
    "CUSTOMER"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : party.partyType ===
        "SUPPLIER"
      ? "bg-violet-50 text-violet-700 border-violet-100"
      : "bg-amber-50 text-amber-700 border-amber-100";

  /*
   * =========================================================
   * BALANCE STATE
   * =========================================================
   */

  const balanceLabel =
    balance > 0
      ? "Receivable"
      : balance < 0
      ? "Payable"
      : "Settled";

  const balanceClass =
    balance > 0
      ? "text-emerald-600"
      : balance < 0
      ? "text-red-600"
      : "text-slate-600";

  /*
   * =========================================================
   * INITIAL
   * =========================================================
   */

  const initial =
    party.companyName
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() ||
    "?";

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      onClick={onClick}
      className={`
        group
        relative
        cursor-pointer
        overflow-hidden
        rounded-2xl
        border
        bg-white
        p-4
        transition-all
        duration-200
        ${
          selected
            ? `
              border-[#17357A]/30
              bg-blue-50/50
              shadow-[0_8px_30px_rgba(23,53,122,0.08)]
            `
            : `
              border-slate-200
              hover:border-slate-300
              hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]
            `
        }
      `}
    >

      {/* =====================================================
          SELECTION INDICATOR
      ===================================================== */}

      {selected && (
        <div
          className="
            absolute
            left-0
            top-4
            h-10
            w-1
            rounded-r-full
            bg-[#17357A]
          "
        />
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-start gap-3">

        {/* Avatar */}

        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-sm
            font-bold
            transition-all
            ${
              selected
                ? "bg-[#17357A] text-white shadow-sm"
                : "bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-[#17357A]"
            }
          `}
        >
          {initial}
        </div>

        {/* Identity */}

        <div className="min-w-0 flex-1">

          <div className="flex items-start gap-2">

            <div className="min-w-0 flex-1">

              <h3
                className="
                  truncate
                  text-sm
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                {party.companyName ||
                  "Unnamed Party"}
              </h3>

              <p
                className="
                  mt-0.5
                  truncate
                  text-xs
                  text-slate-500
                "
              >
                {party.contactPerson ||
                  "No contact person"}
              </p>

            </div>

            {/* Active indicator */}

            {party.status ===
              "Active" && (
              <span
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1
                  rounded-full
                  bg-emerald-50
                  px-2
                  py-1
                  text-[9px]
                  font-bold
                  text-emerald-600
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-emerald-500
                  "
                />
                Active
              </span>
            )}

          </div>

          {/* Phone */}

          {customer?.transportPhone && (
            <div
              className="
                mt-1.5
                flex
                items-center
                gap-1
                text-[11px]
                text-slate-500
              "
            >
              <FiPhone
                size={11}
              />

              <span>
                {customer.transportPhone}
              </span>
            </div>
          )}

        </div>

        {/* Chevron */}

        <FiChevronRight
          size={16}
          className={`
            mt-1
            shrink-0
            transition-all
            ${
              selected
                ? "translate-x-0 text-[#17357A]"
                : "-translate-x-1 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
            }
          `}
        />

      </div>

      {/* =====================================================
          PARTY META
      ===================================================== */}

      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          gap-2
        "
      >

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
          "
        >

          <span
            className="
              truncate
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-slate-400
            "
          >
            {party.partyCode ||
              "NO CODE"}
          </span>

          <span
            className="
              h-1
              w-1
              shrink-0
              rounded-full
              bg-slate-300
            "
          />

          <span
            className={`
              shrink-0
              rounded-md
              border
              px-2
              py-1
              text-[9px]
              font-bold
              uppercase
              tracking-wide
              ${partyTypeStyle}
            `}
          >
            {partyTypeLabel}
          </span>

        </div>

      </div>

      {/* =====================================================
          FINANCIAL SUMMARY
      ===================================================== */}

      <div
        className="
          mt-4
          grid
          grid-cols-2
          overflow-hidden
          rounded-xl
          border
          border-slate-100
          bg-slate-50/70
        "
      >

        {/* Outstanding */}

        <div className="p-3">

          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-slate-400
            "
          >
            Outstanding
          </p>

          <div
            className="
              mt-1
              flex
              items-baseline
              gap-1
            "
          >

            <span
              className={`
                text-base
                font-bold
                ${balanceClass}
              `}
            >
              ₹
              {Math.abs(
                balance
              ).toLocaleString(
                "en-IN"
              )}
            </span>

          </div>

          <p
            className={`
              mt-0.5
              text-[10px]
              font-medium
              ${balanceClass}
            `}
          >
            {balanceLabel}
          </p>

        </div>

        {/* Due Date */}

        <div
          className="
            border-l
            border-slate-100
            p-3
          "
          onClick={(e) =>
            e.stopPropagation()
          }
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
            Due Date
          </p>

          {!editingDueDate ? (

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditingDueDate(
                  true
                );
              }}
              className="
                mt-1
                flex
                items-center
                gap-1.5
                text-left
                text-xs
                font-semibold
                text-slate-700
                transition
                hover:text-[#17357A]
              "
            >

              <FiCalendar
                size={12}
                className="
                  text-slate-400
                "
              />

              <span>
                {existingDueDate
                  ? formatDisplayDate(
                      existingDueDate
                    )
                  : "Set date"}
              </span>

            </button>

          ) : (

            <div className="mt-1">

              <div
                className="
                  flex
                  items-center
                  gap-1
                "
              >

                <FiCalendar
                  size={13}
                  className="
                    shrink-0
                    text-[#17357A]
                  "
                />

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
                  className="
                    h-7
                    min-w-0
                    flex-1
                    rounded-md
                    border
                    border-slate-200
                    bg-white
                    px-1.5
                    text-[10px]
                    text-slate-700
                    outline-none
                    transition
                    focus:border-[#17357A]
                    focus:ring-2
                    focus:ring-blue-50
                  "
                />

              </div>

              <div
                className="
                  mt-2
                  flex
                  gap-1.5
                "
              >

                <button
                  type="button"
                  disabled={
                    savingDueDate
                  }
                  onClick={
                    handleSaveDueDate
                  }
                  className="
                    inline-flex
                    h-7
                    items-center
                    gap-1
                    rounded-md
                    bg-[#17357A]
                    px-2
                    text-[10px]
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#10295d]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <FiCheck
                    size={11}
                  />

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
                    inline-flex
                    h-7
                    items-center
                    gap-1
                    rounded-md
                    border
                    border-slate-200
                    bg-white
                    px-2
                    text-[10px]
                    font-medium
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    disabled:opacity-50
                  "
                >
                  <FiX
                    size={11}
                  />

                  Cancel
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          FOOTER STATUS
      ===================================================== */}

      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          text-[10px]
        "
      >

        <div
          className="
            flex
            items-center
            gap-1.5
            text-slate-400
          "
        >

          <FiClock
            size={11}
          />

          <span>
            {existingDueDate
              ? "Payment schedule set"
              : "No payment schedule"}
          </span>

        </div>

        {selected && (
          <span
            className="
              font-semibold
              text-[#17357A]
            "
          >
            Selected
          </span>
        )}

      </div>

    </div>
  );
};

export default PartyCard;