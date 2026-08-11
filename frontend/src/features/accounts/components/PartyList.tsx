import { useMemo, useState } from "react";

import PartyCard from "./PartyCard";
import PartyFilters from "./PartyFilters";

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
  // ==========================================
  // FILTER STATE
  // ==========================================

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [balanceFilter, setBalanceFilter] =
    useState("ALL");

  const [dueDateFilter, setDueDateFilter] =
    useState("ALL");

  const [sortBy, setSortBy] =
    useState("LATEST");

  // ==========================================
  // GET PARTY DUE DATE
  // ==========================================

  const getDueDate = (party: any) => {
    return (
      party.customerDetails?.dueDate ||
      party.supplierDetails?.dueDate ||
      null
    );
  };

  // ==========================================
  // DATE ONLY
  // Avoid timezone problems
  // ==========================================

  const getDateOnly = (value: any) => {
    if (!value) return null;

    const date = new Date(value);

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  };

  // ==========================================
  // FILTER + SORT
  // ==========================================

  const filteredParties = useMemo(() => {
    let data = [...parties];

    // ----------------------------------------
    // SEARCH
    // ----------------------------------------

    if (search.trim()) {
      const term =
        search.trim().toLowerCase();

      data = data.filter((party) => {
        return (
          party.companyName
            ?.toLowerCase()
            .includes(term) ||
          party.contactPerson
            ?.toLowerCase()
            .includes(term) ||
          party.partyCode
            ?.toLowerCase()
            .includes(term)
        );
      });
    }

    // ----------------------------------------
    // STATUS
    // ----------------------------------------

    if (statusFilter !== "ALL") {
      data = data.filter(
        (party) =>
          party.status === statusFilter
      );
    }

    // ----------------------------------------
    // BALANCE
    // ----------------------------------------

    if (balanceFilter !== "ALL") {
      data = data.filter((party) => {
        const balance =
          Number(
            party.currentBalance
          ) || 0;

        switch (balanceFilter) {
          case "GET":
            return balance > 0;

          case "GIVE":
            return balance < 0;

          case "ZERO":
            return balance === 0;

          default:
            return true;
        }
      });
    }

    // ----------------------------------------
    // DUE DATE
    // ----------------------------------------

    if (dueDateFilter !== "ALL") {
      const today = getDateOnly(
        new Date()
      );

      data = data.filter((party) => {
        const dueDate =
          getDateOnly(
            getDueDate(party)
          );

        // No due date
        if (!dueDate) {
          return dueDateFilter === "NONE";
        }

        if (!today) return false;

        switch (dueDateFilter) {
          case "OVERDUE":
            return dueDate < today;

          case "TODAY":
            return (
              dueDate.getTime() ===
              today.getTime()
            );

          case "UPCOMING":
            return dueDate > today;

          case "NONE":
            return false;

          default:
            return true;
        }
      });
    }

    // ----------------------------------------
    // SORT
    // ----------------------------------------

    switch (sortBy) {
      case "OLDEST":
        data.sort(
          (a, b) =>
            new Date(
              a.createdAt
            ).getTime() -
            new Date(
              b.createdAt
            ).getTime()
        );
        break;

      case "A_Z":
        data.sort((a, b) =>
          (
            a.companyName || ""
          ).localeCompare(
            b.companyName || ""
          )
        );
        break;

      case "Z_A":
        data.sort((a, b) =>
          (
            b.companyName || ""
          ).localeCompare(
            a.companyName || ""
          )
        );
        break;

      case "HIGH":
        data.sort(
          (a, b) =>
            Math.abs(
              Number(
                b.currentBalance
              ) || 0
            ) -
            Math.abs(
              Number(
                a.currentBalance
              ) || 0
            )
        );
        break;

      case "LOW":
        data.sort(
          (a, b) =>
            Math.abs(
              Number(
                a.currentBalance
              ) || 0
            ) -
            Math.abs(
              Number(
                b.currentBalance
              ) || 0
            )
        );
        break;

      case "LATEST":
      default:
        data.sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );
        break;
    }

    return data;
  }, [
    parties,
    search,
    statusFilter,
    balanceFilter,
    dueDateFilter,
    sortBy,
  ]);

  // ==========================================
  // GROUPS
  // ==========================================

  const customers =
    filteredParties.filter(
      (party) =>
        party.partyType === "CUSTOMER"
    );

  const suppliers =
    filteredParties.filter(
      (party) =>
        party.partyType === "SUPPLIER"
    );

  const expenses =
    filteredParties.filter(
      (party) =>
        party.partyType ===
        "COMPANY_EXPENSE"
    );

  // ==========================================
  // PARTY CARD
  // ==========================================

  const renderParty = (party: any) => {
    return (
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
    );
  };

  // ==========================================
  // EMPTY STATE
  // ==========================================

  const noResults =
    filteredParties.length === 0;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="flex h-full flex-col">

      {/* ======================================
          FILTERS
      ====================================== */}

      <PartyFilters
        search={search}
        setSearch={setSearch}

        statusFilter={statusFilter}
        setStatusFilter={
          setStatusFilter
        }

        balanceFilter={balanceFilter}
        setBalanceFilter={
          setBalanceFilter
        }

        dueDateFilter={dueDateFilter}
        setDueDateFilter={
          setDueDateFilter
        }

        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* ======================================
          ADD PARTY
      ====================================== */}

      <div className="border-b border-slate-200 bg-white px-4 pb-4">

        <button
          type="button"
          onClick={onAddParty}
          className="w-full rounded-xl bg-[#17357A] py-3 text-sm font-semibold text-white transition hover:bg-[#20459D]"
        >
          + Add Party
        </button>

      </div>

      {/* ======================================
          LIST
      ====================================== */}

      <div className="flex-1 overflow-y-auto bg-slate-50">

        {noResults ? (

          <div className="flex min-h-[300px] items-center justify-center p-6">

            <div className="text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                🔎
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No parties found
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Try changing your search or filters.
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* ==================================
                CUSTOMERS
            ================================== */}

            {customers.length > 0 && (
              <div className="p-4">

                <div className="mb-3 flex items-center justify-between">

                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Customers
                  </h3>

                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                    {customers.length}
                  </span>

                </div>

                <div className="space-y-3">
                  {customers.map(
                    renderParty
                  )}
                </div>

              </div>
            )}

            {/* ==================================
                SUPPLIERS
            ================================== */}

            {suppliers.length > 0 && (
              <div className="border-t border-slate-200 p-4">

                <div className="mb-3 flex items-center justify-between">

                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Suppliers
                  </h3>

                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
                    {suppliers.length}
                  </span>

                </div>

                <div className="space-y-3">
                  {suppliers.map(
                    renderParty
                  )}
                </div>

              </div>
            )}

            {/* ==================================
                COMPANY EXPENSE
            ================================== */}

            {expenses.length > 0 && (
              <div className="border-t border-slate-200 p-4">

                <div className="mb-3 flex items-center justify-between">

                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Company Expense
                  </h3>

                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
                    {expenses.length}
                  </span>

                </div>

                <div className="space-y-3">
                  {expenses.map(
                    renderParty
                  )}
                </div>

              </div>
            )}

          </>

        )}

      </div>

    </div>
  );
};

export default PartyList;