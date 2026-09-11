import {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiAlertCircle,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCreditCard,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  getCRMDueDates,
  updateCRMDueDate,
} from "../services/crmDue.service";

import {
  getPartyLedger,
} from "../../accounts/services/accountTransaction.service";

type DueStatus =
  | "OVERDUE"
  | "DUE_TODAY"
  | "UPCOMING"
  | "NO_DUE_DATE";

type StatusFilter =
  | "ALL"
  | DueStatus;

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
  companyName: string;
  contactPerson: string;
  phone: string;
  currentBalance: number;
  paymentTerms: number;
  dueDate?: string | null;
  partyType: string;
  assignedSalespeople?: Salesperson[];
}

interface LedgerTransaction {
  _id?: string;
  date?: string;
  transactionType?: string;
  amount?: number;
  paymentMethod?: string;
  remarks?: string;
  balanceAfterTransaction?: number;
  createdBy?: {
    _id?: string;
    name?: string;
  } | null;
}

const CRMDueDates = () => {
  const [parties, setParties] =
    useState<CRMParty[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [showStats, setShowStats] =
    useState(false);

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

  const [editingPartyId, setEditingPartyId] =
    useState<string | null>(null);

  const [dueDateInput, setDueDateInput] =
    useState("");

  const [savingDueDate, setSavingDueDate] =
    useState(false);

  const [expandedPartyId, setExpandedPartyId] =
    useState<string | null>(null);

  const [ledgerLoadingId, setLedgerLoadingId] =
    useState<string | null>(null);

  const [ledgerByParty, setLedgerByParty] =
    useState<
      Record<
        string,
        LedgerTransaction[]
      >
    >({});

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

      setParties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDueDates();
  }, []);

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(
      0,
      0,
      0,
      0
    );

    return date;
  }, []);

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

  const formatTransactionDate = (
    value?: string
  ) => {
    if (!value) {
      return "--";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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

  const formatAmount = (
    value?: number
  ) => {
    return Math.abs(
      Number(value || 0)
    ).toLocaleString(
      "en-IN"
    );
  };

  const getDueStatus = (
    dueDate?: string | null
  ): DueStatus => {
    if (!dueDate) {
      return "NO_DUE_DATE";
    }

    const date =
      new Date(dueDate);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "NO_DUE_DATE";
    }

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

  const getStatusConfig = (
    status: DueStatus
  ) => {
    switch (status) {
      case "OVERDUE":
        return {
          label: "Overdue",
          dot: "bg-red-500",
          badge:
            "border-red-100 bg-red-50 text-red-700",
          icon: FiAlertCircle,
        };

      case "DUE_TODAY":
        return {
          label: "Due Today",
          dot: "bg-amber-500",
          badge:
            "border-amber-100 bg-amber-50 text-amber-700",
          icon: FiCalendar,
        };

      case "UPCOMING":
        return {
          label: "Upcoming",
          dot: "bg-emerald-500",
          badge:
            "border-emerald-100 bg-emerald-50 text-emerald-700",
          icon: FiClock,
        };

      default:
        return {
          label: "No Due Date",
          dot: "bg-slate-400",
          badge:
            "border-slate-200 bg-slate-50 text-slate-600",
          icon: FiCalendar,
        };
    }
  };

  const salespeople = useMemo(() => {
    const map =
      new Map<
        string,
        Salesperson
      >();

    parties.forEach(
      (party) => {
        (
          party.assignedSalespeople ||
          []
        ).forEach(
          (person) => {
            if (
              person._id &&
              person.name
            ) {
              map.set(
                person._id,
                person
              );
            }
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

  const clearFilters = () => {
    setStatusFilter("ALL");
    setSalespersonFilter("ALL");
    setBalanceFilter("ALL");
    setPaymentTermsFilter("ALL");
  };

  const filteredParties =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return parties.filter(
        (party) => {
          const searchText =
            [
              party.companyName,
              party.contactPerson,
              party.phone,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          if (
            query &&
            !searchText.includes(
              query
            )
          ) {
            return false;
          }

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

          if (
            salespersonFilter !==
            "ALL"
          ) {
            const assigned =
              party.assignedSalespeople ||
              [];

            const matchesSalesperson =
              assigned.some(
                (person) =>
                  String(
                    person._id
                  ) ===
                  String(
                    salespersonFilter
                  )
              );

            if (
              !matchesSalesperson
            ) {
              return false;
            }
          }

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

          const terms =
            Number(
              party.paymentTerms ||
                0
            );

          switch (
            paymentTermsFilter
          ) {
            case "ZERO":
              if (terms !== 0) {
                return false;
              }
              break;

            case "1_15":
              if (
                terms < 1 ||
                terms > 15
              ) {
                return false;
              }
              break;

            case "16_30":
              if (
                terms < 16 ||
                terms > 30
              ) {
                return false;
              }
              break;

            case "31_60":
              if (
                terms < 31 ||
                terms > 60
              ) {
                return false;
              }
              break;

            case "60_PLUS":
              if (terms <= 60) {
                return false;
              }
              break;
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

  const summary = useMemo(() => {
    let overdue = 0;
    let dueToday = 0;
    let upcoming = 0;
    let outstanding = 0;

    filteredParties.forEach(
      (party) => {
        const status =
          getDueStatus(
            party.dueDate
          );

        if (
          status === "OVERDUE"
        ) {
          overdue++;
        }

        if (
          status ===
          "DUE_TODAY"
        ) {
          dueToday++;
        }

        if (
          status === "UPCOMING"
        ) {
          upcoming++;
        }

        outstanding += Math.max(
          Number(
            party.currentBalance ||
              0
          ),
          0
        );
      }
    );

    return {
      total:
        filteredParties.length,

      overdue,

      dueToday,

      upcoming,

      outstanding,
    };
  }, [filteredParties]);

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

  const cancelDueDateEdit = () => {
    setEditingPartyId(null);
    setDueDateInput("");
  };

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
        (
          updatedParty?.customerDetails
            ?.dueDate ??
          updatedParty?.dueDate ??
          dueDateInput
        ) || null;

      setParties(
        (
          current: CRMParty[]
        ) =>
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

      window.alert(
        "Failed to update due date."
      );
    } finally {
      setSavingDueDate(false);
    }
  };

  const loadPartyLedger = async (
    partyId: string
  ) => {
    if (
      Object.prototype.hasOwnProperty.call(
        ledgerByParty,
        partyId
      )
    ) {
      return;
    }

    try {
      setLedgerLoadingId(
        partyId
      );

      const data =
        await getPartyLedger(
          partyId
        );

      setLedgerByParty(
        (
          current: Record<
            string,
            LedgerTransaction[]
          >
        ) => ({
          ...current,
          [partyId]:
            Array.isArray(data)
              ? data
              : [],
        })
      );
    } catch (error) {
      console.error(
        "Failed to load party ledger:",
        error
      );

      setLedgerByParty(
        (
          current: Record<
            string,
            LedgerTransaction[]
          >
        ) => ({
          ...current,
          [partyId]: [],
        })
      );
    } finally {
      setLedgerLoadingId(null);
    }
  };

  const toggleLedger = async (
    partyId: string
  ) => {
    if (
      expandedPartyId ===
      partyId
    ) {
      setExpandedPartyId(null);
      return;
    }

    setExpandedPartyId(
      partyId
    );

    await loadPartyLedger(
      partyId
    );
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <section
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div>
          <div
            className="
              mb-2
              flex
              items-center
              gap-2
              text-[11px]
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
              text-2xl
              font-bold
              tracking-tight
              text-slate-900
              sm:text-3xl
            "
          >
            Due Dates
          </h1>

          <p
            className="
              mt-1
              max-w-2xl
              text-sm
              leading-5
              text-slate-500
            "
          >
            Monitor customer payment
            deadlines, outstanding
            balances and collection
            dates.
          </p>
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
            px-3
            py-2
            text-xs
            font-medium
            text-slate-500
            shadow-sm
          "
        >
          <FiUsers
            size={14}
            className="text-[#172B6B]"
          />

          {summary.total}

          {" "}

          customer
          {summary.total !== 1
            ? "s"
            : ""}
        </div>
      </section>

      {/* COLLAPSIBLE STATS */}

      <section>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              setShowStats(
                (current) =>
                  !current
              )
            }
            title={
              showStats
                ? "Hide summary"
                : "Show summary"
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-500
              shadow-sm
              transition
              hover:bg-slate-50
              hover:text-[#172B6B]
            "
          >
            {showStats ? (
              <FiChevronUp size={16} />
            ) : (
              <FiChevronDown size={16} />
            )}
          </button>
        </div>

        {showStats && (
          <div
            className="
              mt-3
              grid
              grid-cols-2
              gap-3
              xl:grid-cols-4
            "
          >
            {/* OUTSTANDING */}

            <div
              className="
                rounded-2xl
                border
                border-blue-100
                bg-white
                p-4
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-[#172B6B]
                "
              >
                <FiCreditCard
                  size={17}
                />
              </div>

              <p
                className="
                  mt-4
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Outstanding
              </p>

              <p
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-[#172B6B]
                "
              >
                ₹
                {formatAmount(
                  summary.outstanding
                )}
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-slate-400
                "
              >
                Current filtered balance
              </p>
            </div>

            {/* OVERDUE */}

            <div
              className="
                rounded-2xl
                border
                border-red-100
                bg-white
                p-4
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-50
                  text-red-600
                "
              >
                <FiAlertCircle
                  size={17}
                />
              </div>

              <p
                className="
                  mt-4
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Overdue
              </p>

              <p
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-red-600
                "
              >
                {summary.overdue}
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-slate-400
                "
              >
                Requires attention
              </p>
            </div>

            {/* DUE TODAY */}

            <div
              className="
                rounded-2xl
                border
                border-amber-100
                bg-white
                p-4
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-amber-50
                  text-amber-600
                "
              >
                <FiCalendar
                  size={17}
                />
              </div>

              <p
                className="
                  mt-4
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Due Today
              </p>

              <p
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-amber-600
                "
              >
                {summary.dueToday}
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-slate-400
                "
              >
                Due today
              </p>
            </div>

            {/* UPCOMING */}

            <div
              className="
                rounded-2xl
                border
                border-emerald-100
                bg-white
                p-4
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-50
                  text-emerald-600
                "
              >
                <FiClock
                  size={17}
                />
              </div>

              <p
                className="
                  mt-4
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Upcoming
              </p>

              <p
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-emerald-600
                "
              >
                {summary.upcoming}
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-slate-400
                "
              >
                Future due dates
              </p>
            </div>
          </div>
        )}
      </section>

      {/* SEARCH + FILTER */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-3
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            gap-2
            sm:flex-row
          "
        >
          <div
            className="
              relative
              min-w-0
              flex-1
            "
          >
            <FiSearch
              size={16}
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
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
                pl-10
                pr-10
                text-sm
                text-slate-800
                outline-none
                transition
                focus:border-[#172B6B]
                focus:bg-white
                focus:ring-2
                focus:ring-[#172B6B]/10
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
                  h-6
                  w-6
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                (
                  current: boolean
                ) => !current
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
                activeFilterCount >
                  0
                  ? "border-[#172B6B] bg-blue-50 text-[#172B6B]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }
            `}
          >
            <FiFilter
              size={16}
            />

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

        {showFilters && (
          <div
            className="
              mt-3
              grid
              gap-3
              border-t
              border-slate-100
              pt-3
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Due Status
              </label>

              <select
                value={statusFilter}
                onChange={(
                  event
                ) =>
                  setStatusFilter(
                    event.target
                      .value as StatusFilter
                  )
                }
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm
                  text-slate-700
                  outline-none
                  focus:border-[#172B6B]
                "
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="OVERDUE">
                  Overdue
                </option>

                <option value="DUE_TODAY">
                  Due Today
                </option>

                <option value="UPCOMING">
                  Upcoming
                </option>

                <option value="NO_DUE_DATE">
                  No Due Date
                </option>
              </select>
            </div>

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Salesperson
              </label>

              <select
                value={
                  salespersonFilter
                }
                onChange={(
                  event
                ) =>
                  setSalespersonFilter(
                    event.target.value
                  )
                }
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm
                  text-slate-700
                  outline-none
                  focus:border-[#172B6B]
                "
              >
                <option value="ALL">
                  All Salespeople
                </option>

                {salespeople.map(
                  (
                    person
                  ) => (
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
            </div>

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Balance
              </label>

              <select
                value={
                  balanceFilter
                }
                onChange={(
                  event
                ) =>
                  setBalanceFilter(
                    event.target
                      .value as BalanceFilter
                  )
                }
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm
                  text-slate-700
                  outline-none
                  focus:border-[#172B6B]
                "
              >
                <option value="ALL">
                  All Balances
                </option>

                <option value="OUTSTANDING">
                  Outstanding
                </option>

                <option value="NO_OUTSTANDING">
                  No Outstanding
                </option>
              </select>
            </div>

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Payment Terms
              </label>

              <select
                value={
                  paymentTermsFilter
                }
                onChange={(
                  event
                ) =>
                  setPaymentTermsFilter(
                    event.target
                      .value as PaymentTermsFilter
                  )
                }
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm
                  text-slate-700
                  outline-none
                  focus:border-[#172B6B]
                "
              >
                <option value="ALL">
                  All Terms
                </option>

                <option value="ZERO">
                  No Terms
                </option>

                <option value="1_15">
                  1–15 Days
                </option>

                <option value="16_30">
                  16–30 Days
                </option>

                <option value="31_60">
                  31–60 Days
                </option>

                <option value="60_PLUS">
                  60+ Days
                </option>
              </select>
            </div>

            {activeFilterCount >
              0 && (
              <div
                className="
                  sm:col-span-2
                  lg:col-span-4
                "
              >
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="
                    text-xs
                    font-semibold
                    text-[#172B6B]
                    hover:underline
                  "
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* TABLE */}

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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr
                className="
                  border-b
                  border-slate-200
                  bg-slate-50/80
                "
              >
                <th
                  className="
                    px-5
                    py-3.5
                    text-left
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Customer
                </th>

                <th
                  className="
                    px-5
                    py-3.5
                    text-left
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Outstanding
                </th>

                <th
                  className="
                    px-5
                    py-3.5
                    text-left
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Payment Terms
                </th>

                <th
                  className="
                    px-5
                    py-3.5
                    text-left
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Due Date
                </th>

                <th
                  className="
                    px-5
                    py-3.5
                    text-left
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Status
                </th>

                <th
                  className="
                    px-5
                    py-3.5
                    text-right
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="
                      px-5
                      py-16
                      text-center
                    "
                  >
                    <FiRefreshCw
                      size={20}
                      className="
                        mx-auto
                        animate-spin
                        text-[#172B6B]
                      "
                    />

                    <p
                      className="
                        mt-3
                        text-sm
                        font-semibold
                        text-slate-600
                      "
                    >
                      Loading due dates...
                    </p>
                  </td>
                </tr>
              ) : filteredParties.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="
                      px-5
                      py-16
                      text-center
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        items-center
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
                        <FiSearch
                          size={20}
                        />
                      </div>

                      <h3
                        className="
                          mt-4
                          text-sm
                          font-semibold
                          text-slate-800
                        "
                      >
                        No customers found
                      </h3>

                      <p
                        className="
                          mt-1
                          max-w-sm
                          text-xs
                          leading-5
                          text-slate-400
                        "
                      >
                        Try changing your
                        search or filters.
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
                            rounded-lg
                            bg-[#172B6B]
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-white
                            hover:bg-[#10295D]
                          "
                        >
                          Clear search
                          & filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredParties.map(
                  (party) => {
                    const status =
                      getDueStatus(
                        party.dueDate
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

                    const isExpanded =
                      expandedPartyId ===
                      party._id;

                    const ledger =
                      ledgerByParty[
                        party._id
                      ] || [];

                    const isLedgerLoading =
                      ledgerLoadingId ===
                      party._id;

                    return (
                      <Fragment
                        key={
                          party._id
                        }
                      >
                        <tr
                          className="
                            border-b
                            border-slate-100
                            transition-colors
                            hover:bg-slate-50/60
                          "
                        >
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
                                  bg-[#172B6B]/10
                                  text-sm
                                  font-bold
                                  text-[#172B6B]
                                "
                              >
                                {(
                                  party.companyName ||
                                  "C"
                                )
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p
                                  className="
                                    truncate
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                  "
                                >
                                  {
                                    party.companyName
                                  }
                                </p>

                                <p
                                  className="
                                    mt-0.5
                                    truncate
                                    text-xs
                                    text-slate-400
                                  "
                                >
                                  {party.contactPerson ||
                                    party.phone ||
                                    "--"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`
                                text-sm
                                font-bold
                                ${
                                  Number(
                                    party.currentBalance ||
                                      0
                                  ) >
                                  0
                                    ? "text-red-600"
                                    : "text-emerald-600"
                                }
                              `}
                            >
                              ₹
                              {formatAmount(
                                party.currentBalance
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className="
                                text-sm
                                font-medium
                                text-slate-600
                              "
                            >
                              {Number(
                                party.paymentTerms ||
                                  0
                              ) > 0
                                ? `${Number(
                                    party.paymentTerms ||
                                      0
                                  )} days`
                                : "--"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <FiCalendar
                                size={14}
                                className="
                                  shrink-0
                                  text-slate-400
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
                                  party.dueDate
                                )}
                              </span>
                            </div>
                          </td>

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

                              {
                                statusConfig.label
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {isEditing ? (
                              <div
                                className="
                                  flex
                                  items-center
                                  justify-end
                                  gap-2
                                "
                              >
                                <input
                                  type="date"
                                  value={
                                    dueDateInput
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setDueDateInput(
                                      event
                                        .target
                                        .value
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
                                    text-slate-700
                                    outline-none
                                    focus:border-[#172B6B]
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
                                  "
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div
                                className="
                                  flex
                                  items-center
                                  justify-end
                                  gap-2
                                "
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    startDueDateEdit(
                                      party
                                    )
                                  }
                                  className="
                                    inline-flex
                                    h-9
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-white
                                    px-3
                                    text-xs
                                    font-semibold
                                    text-slate-600
                                    transition
                                    hover:border-[#172B6B]/30
                                    hover:bg-blue-50
                                    hover:text-[#172B6B]
                                  "
                                >
                                  <FiCalendar
                                    size={14}
                                  />

                                  Change Due Date
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleLedger(
                                      party._id
                                    )
                                  }
                                  className="
                                    inline-flex
                                    h-9
                                    items-center
                                    gap-1.5
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
                                  "
                                >
                                  {isExpanded
                                    ? "Hide Ledger"
                                    : "View Ledger"}

                                  <FiChevronDown
                                    size={14}
                                    className={`
                                      transition-transform
                                      ${
                                        isExpanded
                                          ? "rotate-180"
                                          : ""
                                      }
                                    `}
                                  />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr
                            className="
                              border-b
                              border-slate-200
                              bg-slate-50/40
                            "
                          >
                            <td
                              colSpan={6}
                              className="p-0"
                            >
                              <div className="px-5 py-4">
                                <div
                                  className="
                                    overflow-hidden
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                  "
                                >
                                  <div
                                    className="
                                      flex
                                      flex-col
                                      gap-2
                                      border-b
                                      border-slate-100
                                      px-4
                                      py-3
                                      sm:flex-row
                                      sm:items-center
                                      sm:justify-between
                                    "
                                  >
                                    <div>
                                      <p
                                        className="
                                          text-sm
                                          font-bold
                                          text-slate-800
                                        "
                                      >
                                        Transaction
                                        History
                                      </p>

                                      <p
                                        className="
                                          mt-0.5
                                          text-[11px]
                                          text-slate-400
                                        "
                                      >
                                        Read-only
                                        account
                                        ledger for{" "}
                                        {
                                          party.companyName
                                        }
                                      </p>
                                    </div>

                                    <span
                                      className="
                                        inline-flex
                                        w-fit
                                        items-center
                                        rounded-full
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        px-2.5
                                        py-1
                                        text-[10px]
                                        font-semibold
                                        text-slate-500
                                      "
                                    >
                                      Accounts
                                      Source
                                    </span>
                                  </div>

                                  <div
                                    className="
                                      max-h-[420px]
                                      overflow-y-auto
                                    "
                                  >
                                    {isLedgerLoading ? (
                                      <div
                                        className="
                                          flex
                                          min-h-[180px]
                                          items-center
                                          justify-center
                                        "
                                      >
                                        <div className="text-center">
                                          <FiRefreshCw
                                            size={18}
                                            className="
                                              mx-auto
                                              animate-spin
                                              text-[#172B6B]
                                            "
                                          />

                                          <p
                                            className="
                                              mt-2
                                              text-xs
                                              font-semibold
                                              text-slate-600
                                            "
                                          >
                                            Loading
                                            transactions...
                                          </p>
                                        </div>
                                      </div>
                                    ) : ledger.length ===
                                      0 ? (
                                      <div
                                        className="
                                          flex
                                          min-h-[180px]
                                          items-center
                                          justify-center
                                          px-6
                                          text-center
                                        "
                                      >
                                        <div>
                                          <div
                                            className="
                                              mx-auto
                                              flex
                                              h-10
                                              w-10
                                              items-center
                                              justify-center
                                              rounded-xl
                                              bg-slate-100
                                              text-slate-400
                                            "
                                          >
                                            <FiCalendar
                                              size={17}
                                            />
                                          </div>

                                          <p
                                            className="
                                              mt-3
                                              text-xs
                                              font-semibold
                                              text-slate-600
                                            "
                                          >
                                            No transactions
                                            found
                                          </p>

                                          <p
                                            className="
                                              mt-1
                                              text-[11px]
                                              text-slate-400
                                            "
                                          >
                                            No account
                                            transactions
                                            are available
                                            for this
                                            customer.
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="divide-y divide-slate-100">
                                        {ledger.map(
                                          (
                                            transaction,
                                            index
                                          ) => {
                                            const isMoneyIn =
                                              String(
                                                transaction.transactionType ||
                                                  ""
                                              ).toUpperCase() ===
                                              "MONEY_IN";

                                            return (
                                              <div
                                                key={
                                                  transaction._id ||
                                                  `${party._id}-${index}`
                                                }
                                                className="
                                                  grid
                                                  gap-3
                                                  px-4
                                                  py-3.5
                                                  sm:grid-cols-[120px_1fr_130px_150px]
                                                  sm:items-center
                                                "
                                              >
                                                <div>
                                                  <p
                                                    className="
                                                      text-[10px]
                                                      font-semibold
                                                      uppercase
                                                      tracking-wide
                                                      text-slate-400
                                                    "
                                                  >
                                                    Date
                                                  </p>

                                                  <p
                                                    className="
                                                      mt-1
                                                      text-xs
                                                      font-medium
                                                      text-slate-700
                                                    "
                                                  >
                                                    {formatTransactionDate(
                                                      transaction.date
                                                    )}
                                                  </p>
                                                </div>

                                                <div className="min-w-0">
                                                  <div className="flex items-center gap-2">
                                                    <span
                                                      className={`
                                                        inline-flex
                                                        h-7
                                                        w-7
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        ${
                                                          isMoneyIn
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : "bg-red-50 text-red-600"
                                                        }
                                                      `}
                                                    >
                                                      {isMoneyIn ? (
                                                        <FiArrowDownLeft
                                                          size={
                                                            14
                                                          }
                                                        />
                                                      ) : (
                                                        <FiArrowUpRight
                                                          size={
                                                            14
                                                          }
                                                        />
                                                      )}
                                                    </span>

                                                    <span
                                                      className={`
                                                        text-xs
                                                        font-semibold
                                                        ${
                                                          isMoneyIn
                                                            ? "text-emerald-700"
                                                            : "text-red-700"
                                                        }
                                                      `}
                                                    >
                                                      {isMoneyIn
                                                        ? "Money In"
                                                        : "Money Out"}
                                                    </span>
                                                  </div>

                                                  <p
                                                    className="
                                                      mt-1
                                                      truncate
                                                      text-[11px]
                                                      text-slate-400
                                                    "
                                                  >
                                                    {transaction.remarks ||
                                                      transaction.paymentMethod ||
                                                      "--"}
                                                  </p>
                                                </div>

                                                <div>
                                                  <p
                                                    className="
                                                      text-[10px]
                                                      font-semibold
                                                      uppercase
                                                      tracking-wide
                                                      text-slate-400
                                                    "
                                                  >
                                                    Amount
                                                  </p>

                                                  <p
                                                    className={`
                                                      mt-1
                                                      text-sm
                                                      font-bold
                                                      ${
                                                        isMoneyIn
                                                          ? "text-emerald-600"
                                                          : "text-red-600"
                                                      }
                                                    `}
                                                  >
                                                    {isMoneyIn
                                                      ? "+"
                                                      : "-"}
                                                    ₹
                                                    {formatAmount(
                                                      transaction.amount
                                                    )}
                                                  </p>
                                                </div>

                                                <div className="sm:text-right">
                                                  <p
                                                    className="
                                                      text-[10px]
                                                      font-semibold
                                                      uppercase
                                                      tracking-wide
                                                      text-slate-400
                                                    "
                                                  >
                                                    Balance
                                                    After
                                                  </p>

                                                  <p
                                                    className="
                                                      mt-1
                                                      text-sm
                                                      font-bold
                                                      text-slate-800
                                                    "
                                                  >
                                                    ₹
                                                    {formatAmount(
                                                      transaction.balanceAfterTransaction
                                                    )}
                                                  </p>

                                                  {transaction.paymentMethod && (
                                                    <p
                                                      className="
                                                        mt-0.5
                                                        text-[10px]
                                                        text-slate-400
                                                      "
                                                    >
                                                      {
                                                        transaction.paymentMethod
                                                      }
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div
                                    className="
                                      border-t
                                      border-slate-100
                                      bg-slate-50/60
                                      px-4
                                      py-2.5
                                    "
                                  >
                                    <p
                                      className="
                                        text-[10px]
                                        text-slate-400
                                      "
                                    >
                                      Transaction
                                      history is
                                      read-only in
                                      CRM. Manage
                                      transactions
                                      through
                                      Accounts.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

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
              <p
                className="
                  text-[11px]
                  text-slate-400
                "
              >
                CRM provides a read-only
                view of account transactions.
                Due dates can still be
                changed directly from the
                customer row.
              </p>

              <p
                className="
                  text-[11px]
                  font-medium
                  text-slate-400
                "
              >
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