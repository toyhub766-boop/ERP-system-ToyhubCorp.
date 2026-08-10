import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCalendar,
  FiChevronDown,
  FiClock,
  FiEdit3,
  FiPhone,
  FiSearch,
  FiUser,
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

  const [selectedCustomer, setSelectedCustomer] =
    useState<any>(null);

  const [showEdit, setShowEdit] = useState(false);

  const [form, setForm] =
    useState<PipelineForm>(EMPTY_FORM);

  const loadPipeline = async () => {
    try {
      setLoading(true);

      const data = await getSalesPipeline();

      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load sales pipeline:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      const companyName =
        customer.companyName?.toLowerCase() || "";

      const contactPerson =
        customer.contactPerson?.toLowerCase() || "";

      const phone =
        customer.phone?.toLowerCase() || "";

      const salesperson =
        customer.assignedSalesperson?.toLowerCase() || "";

      return (
        companyName.includes(query) ||
        contactPerson.includes(query) ||
        phone.includes(query) ||
        salesperson.includes(query)
      );
    });
  }, [customers, search]);

  const stageCounts = useMemo(() => {
    return STAGES.map((stage) => ({
      ...stage,
      count: customers.filter(
        (customer) =>
          (customer.stage || "LEAD") === stage.id
      ).length,
    }));
  }, [customers]);

  const pipelineStats = useMemo(() => {
    return {
      total: customers.length,

      assigned: customers.filter(
        (customer) =>
          customer.assignedSalesperson?.trim()
      ).length,

      followUps: customers.filter(
        (customer) =>
          customer.nextFollowUpDate
      ).length,

      overdue: customers.filter(
        (customer) =>
          isOverdue(customer.nextFollowUpDate)
      ).length,
    };
  }, [customers]);

  const openEdit = (customer: any) => {
    setSelectedCustomer(customer);

    setForm({
      stage: customer.stage || "LEAD",

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
            form.lastContactDate || undefined,

          nextFollowUpDate:
            form.nextFollowUpDate || undefined,

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
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-500">
          Loading sales pipeline...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#172B6B]">
            CRM
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Sales Pipeline
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            CRM staff manages salesperson assignments,
            lead stages, negotiations and follow-ups.
          </p>
        </div>

        <div className="relative w-full lg:w-80">

          <FiSearch
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search customer or salesperson..."
            className="
              w-full rounded-xl
              border border-slate-200
              bg-white
              py-3 pl-11 pr-4
              text-sm
              outline-none
              transition
              focus:border-[#172B6B]
              focus:ring-2
              focus:ring-[#172B6B]/10
            "
          />

        </div>

      </div>

      {/* PIPELINE SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total Leads
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {pipelineStats.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Assigned
          </p>

          <p className="mt-2 text-3xl font-bold text-[#172B6B]">
            {pipelineStats.assigned}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Follow-ups
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-600">
            {pipelineStats.followUps}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Overdue
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {pipelineStats.overdue}
          </p>
        </div>

      </div>

      {/* STAGES */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

        {stageCounts.slice(0, 5).map((stage) => (
          <div
            key={stage.id}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <p className="text-xs font-medium text-slate-500">
              {stage.label}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stage.count}
            </p>
          </div>
        ))}

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1150px]">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Salesperson
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stage
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Last Contact
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Next Follow-up
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Next Action
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredCustomers.map((customer) => {

                const overdue =
                  isOverdue(
                    customer.nextFollowUpDate
                  );

                return (
                  <tr
                    key={customer._id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* CUSTOMER */}

                    <td className="px-5 py-4">

                      <p className="font-semibold text-slate-900">
                        {customer.companyName}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">

                        <span>
                          {customer.contactPerson || "No contact"}
                        </span>

                        {customer.phone && (
                          <span>
                            {customer.phone}
                          </span>
                        )}

                      </div>

                    </td>

                    {/* SALESPERSON */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2 text-sm">

                        <FiUser className="text-slate-400" />

                        <span
                          className={
                            customer.assignedSalesperson
                              ? "font-medium text-slate-700"
                              : "text-slate-400"
                          }
                        >
                          {customer.assignedSalesperson ||
                            "Unassigned"}
                        </span>

                      </div>

                    </td>

                    {/* STAGE */}

                    <td className="px-5 py-4">

                      <span className="inline-flex rounded-full bg-[#172B6B]/10 px-3 py-1.5 text-xs font-semibold text-[#172B6B]">
                        {getStageLabel(
                          customer.stage
                        )}
                      </span>

                    </td>

                    {/* LAST CONTACT */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2 text-sm text-slate-600">

                        <FiPhone className="text-slate-400" />

                        {formatDate(
                          customer.lastContactDate
                        )}

                      </div>

                    </td>

                    {/* FOLLOW UP */}

                    <td className="px-5 py-4">

                      <div
                        className={`flex items-center gap-2 text-sm ${overdue
                            ? "font-semibold text-red-600"
                            : "text-slate-600"
                          }`}
                      >

                        <FiCalendar />

                        {formatDate(
                          customer.nextFollowUpDate
                        )}

                      </div>

                      {overdue && (
                        <p className="mt-1 text-xs text-red-500">
                          Follow-up overdue
                        </p>
                      )}

                    </td>

                    {/* NEXT ACTION */}

                    <td className="max-w-[250px] px-5 py-4">

                      <p className="truncate text-sm text-slate-600">
                        {customer.nextAction ||
                          "No next action"}
                      </p>

                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4 text-right">

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(customer)
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-slate-200
                          px-4
                          py-2
                          text-sm
                          font-semibold
                          text-[#172B6B]
                          transition
                          hover:bg-slate-50
                        "
                      >
                        <FiEdit3 size={15} />
                        Manage
                      </button>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

        {!filteredCustomers.length && (
          <div className="p-12 text-center">

            <p className="font-medium text-slate-700">
              No pipeline records found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Customers will appear here once they are available
              in the CRM.
            </p>

          </div>
        )}

      </div>

      {/* EDIT MODAL */}

      {showEdit && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-slate-200 p-6">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#172B6B]">
                  Manage Pipeline
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedCustomer.companyName}
                </h3>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">

                  <span>
                    {selectedCustomer.contactPerson ||
                      "No contact person"}
                  </span>

                  {selectedCustomer.phone && (
                    <span>
                      {selectedCustomer.phone}
                    </span>
                  )}

                  {selectedCustomer.email && (
                    <span>
                      {selectedCustomer.email}
                    </span>
                  )}

                </div>

              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={20} />
              </button>

            </div>

            <div className="space-y-6 p-6">

              {/* ASSIGNMENT */}

              <section>

                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Assigned Salesperson
                </label>

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
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-[#172B6B]
                    focus:ring-2
                    focus:ring-[#172B6B]/10
                  "
                />

                <p className="mt-2 text-xs text-slate-400">
                  CRM staff controls salesperson assignment.
                </p>

              </section>

              {/* STAGE */}

              <section>

                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Current Stage
                </label>

                <div className="relative">

                  <FiChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={form.stage}
                    onChange={(event) =>
                      updateForm(
                        "stage",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-[#172B6B]
                    "
                  >

                    {STAGES.map((stage) => (
                      <option
                        key={stage.id}
                        value={stage.id}
                      >
                        {stage.label}
                      </option>
                    ))}

                  </select>

                </div>

              </section>

              {/* DATES */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Last Contact Date
                  </label>

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
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-[#172B6B]
                    "
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Next Follow-up Date
                  </label>

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
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-[#172B6B]
                    "
                  />

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
                  placeholder="Call customer, send quotation, share catalogue, confirm order..."
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#172B6B]
                  "
                />

              </section>

              {/* NEGOTIATION */}

              <section>

                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Negotiation / Conversation Notes
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
                  placeholder="Customer requirements, objections, pricing discussion, payment terms, commitments, etc."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#172B6B]
                  "
                />

              </section>

              {/* STAGE NOTE */}

              <section>

                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Stage Change Note
                </label>

                <textarea
                  value={form.stageNote}
                  onChange={(event) =>
                    updateForm(
                      "stageNote",
                      event.target.value
                    )
                  }
                  rows={3}
                  placeholder="Reason for moving this customer to the selected stage..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#172B6B]
                  "
                />

              </section>

              {/* STAGE HISTORY */}

              {selectedCustomer.stageHistory?.length > 0 && (
                <section>

                  <div className="mb-3 flex items-center gap-2">

                    <FiClock className="text-[#172B6B]" />

                    <h4 className="font-semibold text-slate-900">
                      Stage History
                    </h4>

                  </div>

                  <div className="space-y-3">

                    {[...selectedCustomer.stageHistory]
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
                            className="rounded-xl bg-slate-50 p-4"
                          >

                            <div className="flex items-center justify-between gap-4">

                              <span className="text-sm font-semibold text-slate-800">
                                {getStageLabel(
                                  history.stage
                                )}
                              </span>

                              <span className="text-xs text-slate-400">
                                {formatDate(
                                  history.changedAt
                                )}
                              </span>

                            </div>

                            {history.note && (
                              <p className="mt-2 text-sm text-slate-600">
                                {history.note}
                              </p>
                            )}

                            {history.changedBy?.name && (
                              <p className="mt-2 text-xs text-slate-400">
                                Managed by{" "}
                                {history.changedBy.name}
                              </p>
                            )}

                          </div>
                        )
                      )}

                  </div>

                </section>
              )}

            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-3 border-t border-slate-200 p-6">

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-600
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
                  rounded-xl
                  bg-[#172B6B]
                  px-6
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#102157]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {saving
                  ? "Saving..."
                  : "Save Pipeline"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default SalesPipeline;