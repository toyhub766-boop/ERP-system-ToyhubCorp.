import { useMemo, useState } from "react";

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

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredParties = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const filtered = parties.filter(
      (party) => {
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
            .includes(query);

        const matchesStatus =
          statusFilter === "ALL" ||
          party.status === statusFilter;

        const balance =
          Number(
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
            const due = new Date(
              dueDate
            );

            due.setHours(0, 0, 0, 0);

            const diffDays =
              Math.ceil(
                (due.getTime() -
                  today.getTime()) /
                  (1000 *
                    60 *
                    60 *
                    24)
              );

            if (
              dueDateFilter ===
              "OVERDUE"
            ) {
              matchesDueDate =
                diffDays < 0;
            }

            if (
              dueDateFilter ===
              "TODAY"
            ) {
              matchesDueDate =
                diffDays === 0;
            }

            if (
              dueDateFilter ===
              "UPCOMING"
            ) {
              matchesDueDate =
                diffDays > 0;
            }

            if (
              dueDateFilter ===
              "NONE"
            ) {
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
      }
    );

    return [...filtered].sort(
      (a, b) => {
        if (
          sortBy === "A_Z"
        ) {
          return (
            (a.companyName || "")
              .toLowerCase()
              .localeCompare(
                (
                  b.companyName || ""
                ).toLowerCase()
              )
          );
        }

        if (
          sortBy === "Z_A"
        ) {
          return (
            (b.companyName || "")
              .toLowerCase()
              .localeCompare(
                (
                  a.companyName || ""
                ).toLowerCase()
              )
          );
        }

        if (
          sortBy === "HIGH"
        ) {
          return (
            Number(
              b.currentBalance || 0
            ) -
            Number(
              a.currentBalance || 0
            )
          );
        }

        if (
          sortBy === "LOW"
        ) {
          return (
            Number(
              a.currentBalance || 0
            ) -
            Number(
              b.currentBalance || 0
            )
          );
        }

        const dateA =
          new Date(
            a.createdAt || 0
          ).getTime();

        const dateB =
          new Date(
            b.createdAt || 0
          ).getTime();

        if (
          sortBy === "OLDEST"
        ) {
          return dateA - dateB;
        }

        return dateB - dateA;
      }
    );
  }, [
    parties,
    search,
    statusFilter,
    balanceFilter,
    dueDateFilter,
    sortBy,
  ]);

  /* =====================================================
     COUNTS
  ===================================================== */

  const customerCount =
    parties.filter(
      (party) =>
        party.partyType ===
        "CUSTOMER"
    ).length;

  const supplierCount =
    parties.filter(
      (party) =>
        party.partyType ===
        "SUPPLIER"
    ).length;

  const expenseCount =
    parties.filter(
      (party) =>
        party.partyType ===
        "COMPANY_EXPENSE"
    ).length;

  const activeCount =
    parties.filter(
      (party) =>
        party.status === "Active"
    ).length;

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    balanceFilter !== "ALL" ||
    dueDateFilter !== "ALL" ||
    sortBy !== "LATEST";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setBalanceFilter("ALL");
    setDueDateFilter("ALL");
    setSortBy("LATEST");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4">

        <div className="flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#17357A]">
              <span className="text-lg font-bold">
                P
              </span>
            </div>

            <div className="min-w-0">

              <h2 className="text-base font-bold text-slate-900">
                Parties
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
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
              active:scale-[0.98]
            "
          >
            <span className="text-base leading-none">
              +
            </span>

            Add Party
          </button>

        </div>

      </div>

      {/* =================================================
          FILTERS
          IMPORTANT:
          We are NOT redesigning PartyFilters.
      ================================================= */}

      <div className="shrink-0">
        <PartyFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={
            setStatusFilter
          }
          balanceFilter={
            balanceFilter
          }
          setBalanceFilter={
            setBalanceFilter
          }
          dueDateFilter={
            dueDateFilter
          }
          setDueDateFilter={
            setDueDateFilter
          }
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      {/* =================================================
          FILTER SUMMARY
      ================================================= */}

      <div className="shrink-0 border-b border-slate-100 bg-white px-4 pb-3">

        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">

          <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
            {filteredParties.length} of{" "}
            {parties.length}
          </span>

          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
            Customers {customerCount}
          </span>

          <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-700">
            Suppliers {supplierCount}
          </span>

          <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-[10px] font-semibold text-purple-700">
            Expenses {expenseCount}
          </span>

          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            Active {activeCount}
          </span>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto shrink-0 text-[10px] font-semibold text-[#17357A] hover:underline"
            >
              Clear
            </button>
          )}

        </div>

      </div>

      {/* =================================================
          PARTY CARDS
          THIS IS THE ONLY SCROLL AREA
      ================================================= */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          px-3
          py-3
          scrollbar-thin
          scrollbar-track-transparent
          scrollbar-thumb-slate-300
          hover:scrollbar-thumb-slate-400
        "
      >

        <div className="space-y-2">

          {filteredParties.length === 0 ? (

            <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">

              <div className="text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                  ?
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-800">
                  No Parties Found
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Try changing your search or filters.
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-3 text-xs font-semibold text-[#17357A] hover:underline"
                  >
                    Clear filters
                  </button>
                )}

              </div>

            </div>

          ) : (

            filteredParties.map(
              (party) => (
                <PartyCard
                  key={party._id}
                  party={party}
                  selected={
                    selectedParty?._id ===
                    party._id
                  }
                  onClick={() =>
                    setSelectedParty(
                      party
                    )
                  }
                />
              )
            )

          )}

        </div>

      </div>

    </div>
  );
};

export default PartyList;