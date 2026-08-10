import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiClock,
} from "react-icons/fi";

import { getCRMDueDates } from "../services/crmDue.service";

type DueStatus =
  | "OVERDUE"
  | "DUE_TODAY"
  | "UPCOMING"
  | "NO_DUE_DATE";

const CRMDueDates = () => {
  const [parties, setParties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDueDates();
  }, []);

  const loadDueDates = async () => {
    try {
      setLoading(true);

      const data = await getCRMDueDates();

      const customers = data.filter(
        (party: any) =>
          party.partyType === "CUSTOMER"
      );

      setParties(customers);
    } catch (error) {
      console.error(
        "Failed to load CRM due dates:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }, []);

  const getDueStatus = (
    dueDate?: string
  ): DueStatus => {
    if (!dueDate) {
      return "NO_DUE_DATE";
    }

    const date = new Date(dueDate);

    date.setHours(0, 0, 0, 0);

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

  const filteredParties = parties.filter(
    (party) => {
      const query =
        search.toLowerCase();

      return (
        party.companyName
          ?.toLowerCase()
          .includes(query) ||
        party.contactPerson
          ?.toLowerCase()
          .includes(query) ||
        party.phone
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  const overdue = filteredParties.filter(
    (party) =>
      getDueStatus(
        party.customerDetails?.dueDate
      ) === "OVERDUE"
  );

  const dueToday = filteredParties.filter(
    (party) =>
      getDueStatus(
        party.customerDetails?.dueDate
      ) === "DUE_TODAY"
  );

  const upcoming = filteredParties.filter(
    (party) =>
      getDueStatus(
        party.customerDetails?.dueDate
      ) === "UPCOMING"
  );

  const noDueDate = filteredParties.filter(
    (party) =>
      getDueStatus(
        party.customerDetails?.dueDate
      ) === "NO_DUE_DATE"
  );

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "No due date";
    }

    return new Date(
      date
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (
    status: DueStatus
  ) => {
    switch (status) {
      case "OVERDUE":
        return "Overdue";

      case "DUE_TODAY":
        return "Due Today";

      case "UPCOMING":
        return "Upcoming";

      default:
        return "No Due Date";
    }
  };

  const getStatusClass = (
    status: DueStatus
  ) => {
    switch (status) {
      case "OVERDUE":
        return "bg-red-50 text-red-700";

      case "DUE_TODAY":
        return "bg-amber-50 text-amber-700";

      case "UPCOMING":
        return "bg-green-50 text-green-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-5">

      {/* HEADER */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#172B6B]">
          CRM
        </p>

        <h2 className="text-3xl font-bold text-slate-900">
          Due Dates
        </h2>

        <p className="text-sm text-slate-500">
          Monitor customer payment deadlines
          and outstanding balances from
          Accounts.
        </p>
      </div>

      {/* SEARCH */}

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search customer..."
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#172B6B]"
      />

      {/* STATS */}

      <div className="grid gap-3 md:grid-cols-4">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-600">
            <FiAlertCircle />
            <span className="text-sm font-semibold">
              Overdue
            </span>
          </div>

          <p className="mt-2 text-3xl font-bold text-red-700">
            {overdue.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-600">
            <FiCalendar />
            <span className="text-sm font-semibold">
              Due Today
            </span>
          </div>

          <p className="mt-2 text-3xl font-bold text-amber-700">
            {dueToday.length}
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-600">
            <FiClock />
            <span className="text-sm font-semibold">
              Upcoming
            </span>
          </div>

          <p className="mt-2 text-3xl font-bold text-green-700">
            {upcoming.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-600">
            No Due Date
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {noDueDate.length}
          </p>
        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="overflow-x-auto">

          <table className="min-w-[950px] w-full">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">

                <th className="px-4 py-3">
                  Customer
                </th>

                <th className="px-4 py-3">
                  Contact
                </th>

                <th className="px-4 py-3">
                  Outstanding
                </th>

                <th className="px-4 py-3">
                  Payment Terms
                </th>

                <th className="px-4 py-3">
                  Due Date
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Loading due dates...
                  </td>
                </tr>

              ) : filteredParties.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No customer due dates found
                  </td>
                </tr>

              ) : (

                filteredParties.map(
                  (party) => {

                    const dueDate =
                      party
                        .customerDetails
                        ?.dueDate;

                    const paymentTerms =
                      party
                        .customerDetails
                        ?.paymentTerms;

                    const status =
                      getDueStatus(
                        dueDate
                      );

                    return (

                      <tr
                        key={party._id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >

                        {/* CUSTOMER */}

                        <td className="px-4 py-4">

                          <div className="font-semibold text-slate-900">
                            {party.companyName}
                          </div>

                          <div className="text-xs text-slate-400">
                            {party.customerDetails
                              ?.billingName ||
                              "—"}
                          </div>

                        </td>

                        {/* CONTACT */}

                        <td className="px-4 py-4">

                          <div className="text-sm text-slate-700">
                            {party.contactPerson ||
                              "—"}
                          </div>

                          <div className="text-xs text-slate-400">
                            {party.phone ||
                              "No phone"}
                          </div>

                        </td>

                        {/* OUTSTANDING */}

                        <td className="px-4 py-4 font-semibold">

                          ₹
                          {Math.abs(
                            party.currentBalance ||
                            0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>

                        {/* PAYMENT TERMS */}

                        <td className="px-4 py-4 text-sm text-slate-600">

                          {paymentTerms
                            ? `${paymentTerms} days`
                            : "Not set"}

                        </td>

                        {/* DUE DATE */}

                        <td className="px-4 py-4 text-sm">

                          <div className="flex items-center gap-2">

                            <FiCalendar className="text-slate-400" />

                            {formatDate(
                              dueDate
                            )}

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              status
                            )}`}
                          >
                            {getStatusLabel(
                              status
                            )}
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

        {!loading &&
          filteredParties.length > 0 && (
            <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-400">
              Due dates entered through
              Accounts will appear here
              automatically.
            </div>
          )}

      </div>

    </div>
  );
};

export default CRMDueDates;