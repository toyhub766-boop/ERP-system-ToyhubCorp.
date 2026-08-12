import { useMemo, useState } from "react";
import { Building2, Plus, Users } from "lucide-react";

import PartyFilters from "./PartyFilters";
import PartyCard from "./PartyCard";

interface Props {
  parties: any[];
  selectedParty: any;
  setSelectedParty: (party: any) => void;
  onAddParty: () => void;
}

const PartyList = ({
  parties,
  selectedParty,
  setSelectedParty,
  onAddParty,
}: Props) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");
  const [balanceFilter, setBalanceFilter] =
    useState("ALL");
  const [dueDateFilter, setDueDateFilter] =
    useState("ALL");
  const [sortBy, setSortBy] =
    useState("LATEST");

  const filteredParties = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const filtered = parties.filter((party) => {
      const query =
        search.trim().toLowerCase();

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
          .includes(query) ||
        party.partyCode
          ?.toLowerCase()
          .includes(query) ||
        party.customerDetails?.transportPhone
          ?.toLowerCase()
          .includes(query) ||
        party.supplierDetails?.transportPhone
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        party.status === statusFilter;

      const balance = Number(
        party.currentBalance || 0
      );

      const matchesBalance =
        balanceFilter === "ALL" ||
        (balanceFilter === "GET" &&
          balance > 0) ||
        (balanceFilter === "GIVE" &&
          balance < 0) ||
        (balanceFilter === "ZERO" &&
          balance === 0);

      const dueDate =
        party.customerDetails?.dueDate ||
        party.supplierDetails?.dueDate ||
        null;

      let matchesDueDate = true;

      if (dueDateFilter !== "ALL") {
        if (!dueDate) {
          matchesDueDate =
            dueDateFilter === "NONE";
        } else {
          const due = new Date(dueDate);

          due.setHours(0, 0, 0, 0);

          const diffDays = Math.ceil(
            (due.getTime() -
              today.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (dueDateFilter === "OVERDUE") {
            matchesDueDate =
              diffDays < 0;
          }

          if (dueDateFilter === "TODAY") {
            matchesDueDate =
              diffDays === 0;
          }

          if (dueDateFilter === "UPCOMING") {
            matchesDueDate =
              diffDays > 0;
          }

          if (dueDateFilter === "NONE") {
            matchesDueDate = false;
          }
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesBalance &&
        matchesDueDate
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "A_Z") {
        return (
          (a.companyName || "").localeCompare(
            b.companyName || ""
          )
        );
      }

      if (sortBy === "Z_A") {
        return (
          (b.companyName || "").localeCompare(
            a.companyName || ""
          )
        );
      }

      if (sortBy === "HIGH") {
        return (
          Number(b.currentBalance || 0) -
          Number(a.currentBalance || 0)
        );
      }

      if (sortBy === "LOW") {
        return (
          Number(a.currentBalance || 0) -
          Number(b.currentBalance || 0)
        );
      }

      const dateA = new Date(
        a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || 0
      ).getTime();

      if (sortBy === "OLDEST") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });
  }, [
    parties,
    search,
    statusFilter,
    balanceFilter,
    dueDateFilter,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setBalanceFilter("ALL");
    setDueDateFilter("ALL");
    setSortBy("LATEST");
  };

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    balanceFilter !== "ALL" ||
    dueDateFilter !== "ALL" ||
    sortBy !== "LATEST";

  const activeCount = parties.filter(
    (party) =>
      party.status === "Active"
  ).length;

  const customerCount = parties.filter(
    (party) =>
      party.partyType === "CUSTOMER"
  ).length;

  const supplierCount = parties.filter(
    (party) =>
      party.partyType === "SUPPLIER"
  ).length;

  const expenseCount = parties.filter(
    (party) =>
      party.partyType === "COMPANY_EXPENSE"
  ).length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="shrink-0 border-b border-slate-200">

        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#17357A]/10 text-[#17357A]">
              <Users size={18} />
            </div>

            <div className="min-w-0">

              <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                Parties
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-400">
                {parties.length} accounts in ledger
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={onAddParty}
            className="
              inline-flex
              h-9
              shrink-0
              items-center
              gap-1.5
              rounded-lg
              bg-[#17357A]
              px-3
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#10295d]
              hover:shadow-md
              active:scale-[0.98]
              sm:h-10
              sm:px-3.5
              sm:text-sm
            "
          >
            <Plus size={15} />
            <span>Add Party</span>
          </button>

        </div>

      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="shrink-0">
        <PartyFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          balanceFilter={balanceFilter}
          setBalanceFilter={setBalanceFilter}
          dueDateFilter={dueDateFilter}
          setDueDateFilter={setDueDateFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      {/* =====================================================
          QUICK SUMMARY
      ===================================================== */}

      <div className="shrink-0 border-b border-slate-100 bg-slate-50/60 px-3 py-2">

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">

          <SummaryPill
            label={`${filteredParties.length} of ${parties.length}`}
          />

          <SummaryPill
            label={`Customers ${customerCount}`}
            tone="blue"
          />

          <SummaryPill
            label={`Suppliers ${supplierCount}`}
            tone="orange"
          />

          <SummaryPill
            label={`Expenses ${expenseCount}`}
            tone="purple"
          />

          <SummaryPill
            label={`Active ${activeCount}`}
            tone="green"
          />

        </div>

      </div>

      {/* =====================================================
          SCROLL AREA

          THIS is the only area that scrolls.
      ===================================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          overscroll-contain
          px-3
          py-3
          scrollbar-thin
          scrollbar-track-transparent
          scrollbar-thumb-slate-300
          hover:scrollbar-thumb-slate-400
        "
      >

        {filteredParties.length === 0 ? (

          <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5">

            <div className="max-w-[220px] text-center">

              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                <Building2 size={19} />
              </div>

              <h3 className="mt-3 text-sm font-bold text-slate-800">
                No Parties Found
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Try changing your search or filters.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    mt-3
                    text-xs
                    font-semibold
                    text-[#17357A]
                    transition
                    hover:text-[#10295d]
                    hover:underline
                  "
                >
                  Clear filters
                </button>
              )}

            </div>

          </div>

        ) : (

          <div className="space-y-2.5 pb-2">

            {filteredParties.map((party) => (
              <PartyCard
                key={party._id}
                party={party}
                selected={
                  selectedParty?._id ===
                  party._id
                }
                onClick={() =>
                  setSelectedParty(party)
                }
              />
            ))}

          </div>

        )}

      </div>

    </div>
  );
};

interface SummaryPillProps {
  label: string;
  tone?:
    | "blue"
    | "orange"
    | "purple"
    | "green";
}

const SummaryPill = ({
  label,
  tone,
}: SummaryPillProps) => {
  const toneClass =
    tone === "blue"
      ? "bg-blue-50 text-blue-600"
      : tone === "orange"
      ? "bg-orange-50 text-orange-600"
      : tone === "purple"
      ? "bg-purple-50 text-purple-600"
      : tone === "green"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-white text-slate-500";

  return (
    <span
      className={`
        inline-flex
        h-7
        shrink-0
        items-center
        rounded-full
        px-2.5
        text-[10px]
        font-semibold
        ${toneClass}
      `}
    >
      {label}
    </span>
  );
};

export default PartyList;