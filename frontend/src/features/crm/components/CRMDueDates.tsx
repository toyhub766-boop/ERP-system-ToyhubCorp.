import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiAlertCircle,
  FiCalendar,
  FiChevronDown,
  FiClock,
  FiFilter,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  getCRMDueDates,
  updateCRMDueDate,
} from "../services/crmDue.service";

type DueStatus =
  | "OVERDUE"
  | "DUE_TODAY"
  | "UPCOMING"
  | "NO_DUE_DATE";

type StatusFilter = "ALL" | DueStatus;

type BalanceFilter =
  | "ALL"
  | "OUTSTANDING"
  | "NO_OUTSTANDING";

type PaymentTermsFilter =
  | "ALL"
  | "ZERO"
  | "1_15"
  | "16_30"
  | "31_60"
  | "60_PLUS";

interface Salesperson {
  _id: string;
  name: string;
  role?: string;
  status?: string;
}

interface CRMParty {
  _id: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  currentBalance?: number;
  paymentTerms?: number;
  dueDate?: string | null;
  partyType?: string;
  assignedSalespeople?: Salesperson[];
}

const CRMDueDates = () => {
  const [parties, setParties] =
    useState<CRMParty[]>([]);

  const [search, setSearch] =
    useState("");

  /* =========================================================
     FILTERS
  ========================================================= */

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [salespersonFilter, setSalespersonFilter] =
    useState("ALL");

  const [balanceFilter, setBalanceFilter] =
    useState<BalanceFilter>("ALL");

  const [paymentTermsFilter, setPaymentTermsFilter] =
    useState<PaymentTermsFilter>("ALL");

  const [showFilters, setShowFilters] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  /* =========================================================
     INLINE EDITING
  ========================================================= */

  const [editingPartyId, setEditingPartyId] =
    useState<string | null>(null);

  const [dueDateInput, setDueDateInput] =
    useState("");

  const [savingDueDate, setSavingDueDate] =
    useState(false);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadDueDates = async () => {
    try {
      setLoading(true);

      const data =
        await getCRMDueDates();

      setParties(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load CRM due dates:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDueDates();
  }, []);

  /* =========================================================
     DATE HELPERS
  ========================================================= */

  const formatInputDate = (
    value?: string | null
  ) => {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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

  const formatDate = (
    value?: string | null
  ) => {
    if (!value) {
      return "No due date";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Invalid date";
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

  /* =========================================================
     TODAY
  ========================================================= */

  const today = useMemo(() => {
    const date =
      new Date();

    date.setHours(
      0,
      0,
      0,
      0
    );

    return date;
  }, []);

  /* =========================================================
     STATUS
  ========================================================= */

  const getDueStatus = (
    dueDate?: string | null
  ): DueStatus => {
    if (!dueDate) {
      return "NO_DUE_DATE";
    }

    const date =
      new Date(dueDate);

    date.setHours(
      0,
      0,
      0,
      0
    );

    if (date < today) {
      return "OVERDUE";
    }

    if (
      date.getTime() ===
      today.getTime()
    ) {
      return "DUE_TODAY";
    }

    return "UPCOMING";
  };

  /* =========================================================
     AVAILABLE SALESPERSONS
  ========================================================= */

  const salespeople =
    useMemo(() => {
      const map =
        new Map<
          string,
          Salesperson
        >();

      parties.forEach(
        (party) => {
          if (
            !Array.isArray(
              party.assignedSalespeople
            )
          ) {
            return;
          }

          party.assignedSalespeople.forEach(
            (person) => {
              if (
                !person?._id ||
                !person?.name
              ) {
                return;
              }

              map.set(
                person._id,
                person
              );
            }
          );
        }
      );

      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );
    }, [parties]);

  /* =========================================================
     ACTIVE FILTER COUNT
  ========================================================= */

  const activeFilterCount =
    useMemo(() => {
      let count = 0;

      if (
        statusFilter !== "ALL"
      ) {
        count++;
      }

      if (
        salespersonFilter !==
        "ALL"
      ) {
        count++;
      }

      if (
        balanceFilter !== "ALL"
      ) {
        count++;
      }

      if (
        paymentTermsFilter !==
        "ALL"
      ) {
        count++;
      }

      return count;
    }, [
      statusFilter,
      salespersonFilter,
      balanceFilter,
      paymentTermsFilter,
    ]);

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setStatusFilter("ALL");
    setSalespersonFilter("ALL");
    setBalanceFilter("ALL");
    setPaymentTermsFilter("ALL");
  };

  /* =========================================================
     INLINE EDIT START
  ========================================================= */

  const startDueDateEdit = (
    party: CRMParty
  ) => {
    setEditingPartyId(
      party._id
    );

    setDueDateInput(
      formatInputDate(
        party.dueDate
      )
    );
  };

  /* =========================================================
     CANCEL INLINE EDIT
  ========================================================= */

  const cancelDueDateEdit = () => {
    setEditingPartyId(null);
    setDueDateInput("");
  };

  /* =========================================================
     SAVE INLINE DUE DATE
  ========================================================= */

  const saveDueDate = async (
    partyId: string
  ) => {
    try {
      setSavingDueDate(true);

      const updatedParty =
        await updateCRMDueDate(
          partyId,
          dueDateInput || null
        );

      const updatedDueDate =
        updatedParty
          ?.customerDetails
          ?.dueDate ||
        null;

      setParties(
        (current) =>
          current.map(
            (party) =>
              party._id ===
              partyId
                ? {
                    ...party,
                    dueDate:
                      updatedDueDate,
                  }
                : party
          )
      );

      setEditingPartyId(null);
      setDueDateInput("");
    } catch (error) {
      console.error(
        "Failed to update CRM due date:",
        error
      );

      alert(
        "Failed to update due date."
      );
    } finally {
      setSavingDueDate(false);
    }
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredParties =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return parties.filter(
        (party) => {
          /* SEARCH */

          const matchesSearch =
            !query ||
            party.companyName
              ?.toLowerCase()
              .includes(query) ||
            party.contactPerson
              ?.toLowerCase()
              .includes(query) ||
            party.phone
              ?.toLowerCase()
              .includes(query);

          if (!matchesSearch) {
            return false;
          }

          /* STATUS */

          const status =
            getDueStatus(
              party.dueDate
            );

          if (
            statusFilter !==
              "ALL" &&
            status !==
              statusFilter
          ) {
            return false;
          }

          /* SALESPERSON */

          if (
            salespersonFilter !==
            "ALL"
          ) {
            const assigned =
              Array.isArray(
                party.assignedSalespeople
              )
                ? party.assignedSalespeople
                : [];

            const matchesSalesperson =
              assigned.some(
                (person) =>
                  person._id ===
                  salespersonFilter
              );

            if (
              !matchesSalesperson
            ) {
              return false;
            }
          }

          /* BALANCE */

          const balance =
            Number(
              party.currentBalance ||
                0
            );

          if (
            balanceFilter ===
              "OUTSTANDING" &&
            balance <= 0
          ) {
            return false;
          }

          if (
            balanceFilter ===
              "NO_OUTSTANDING" &&
            balance > 0
          ) {
            return false;
          }

          /* PAYMENT TERMS */

          const terms =
            Number(
              party.paymentTerms ||
                0
            );

          if (
            paymentTermsFilter ===
              "ZERO" &&
            terms !== 0
          ) {
            return false;
          }

          if (
            paymentTermsFilter ===
              "1_15" &&
            (terms < 1 ||
              terms > 15)
          ) {
            return false;
          }

          if (
            paymentTermsFilter ===
              "16_30" &&
            (terms < 16 ||
              terms > 30)
          ) {
            return false;
          }

          if (
            paymentTermsFilter ===
              "31_60" &&
            (terms < 31 ||
              terms > 60)
          ) {
            return false;
          }

          if (
            paymentTermsFilter ===
              "60_PLUS" &&
            terms <= 60
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      parties,
      search,
      statusFilter,
      salespersonFilter,
      balanceFilter,
      paymentTermsFilter,
      today,
    ]);

  /* =========================================================
     STATUS GROUPS
  ========================================================= */

  const overdue =
    filteredParties.filter(
      (party) =>
        getDueStatus(
          party.dueDate
        ) === "OVERDUE"
    );

  const dueToday =
    filteredParties.filter(
      (party) =>
        getDueStatus(
          party.dueDate
        ) === "DUE_TODAY"
    );

  const upcoming =
    filteredParties.filter(
      (party) =>
        getDueStatus(
          party.dueDate
        ) === "UPCOMING"
    );

  const noDueDate =
    filteredParties.filter(
      (party) =>
        getDueStatus(
          party.dueDate
        ) === "NO_DUE_DATE"
    );

  /* =========================================================
     AMOUNT
  ========================================================= */

  const formatAmount = (
    value: number
  ) => {
    return Math.abs(
      Number(value || 0)
    ).toLocaleString(
      "en-IN"
    );
  };

  /* =========================================================
     STATUS CONFIG
  ========================================================= */

  const getStatusConfig = (
    status: DueStatus
  ) => {
    switch (status) {
      case "OVERDUE":
        return {
          label: "Overdue",
          dot: "bg-red-500",
          badge:
            "bg-red-50 text-red-700 border-red-100",
          icon: FiAlertCircle,
        };

      case "DUE_TODAY":
        return {
          label: "Due Today",
          dot: "bg-amber-500",
          badge:
            "bg-amber-50 text-amber-700 border-amber-100",
          icon: FiCalendar,
        };

      case "UPCOMING":
        return {
          label: "Upcoming",
          dot: "bg-emerald-500",
          badge:
            "bg-emerald-50 text-emerald-700 border-emerald-100",
          icon: FiClock,
        };

      default:
        return {
          label: "No Due Date",
          dot: "bg-slate-400",
          badge:
            "bg-slate-50 text-slate-600 border-slate-200",
          icon: FiCalendar,
        };
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-7">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div>

          <div
            className="
              mb-3
              flex
              items-center
              gap-2
              text-xs
              font-semibold
              uppercase
              tracking-[0.12em]
              text-[#172B6B]
            "
          >
            <span>CRM</span>

            <span className="text-slate-300">
              /
            </span>

            <span className="text-slate-400">
              Accounts
            </span>
          </div>

          <h1
            className="
              text-md
              font-bold
              tracking-tight
              text-slate-900
              sm:text-2xl
            "
          >
            Due Dates
          </h1>

        </div>

        <div
          className="
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-3.5
            py-2.5
            text-xs
            font-medium
            text-slate-500
            shadow-sm
          "
        >
          <FiUsers
            size={15}
            className="text-[#172B6B]"
          />

          {filteredParties.length}
          {" "}
          customer
          {filteredParties.length !== 1
            ? "s"
            : ""}
        </div>
      </section>

      {/* =====================================================
          SEARCH + FILTERS
      ===================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-3
          shadow-sm
          sm:p-4
        "
      >

        <div
          className="
            flex
            flex-col
            gap-3
            lg:flex-row
            lg:items-center
          "
        >

          {/* SEARCH */}

          <div className="relative max-w-xl flex-1">

            <FiSearch
              size={18}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search customer, contact or phone..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                pl-11
                pr-10
                text-sm
                text-slate-800
                outline-none
                transition-all
                placeholder:text-slate-400
                focus:border-[#172B6B]
                focus:bg-white
                focus:ring-4
                focus:ring-blue-50
              "
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  flex
                  h-7
                  w-7
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <FiX size={15} />
              </button>
            )}

          </div>

          {/* FILTER BUTTON */}

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                (current) =>
                  !current
              )
            }
            className={`
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              px-4
              text-sm
              font-semibold
              transition
              ${
                showFilters ||
                activeFilterCount > 0
                  ? `
                    border-[#172B6B]
                    bg-blue-50
                    text-[#172B6B]
                  `
                  : `
                    border-slate-200
                    bg-white
                    text-slate-600
                    hover:bg-slate-50
                  `
              }
            `}
          >
            <FiFilter size={16} />

            Filters

            {activeFilterCount >
              0 && (
              <span
                className="
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-[#172B6B]
                  px-1.5
                  text-[10px]
                  font-bold
                  text-white
                "
              >
                {activeFilterCount}
              </span>
            )}

            <FiChevronDown
              size={15}
              className={`
                transition-transform
                ${
                  showFilters
                    ? "rotate-180"
                    : ""
                }
              `}
            />
          </button>

        </div>

        {/* ===================================================
            QUICK STATUS FILTERS
        =================================================== */}

        <div
          className="
            mt-4
            flex
            gap-2
            overflow-x-auto
            pb-1
          "
        >

          {[
            {
              value: "ALL",
              label: "All",
            },
            {
              value: "OVERDUE",
              label: "Overdue",
            },
            {
              value: "DUE_TODAY",
              label: "Due Today",
            },
            {
              value: "UPCOMING",
              label: "Upcoming",
            },
            {
              value: "NO_DUE_DATE",
              label: "No Due Date",
            },
          ].map(
            (option) => {
              const active =
                statusFilter ===
                option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      option.value as StatusFilter
                    )
                  }
                  className={`
                    inline-flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-lg
                    border
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    transition
                    ${
                      active
                        ? `
                          border-[#172B6B]
                          bg-[#172B6B]
                          text-white
                        `
                        : `
                          border-slate-200
                          bg-white
                          text-slate-500
                          hover:bg-slate-50
                        `
                    }
                  `}
                >
                  {option.label}

                  {option.value !==
                    "ALL" && (
                    <span
                      className={`
                        rounded-md
                        px-1.5
                        py-0.5
                        text-[10px]
                        ${
                          active
                            ? "bg-white/15 text-white"
                            : "bg-slate-100 text-slate-500"
                        }
                      `}
                    >
                      {
                        option.value ===
                        "OVERDUE"
                          ? overdue.length
                          : option.value ===
                              "DUE_TODAY"
                            ? dueToday.length
                            : option.value ===
                                "UPCOMING"
                              ? upcoming.length
                              : noDueDate.length
                      }
                    </span>
                  )}
                </button>
              );
            }
          )}

        </div>

        {/* ===================================================
            ADVANCED FILTERS
        =================================================== */}

        {showFilters && (
          <div
            className="
              mt-4
              border-t
              border-slate-100
              pt-4
            "
          >

            <div
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-3
              "
            >

              {/* SALESPERSON */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Salesperson
                </label>

                <div className="relative">
                  <select
                    value={
                      salespersonFilter
                    }
                    onChange={(e) =>
                      setSalespersonFilter(
                        e.target.value
                      )
                    }
                    className="
                      h-10
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      pr-9
                      text-sm
                      text-slate-700
                      outline-none
                      focus:border-[#172B6B]
                      focus:ring-2
                      focus:ring-blue-50
                    "
                  >
                    <option value="ALL">
                      All Salespeople
                    </option>

                    {salespeople.map(
                      (person) => (
                        <option
                          key={
                            person._id
                          }
                          value={
                            person._id
                          }
                        >
                          {person.name}
                        </option>
                      )
                    )}
                  </select>

                  <FiChevronDown
                    size={15}
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />
                </div>
              </div>

              {/* BALANCE */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Balance
                </label>

                <div className="relative">
                  <select
                    value={
                      balanceFilter
                    }
                    onChange={(e) =>
                      setBalanceFilter(
                        e.target.value as BalanceFilter
                      )
                    }
                    className="
                      h-10
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      pr-9
                      text-sm
                      text-slate-700
                      outline-none
                      focus:border-[#172B6B]
                      focus:ring-2
                      focus:ring-blue-50
                    "
                  >
                    <option value="ALL">
                      Any Balance
                    </option>

                    <option value="OUTSTANDING">
                      Outstanding
                    </option>

                    <option value="NO_OUTSTANDING">
                      No Outstanding
                    </option>
                  </select>

                  <FiChevronDown
                    size={15}
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />
                </div>
              </div>

              {/* PAYMENT TERMS */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Payment Terms
                </label>

                <div className="relative">
                  <select
                    value={
                      paymentTermsFilter
                    }
                    onChange={(e) =>
                      setPaymentTermsFilter(
                        e.target.value as PaymentTermsFilter
                      )
                    }
                    className="
                      h-10
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      pr-9
                      text-sm
                      text-slate-700
                      outline-none
                      focus:border-[#172B6B]
                      focus:ring-2
                      focus:ring-blue-50
                    "
                  >
                    <option value="ALL">
                      Any Payment Terms
                    </option>

                    <option value="ZERO">
                      0 days
                    </option>

                    <option value="1_15">
                      1–15 days
                    </option>

                    <option value="16_30">
                      16–30 days
                    </option>

                    <option value="31_60">
                      31–60 days
                    </option>

                    <option value="60_PLUS">
                      60+ days
                    </option>
                  </select>

                  <FiChevronDown
                    size={15}
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />
                </div>
              </div>

            </div>

            {/* FILTER FOOTER */}

            <div
              className="
                mt-4
                flex
                flex-col
                gap-3
                border-t
                border-slate-100
                pt-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <p className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-600">
                  {filteredParties.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-600">
                  {parties.length}
                </span>{" "}
                customers
              </p>

              {activeFilterCount >
                0 && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-xs
                    font-semibold
                    text-[#172B6B]
                    hover:underline
                  "
                >
                  <FiX size={13} />
                  Clear Filters
                </button>
              )}

            </div>

          </div>
        )}

      </section>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <div
          className="
            rounded-2xl
            border
            border-red-100
            bg-white
            p-5
            shadow-sm
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-red-50
              text-red-600
            "
          >
            <FiAlertCircle size={18} />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Overdue
          </p>

          <p className="mt-1 text-3xl font-bold text-red-600">
            {overdue.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Requires attention
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-amber-100
            bg-white
            p-5
            shadow-sm
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-amber-50
              text-amber-600
            "
          >
            <FiCalendar size={18} />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Due Today
          </p>

          <p className="mt-1 text-3xl font-bold text-amber-600">
            {dueToday.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Due before end of day
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-emerald-100
            bg-white
            p-5
            shadow-sm
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-emerald-50
              text-emerald-600
            "
          >
            <FiClock size={18} />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Upcoming
          </p>

          <p className="mt-1 text-3xl font-bold text-emerald-600">
            {upcoming.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Future payment dates
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-slate-100
              text-slate-500
            "
          >
            <FiCalendar size={18} />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            No Due Date
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-800">
            {noDueDate.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Payment terms not configured
          </p>
        </div>

      </section>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        <div
          className="
            flex
            flex-col
            gap-2
            border-b
            border-slate-100
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Customer Payment Schedule
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Outstanding balances and payment deadlines
            </p>
          </div>

          <div className="text-xs font-medium text-slate-400">
            {filteredParties.length}
            {" "}
            record
            {filteredParties.length !== 1
              ? "s"
              : ""}
          </div>
        </div>

        <div className="overflow-x-auto">

          <table
            className="
              min-w-[1100px]
              w-full
            "
          >

            <thead>
              <tr
                className="
                  border-b
                  border-slate-100
                  bg-slate-50/70
                  text-left
                "
              >
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Customer
                </th>

                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Contact
                </th>

                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Outstanding
                </th>

                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Payment Terms
                </th>

                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Due Date
                </th>

                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                Array.from({
                  length: 5,
                }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100"
                  >
                    {Array.from({
                      length: 6,
                    }).map(
                      (_, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-5 py-5"
                        >
                          <div
                            className="
                              h-4
                              w-24
                              animate-pulse
                              rounded-md
                              bg-slate-100
                            "
                          />
                        </td>
                      )
                    )}
                  </tr>
                ))
              ) : filteredParties.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16"
                  >
                    <div
                      className="
                        flex
                        flex-col
                        items-center
                        justify-center
                        text-center
                      "
                    >
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-slate-100
                          text-slate-400
                        "
                      >
                        <FiSearch size={20} />
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-slate-800">
                        No customers found
                      </h3>

                      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                        Try changing your search
                        or filters, or add customer
                        payment information through
                        Accounts.
                      </p>

                      {(search ||
                        activeFilterCount >
                          0) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            clearFilters();
                          }}
                          className="
                            mt-4
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-[#172B6B]
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-white
                          "
                        >
                          <FiX size={13} />
                          Clear Search & Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredParties.map(
                  (party) => {
                    const dueDate =
                      party.dueDate;

                    const paymentTerms =
                      party.paymentTerms;

                    const status =
                      getDueStatus(
                        dueDate
                      );

                    const statusConfig =
                      getStatusConfig(
                        status
                      );

                    const StatusIcon =
                      statusConfig.icon;

                    const isEditing =
                      editingPartyId ===
                      party._id;

                    return (
                      <tr
                        key={party._id}
                        className="
                          group
                          border-b
                          border-slate-100
                          last:border-0
                          transition-colors
                          hover:bg-slate-50/70
                        "
                      >

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-50
                                text-xs
                                font-bold
                                text-[#172B6B]
                              "
                            >
                              {party.companyName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "C"}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {party.companyName ||
                                  "Unnamed Customer"}
                              </p>

                              <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                Customer account
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* CONTACT */}

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {party.contactPerson ||
                              "—"}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {party.phone ||
                              "No phone"}
                          </p>
                        </td>

                        {/* OUTSTANDING */}

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-900">
                            ₹
                            {formatAmount(
                              party.currentBalance ||
                                0
                            )}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            Outstanding balance
                          </p>
                        </td>

                        {/* PAYMENT TERMS */}

                        <td className="px-5 py-4">
                          {paymentTerms ? (
                            <span
                              className="
                                inline-flex
                                items-center
                                rounded-lg
                                border
                                border-slate-200
                                bg-slate-50
                                px-2.5
                                py-1.5
                                text-xs
                                font-semibold
                                text-slate-600
                              "
                            >
                              {paymentTerms} days
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Not set
                            </span>
                          )}
                        </td>

                        {/* DUE DATE */}

                        <td className="px-5 py-4">

                          {isEditing ? (
                            <div className="flex items-center gap-2">

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
                                autoFocus
                                className="
                                  h-9
                                  w-[150px]
                                  rounded-lg
                                  border
                                  border-slate-300
                                  bg-white
                                  px-2.5
                                  text-sm
                                  font-medium
                                  text-slate-700
                                  outline-none
                                  focus:border-[#172B6B]
                                  focus:ring-2
                                  focus:ring-blue-100
                                "
                              />

                              <button
                                type="button"
                                disabled={
                                  savingDueDate
                                }
                                onClick={() =>
                                  saveDueDate(
                                    party._id
                                  )
                                }
                                className="
                                  h-9
                                  rounded-lg
                                  bg-[#172B6B]
                                  px-3
                                  text-xs
                                  font-semibold
                                  text-white
                                  transition
                                  hover:bg-[#223a88]
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
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
                                  cancelDueDateEdit
                                }
                                className="
                                  h-9
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  px-3
                                  text-xs
                                  font-semibold
                                  text-slate-600
                                  transition
                                  hover:bg-slate-50
                                  disabled:opacity-50
                                "
                              >
                                Cancel
                              </button>

                            </div>
                          ) : (

                            <button
                              type="button"
                              onClick={() =>
                                startDueDateEdit(
                                  party
                                )
                              }
                              className="
                                group
                                flex
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-transparent
                                px-2
                                py-1.5
                                text-left
                                transition
                                hover:border-slate-200
                                hover:bg-slate-50
                              "
                            >

                              <FiCalendar
                                size={14}
                                className="
                                  shrink-0
                                  text-slate-400
                                  group-hover:text-[#172B6B]
                                "
                              />

                              <span
                                className="
                                  text-sm
                                  font-medium
                                  text-slate-700
                                "
                              >
                                {formatDate(
                                  dueDate
                                )}
                              </span>

                              <span
                                className="
                                  ml-1
                                  text-[10px]
                                  font-semibold
                                  text-[#172B6B]
                                  opacity-0
                                  transition
                                  group-hover:opacity-100
                                "
                              >
                                Edit
                              </span>

                            </button>

                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              border
                              px-3
                              py-1.5
                              text-[11px]
                              font-bold
                              ${statusConfig.badge}
                            `}
                          >
                            <span
                              className={`
                                h-1.5
                                w-1.5
                                rounded-full
                                ${statusConfig.dot}
                              `}
                            />

                            <StatusIcon
                              size={12}
                            />

                            {statusConfig.label}
                          </span>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        {!loading &&
          filteredParties.length >
            0 && (
            <div
              className="
                flex
                flex-col
                gap-1
                border-t
                border-slate-100
                bg-slate-50/50
                px-5
                py-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <p className="text-[11px] text-slate-400">
                Due dates are managed directly
                from CRM and saved to Accounts.
              </p>

              <p className="text-[11px] font-medium text-slate-400">
                {filteredParties.length}
                {" "}
                customer
                {filteredParties.length !==
                1
                  ? "s"
                  : ""}
              </p>
            </div>
          )}

      </section>

    </div>
  );
};

export default CRMDueDates;