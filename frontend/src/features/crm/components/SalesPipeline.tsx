import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiEdit3,
  FiFilter,
  FiMail,
  FiPhone,
  FiSearch,
  FiTarget,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  getSalesPipeline,
  updateCustomerPipeline,
} from "../services/pipeline.service";

const STAGES = [
  {
    id: "LEAD",
    label: "Lead",
  },
  {
    id: "RINGING",
    label: "Ringing",
  },
  {
    id: "NEGOTIATION",
    label: "Negotiation",
  },
  {
    id: "CATALOG_SHARED",
    label: "Catalog Shared",
  },
  {
    id: "VERIFICATION",
    label: "Verification",
  },
  {
    id: "ACTIVE_DEALER",
    label: "Active Dealer",
  },
  {
    id: "SUPPLIER",
    label: "Supplier",
  },
  {
    id: "DELAYED_PAYMENT",
    label: "Delayed Payment",
  },
  {
    id: "CLOSED",
    label: "Closed",
  },
  {
    id: "NO_DEALER",
    label: "No Dealer",
  },
] as const;

type PipelineForm = {
  stage: string;
  assignedSalesperson: string;
  lastContactDate: string;
  nextFollowUpDate: string;
  nextAction: string;
  negotiationNotes: string;
  stageNote: string;
};

const EMPTY_FORM: PipelineForm = {
  stage: "LEAD",
  assignedSalesperson: "",
  lastContactDate: "",
  nextFollowUpDate: "",
  nextAction: "",
  negotiationNotes: "",
  stageNote: "",
};

const formatDate = (date?: string | null) => {
  if (!date) return "Not set";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not set";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateInput = (date?: string | null) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
};

const getStageLabel = (stage?: string) => {
  return (
    STAGES.find((item) => item.id === stage)?.label ||
    stage ||
    "Lead"
  );
};

const isOverdue = (date?: string | null) => {
  if (!date) return false;

  const followUp = new Date(date);
  const today = new Date();

  followUp.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return followUp < today;
};

const SalesPipeline = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedStage, setSelectedStage] =
    useState("ALL");

  const [selectedCustomer, setSelectedCustomer] =
    useState<any>(null);

  const [showEdit, setShowEdit] = useState(false);

  const [form, setForm] =
    useState<PipelineForm>(EMPTY_FORM);

  const loadPipeline = async () => {
    try {
      setLoading(true);

      const data = await getSalesPipeline();

      setCustomers(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to load sales pipeline:",
        error
      );

      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return customers.filter((customer) => {
      const companyName =
        customer.companyName?.toLowerCase() || "";

      const contactPerson =
        customer.contactPerson?.toLowerCase() || "";

      const phone =
        customer.phone?.toLowerCase() || "";

      const salesperson =
        customer.assignedSalesperson?.toLowerCase() ||
        "";

      const matchesSearch =
        !query ||
        companyName.includes(query) ||
        contactPerson.includes(query) ||
        phone.includes(query) ||
        salesperson.includes(query);

      const matchesStage =
        selectedStage === "ALL" ||
        (customer.stage || "LEAD") ===
          selectedStage;

      return (
        matchesSearch &&
        matchesStage
      );
    });
  }, [
    customers,
    search,
    selectedStage,
  ]);

  const stageCounts = useMemo(() => {
    return STAGES.map((stage) => ({
      ...stage,
      count: customers.filter(
        (customer) =>
          (customer.stage || "LEAD") ===
          stage.id
      ).length,
    }));
  }, [customers]);

  const pipelineStats = useMemo(() => {
    const total = customers.length;

    const assigned = customers.filter(
      (customer) =>
        Boolean(
          customer.assignedSalesperson?.trim()
        )
    ).length;

    const followUps = customers.filter(
      (customer) =>
        Boolean(customer.nextFollowUpDate)
    ).length;

    const overdue = customers.filter(
      (customer) =>
        isOverdue(
          customer.nextFollowUpDate
        )
    ).length;

    const activeDeals = customers.filter(
      (customer) =>
        [
          "NEGOTIATION",
          "CATALOG_SHARED",
          "VERIFICATION",
          "ACTIVE_DEALER",
        ].includes(customer.stage)
    ).length;

    return {
      total,
      assigned,
      followUps,
      overdue,
      activeDeals,
    };
  }, [customers]);

  const openEdit = (customer: any) => {
    setSelectedCustomer(customer);

    setForm({
      stage:
        customer.stage || "LEAD",

      assignedSalesperson:
        customer.assignedSalesperson || "",

      lastContactDate:
        formatDateInput(
          customer.lastContactDate
        ),

      nextFollowUpDate:
        formatDateInput(
          customer.nextFollowUpDate
        ),

      nextAction:
        customer.nextAction || "",

      negotiationNotes:
        customer.negotiationNotes || "",

      stageNote: "",
    });

    setShowEdit(true);
  };

  const closeEdit = () => {
    if (saving) return;

    setShowEdit(false);
    setSelectedCustomer(null);
    setForm(EMPTY_FORM);
  };

  const updateForm = (
    field: keyof PipelineForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const savePipeline = async () => {
    if (!selectedCustomer?._id) {
      return;
    }

    try {
      setSaving(true);

      await updateCustomerPipeline(
        selectedCustomer._id,
        {
          stage: form.stage,

          assignedSalesperson:
            form.assignedSalesperson.trim(),

          lastContactDate:
            form.lastContactDate ||
            undefined,

          nextFollowUpDate:
            form.nextFollowUpDate ||
            undefined,

          nextAction:
            form.nextAction.trim(),

          negotiationNotes:
            form.negotiationNotes.trim(),

          stageNote:
            form.stageNote.trim(),
        }
      );

      await loadPipeline();

      setShowEdit(false);
      setSelectedCustomer(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error(
        "Failed to update sales pipeline:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-[#172B6B]/10
              text-[#172B6B]
            "
          >
            <FiTarget
              size={21}
              className="animate-pulse"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading sales pipeline
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Preparing your CRM workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section
          className="
            rounded-[28px]
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-6
              xl:flex-row
              xl:items-center
              xl:justify-between
            "
          >
            <div className="flex items-start gap-4">

              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#172B6B]
                  text-white
                  shadow-lg
                  shadow-[#172B6B]/20
                "
              >
                <FiTarget size={21} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-[#172B6B]
                    "
                  >
                    CRM
                  </span>

                  <span className="h-1 w-1 rounded-full bg-slate-300" />

                  <span className="text-xs text-slate-400">
                    Sales Operations
                  </span>
                </div>

                <h1
                  className="
                    mt-1
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-900
                    sm:text-3xl
                  "
                >
                  Sales Pipeline
                </h1>

                <p
                  className="
                    mt-1.5
                    max-w-2xl
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Manage customer stages, salesperson
                  assignments, negotiations and upcoming
                  follow-ups from one workspace.
                </p>
              </div>
            </div>

            {/* Search */}

            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">

              <div className="relative sm:w-80">

                <FiSearch
                  size={17}
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
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search customers..."
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
                    transition
                    placeholder:text-slate-400
                    focus:border-[#172B6B]
                    focus:bg-white
                    focus:ring-4
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
                      -translate-y-1/2
                      rounded-lg
                      p-1
                      text-slate-400
                      hover:bg-slate-100
                      hover:text-slate-700
                    "
                  >
                    <FiX size={15} />
                  </button>
                )}

              </div>

              <div className="relative sm:w-48">

                <FiFilter
                  size={15}
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <select
                  value={selectedStage}
                  onChange={(event) =>
                    setSelectedStage(
                      event.target.value
                    )
                  }
                  className="
                    h-11
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-9
                    pr-8
                    text-sm
                    font-medium
                    text-slate-700
                    outline-none
                    focus:border-[#172B6B]
                    focus:bg-white
                  "
                >
                  <option value="ALL">
                    All Stages
                  </option>

                  {STAGES.map((stage) => (
                    <option
                      key={stage.id}
                      value={stage.id}
                    >
                      {stage.label}
                    </option>
                  ))}
                </select>

                <FiChevronDown
                  size={14}
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
        </section>

        {/* =====================================================
            KPI CARDS
        ===================================================== */}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">

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
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Pipeline
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {pipelineStats.total}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Total customers
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                <FiUsers size={17} />
              </div>

            </div>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-blue-100
              bg-blue-50/50
              p-5
            "
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Active Deals
                </p>

                <p className="mt-2 text-3xl font-bold text-[#172B6B]">
                  {pipelineStats.activeDeals}
                </p>

                <p className="mt-1 text-xs text-blue-600/70">
                  In active sales stages
                </p>
              </div>

              <div className="rounded-xl bg-white p-2.5 text-[#172B6B] shadow-sm">
                <FiTarget size={17} />
              </div>

            </div>
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
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Assigned
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {pipelineStats.assigned}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  With salesperson
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                <FiUser size={17} />
              </div>

            </div>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-amber-100
              bg-amber-50/50
              p-5
            "
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Follow-ups
                </p>

                <p className="mt-2 text-3xl font-bold text-amber-700">
                  {pipelineStats.followUps}
                </p>

                <p className="mt-1 text-xs text-amber-600/70">
                  Scheduled contacts
                </p>
              </div>

              <div className="rounded-xl bg-white p-2.5 text-amber-600 shadow-sm">
                <FiCalendar size={17} />
              </div>

            </div>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-red-100
              bg-red-50/50
              p-5
            "
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  Overdue
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {pipelineStats.overdue}
                </p>

                <p className="mt-1 text-xs text-red-600/70">
                  Requires attention
                </p>
              </div>

              <div className="rounded-xl bg-white p-2.5 text-red-600 shadow-sm">
                <FiClock size={17} />
              </div>

            </div>
          </div>

        </section>

        {/* =====================================================
            STAGE STRIP
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
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pipeline Stages
                </h3>

                <p className="mt-0.5 text-xs text-slate-400">
                  Current customer distribution
                </p>
              </div>

              <span className="text-xs font-medium text-slate-400">
                {customers.length} total
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 xl:divide-y-0">

            {stageCounts.map((stage) => {
              const active =
                selectedStage === stage.id;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() =>
                    setSelectedStage(
                      active
                        ? "ALL"
                        : stage.id
                    )
                  }
                  className={`
                    group
                    px-4
                    py-4
                    text-left
                    transition
                    hover:bg-slate-50
                    ${
                      active
                        ? "bg-[#172B6B]/5"
                        : ""
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-2">

                    <span
                      className={`
                        h-2
                        w-2
                        shrink-0
                        rounded-full
                        ${
                          active
                            ? "bg-[#172B6B]"
                            : "bg-slate-300 group-hover:bg-[#172B6B]"
                        }
                      `}
                    />

                    <span className="text-xl font-bold text-slate-900">
                      {stage.count}
                    </span>

                  </div>

                  <p
                    className={`
                      mt-2
                      truncate
                      text-[11px]
                      font-semibold
                      ${
                        active
                          ? "text-[#172B6B]"
                          : "text-slate-500"
                      }
                    `}
                  >
                    {stage.label}
                  </p>
                </button>
              );
            })}

          </div>
        </section>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <section
          className="
            overflow-hidden
            rounded-[28px]
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
              gap-3
              border-b
              border-slate-100
              px-5
              py-5
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-6
            "
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Customer Pipeline
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Showing {filteredCustomers.length} of{" "}
                {customers.length} customers
              </p>
            </div>

            {(search ||
              selectedStage !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedStage("ALL");
                }}
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  self-start
                  rounded-lg
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-slate-500
                  hover:bg-slate-100
                  hover:text-slate-800
                "
              >
                <FiX size={14} />
                Clear filters
              </button>
            )}
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px]">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">

                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Customer
                  </th>

                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Salesperson
                  </th>

                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Stage
                  </th>

                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Last Contact
                  </th>

                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Follow-up
                  </th>

                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Next Action
                  </th>

                  <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Manage
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredCustomers.map(
                  (customer) => {
                    const overdue =
                      isOverdue(
                        customer.nextFollowUpDate
                      );

                    return (
                      <tr
                        key={customer._id}
                        className="
                          group
                          transition
                          hover:bg-slate-50/70
                        "
                      >

                        {/* CUSTOMER */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div
                              className="
                                flex
                                h-10
                                w-10
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
                              {customer.companyName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "C"}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-bold text-slate-900">
                                {customer.companyName ||
                                  "Unnamed Customer"}
                              </p>

                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">

                                <span>
                                  {customer.contactPerson ||
                                    "No contact"}
                                </span>

                                {customer.phone && (
                                  <>
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />

                                    <span>
                                      {customer.phone}
                                    </span>
                                  </>
                                )}

                              </div>

                            </div>

                          </div>

                        </td>

                        {/* SALESPERSON */}

                        <td className="px-5 py-4">

                          {customer.assignedSalesperson ? (
                            <div className="flex items-center gap-2.5">

                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                <FiUser size={14} />
                              </div>

                              <span className="text-sm font-medium text-slate-700">
                                {customer.assignedSalesperson}
                              </span>

                            </div>
                          ) : (
                            <span
                              className="
                                inline-flex
                                rounded-lg
                                bg-slate-100
                                px-2.5
                                py-1.5
                                text-xs
                                font-medium
                                text-slate-400
                              "
                            >
                              Unassigned
                            </span>
                          )}

                        </td>

                        {/* STAGE */}

                        <td className="px-5 py-4">

                          <span
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              bg-[#172B6B]/10
                              px-3
                              py-1.5
                              text-xs
                              font-semibold
                              text-[#172B6B]
                            "
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#172B6B]" />

                            {getStageLabel(
                              customer.stage
                            )}
                          </span>

                        </td>

                        {/* LAST CONTACT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <FiPhone
                              size={14}
                              className="text-slate-400"
                            />

                            {formatDate(
                              customer.lastContactDate
                            )}

                          </div>

                        </td>

                        {/* FOLLOW-UP */}

                        <td className="px-5 py-4">

                          <div
                            className={`
                              flex
                              items-center
                              gap-2
                              text-sm
                              ${
                                overdue
                                  ? "font-semibold text-red-600"
                                  : "text-slate-600"
                              }
                            `}
                          >
                            <FiCalendar
                              size={14}
                            />

                            {formatDate(
                              customer.nextFollowUpDate
                            )}
                          </div>

                          {overdue && (
                            <span className="mt-1 inline-flex rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                              OVERDUE
                            </span>
                          )}

                        </td>

                        {/* NEXT ACTION */}

                        <td className="max-w-[250px] px-5 py-4">

                          <p
                            className="
                              truncate
                              text-sm
                              text-slate-600
                            "
                            title={
                              customer.nextAction ||
                              undefined
                            }
                          >
                            {customer.nextAction ||
                              "No next action"}
                          </p>

                        </td>

                        {/* MANAGE */}

                        <td className="px-6 py-4 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(
                                customer
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-slate-200
                              bg-white
                              px-3.5
                              py-2
                              text-xs
                              font-semibold
                              text-[#172B6B]
                              shadow-sm
                              transition
                              hover:border-[#172B6B]/30
                              hover:bg-[#172B6B]/5
                            "
                          >
                            <FiEdit3
                              size={14}
                            />
                            Manage
                            <FiArrowRight
                              size={13}
                            />
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

          {/* EMPTY */}

          {!filteredCustomers.length && (
            <div className="px-6 py-20 text-center">

              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-100
                  text-slate-400
                "
              >
                <FiSearch size={22} />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-800">
                No pipeline records found
              </h3>

              <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
                Try changing your search or stage
                filter to find the customer you're
                looking for.
              </p>

            </div>
          )}

        </section>

      </div>

      {/* =====================================================
          EDIT PIPELINE MODAL
      ===================================================== */}

      {showEdit && selectedCustomer && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/60
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeEdit();
            }
          }}
        >

          <div
            className="
              flex
              max-h-[92vh]
              w-full
              max-w-3xl
              flex-col
              overflow-hidden
              rounded-[28px]
              bg-white
              shadow-2xl
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                shrink-0
                items-start
                justify-between
                border-b
                border-slate-100
                bg-white
                px-5
                py-5
                sm:px-6
              "
            >

              <div className="min-w-0 pr-4">

                <div className="flex items-center gap-2">

                  <span
                    className="
                      rounded-lg
                      bg-[#172B6B]/10
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-[#172B6B]
                    "
                  >
                    Pipeline
                  </span>

                  <span className="text-xs text-slate-300">
                    /
                  </span>

                  <span className="text-xs text-slate-400">
                    Manage Customer
                  </span>

                </div>

                <h3
                  className="
                    mt-2
                    truncate
                    text-xl
                    font-bold
                    tracking-tight
                    text-slate-900
                    sm:text-2xl
                  "
                >
                  {selectedCustomer.companyName}
                </h3>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">

                  {selectedCustomer.contactPerson && (
                    <span className="flex items-center gap-1.5">
                      <FiUser size={12} />
                      {selectedCustomer.contactPerson}
                    </span>
                  )}

                  {selectedCustomer.phone && (
                    <span className="flex items-center gap-1.5">
                      <FiPhone size={12} />
                      {selectedCustomer.phone}
                    </span>
                  )}

                  {selectedCustomer.email && (
                    <span className="flex items-center gap-1.5">
                      <FiMail size={12} />
                      {selectedCustomer.email}
                    </span>
                  )}

                </div>

              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                aria-label="Close"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                  disabled:cursor-not-allowed
                "
              >
                <FiX size={19} />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="overflow-y-auto">

              <div className="space-y-6 p-5 sm:p-6">

                {/* CURRENT STAGE */}

                <section
                  className="
                    rounded-2xl
                    border
                    border-[#172B6B]/10
                    bg-[#172B6B]/5
                    p-4
                  "
                >

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#172B6B]/60">
                        Current Stage
                      </p>

                      <p className="mt-1 text-base font-bold text-[#172B6B]">
                        {getStageLabel(
                          selectedCustomer.stage
                        )}
                      </p>

                    </div>

                    <FiTarget
                      size={22}
                      className="text-[#172B6B]/50"
                    />

                  </div>

                </section>

                {/* ASSIGNMENT + STAGE */}

                <div className="grid gap-5 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Assigned Salesperson
                    </label>

                    <div className="relative">

                      <FiUser
                        size={16}
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        value={
                          form.assignedSalesperson
                        }
                        onChange={(event) =>
                          updateForm(
                            "assignedSalesperson",
                            event.target.value
                          )
                        }
                        placeholder="Enter salesperson name"
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          pl-10
                          pr-4
                          text-sm
                          outline-none
                          transition
                          focus:border-[#172B6B]
                          focus:ring-4
                          focus:ring-[#172B6B]/10
                        "
                      />

                    </div>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Pipeline Stage
                    </label>

                    <div className="relative">

                      <select
                        value={form.stage}
                        onChange={(event) =>
                          updateForm(
                            "stage",
                            event.target.value
                          )
                        }
                        className="
                          h-11
                          w-full
                          appearance-none
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-4
                          pr-10
                          text-sm
                          outline-none
                          transition
                          focus:border-[#172B6B]
                          focus:ring-4
                          focus:ring-[#172B6B]/10
                        "
                      >
                        {STAGES.map(
                          (stage) => (
                            <option
                              key={stage.id}
                              value={stage.id}
                            >
                              {stage.label}
                            </option>
                          )
                        )}
                      </select>

                      <FiChevronDown
                        size={15}
                        className="
                          pointer-events-none
                          absolute
                          right-3.5
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                    </div>

                  </div>

                </div>

                {/* DATES */}

                <div className="grid gap-5 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Last Contact Date
                    </label>

                    <div className="relative">

                      <FiCalendar
                        size={15}
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        type="date"
                        value={
                          form.lastContactDate
                        }
                        onChange={(event) =>
                          updateForm(
                            "lastContactDate",
                            event.target.value
                          )
                        }
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-4
                          pl-10
                          text-sm
                          outline-none
                          focus:border-[#172B6B]
                        "
                      />

                    </div>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Next Follow-up
                    </label>

                    <div className="relative">

                      <FiCalendar
                        size={15}
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        type="date"
                        value={
                          form.nextFollowUpDate
                        }
                        onChange={(event) =>
                          updateForm(
                            "nextFollowUpDate",
                            event.target.value
                          )
                        }
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-4
                          pl-10
                          text-sm
                          outline-none
                          focus:border-[#172B6B]
                        "
                      />

                    </div>

                  </div>

                </div>

                {/* NEXT ACTION */}

                <section>

                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Next Action
                  </label>

                  <input
                    value={form.nextAction}
                    onChange={(event) =>
                      updateForm(
                        "nextAction",
                        event.target.value
                      )
                    }
                    placeholder="Call customer, send quotation, share catalogue..."
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      text-sm
                      outline-none
                      transition
                      focus:border-[#172B6B]
                      focus:ring-4
                      focus:ring-[#172B6B]/10
                    "
                  />

                </section>

                {/* NOTES */}

                <section>

                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Negotiation & Conversation Notes
                  </label>

                  <textarea
                    value={
                      form.negotiationNotes
                    }
                    onChange={(event) =>
                      updateForm(
                        "negotiationNotes",
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Customer requirements, objections, pricing discussion, payment terms, commitments..."
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-3
                      text-sm
                      leading-6
                      outline-none
                      transition
                      focus:border-[#172B6B]
                      focus:ring-4
                      focus:ring-[#172B6B]/10
                    "
                  />

                </section>

                {/* STAGE NOTE */}

                <section>

                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Stage Change Note
                  </label>

                  <textarea
                    value={
                      form.stageNote
                    }
                    onChange={(event) =>
                      updateForm(
                        "stageNote",
                        event.target.value
                      )
                    }
                    rows={3}
                    placeholder="Why is this customer moving to the selected stage?"
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-3
                      text-sm
                      leading-6
                      outline-none
                      transition
                      focus:border-[#172B6B]
                      focus:ring-4
                      focus:ring-[#172B6B]/10
                    "
                  />

                </section>

                {/* HISTORY */}

                {selectedCustomer.stageHistory?.length > 0 && (
                  <section>

                    <div className="mb-4 flex items-center justify-between">

                      <div className="flex items-center gap-2.5">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <FiClock size={15} />
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            Stage History
                          </h4>

                          <p className="text-xs text-slate-400">
                            Recent pipeline activity
                          </p>
                        </div>

                      </div>

                    </div>

                    <div className="relative ml-4 space-y-4 border-l border-slate-200 pl-6">

                      {[
                        ...selectedCustomer.stageHistory,
                      ]
                        .reverse()
                        .map(
                          (
                            history: any,
                            index: number
                          ) => (
                            <div
                              key={
                                history._id ||
                                index
                              }
                              className="relative"
                            >

                              <span
                                className="
                                  absolute
                                  -left-[31px]
                                  top-1.5
                                  h-2.5
                                  w-2.5
                                  rounded-full
                                  border-2
                                  border-white
                                  bg-[#172B6B]
                                  shadow-sm
                                "
                              />

                              <div
                                className="
                                  rounded-xl
                                  border
                                  border-slate-100
                                  bg-slate-50
                                  p-4
                                "
                              >

                                <div className="flex items-start justify-between gap-4">

                                  <span className="text-sm font-bold text-slate-800">
                                    {getStageLabel(
                                      history.stage
                                    )}
                                  </span>

                                  <span className="shrink-0 text-[11px] text-slate-400">
                                    {formatDate(
                                      history.changedAt
                                    )}
                                  </span>

                                </div>

                                {history.note && (
                                  <p className="mt-2 text-sm leading-5 text-slate-600">
                                    {history.note}
                                  </p>
                                )}

                                {history.changedBy?.name && (
                                  <p className="mt-2 text-[11px] text-slate-400">
                                    Managed by{" "}
                                    {history.changedBy.name}
                                  </p>
                                )}

                              </div>

                            </div>
                          )
                        )}

                    </div>

                  </section>
                )}

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div
              className="
                flex
                shrink-0
                flex-col-reverse
                gap-2
                border-t
                border-slate-100
                bg-slate-50/70
                p-4
                sm:flex-row
                sm:justify-end
                sm:p-5
              "
            >

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="
                  h-11
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={savePipeline}
                disabled={saving}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#172B6B]
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#20398F]
                  hover:shadow-md
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <FiCheckCircle size={16} />
                    Save Pipeline
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default SalesPipeline;