import { useEffect, useState } from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";
import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";

import PartyList from "../components/PartyList";
import LedgerPanel from "../components/LedgerPanel";
import TransactionModal from "../components/TransactionModal";
import AddPartyModal from "../components/AddPartyModal";

import {
  getParties,
  deleteParty,
} from "../services/accountParty.service";

import {
  getPartyLedger,
  deleteTransaction,
} from "../services/accountTransaction.service";

import {
  exportPartyLedgerPdf,
} from "../../../utils/exportPartyLedgerPdf";

import {
  exportPartyLedgerExcel,
} from "../../../utils/exportPartyLedgerExcel";

import {
  exportAccountsPdf,
} from "../../../utils/exportAccountsPdf";

import {
  exportAccountsExcel,
} from "../../../utils/exportAccountsExcel";

const AccountsPage = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [parties, setParties] = useState<any[]>([]);

  const [selectedParty, setSelectedParty] =
    useState<any>(null);

  const [ledger, setLedger] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [partyModalOpen, setPartyModalOpen] =
    useState(false);

  const [editParty, setEditParty] =
    useState<any>(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    transactionType,
    setTransactionType,
  ] = useState<"MONEY_IN" | "MONEY_OUT">(
    "MONEY_IN"
  );

  // ==========================================
  // PARTY COUNTS
  // ==========================================

  const customers = parties.filter(
    (party) =>
      party.partyType === "CUSTOMER"
  );

  const suppliers = parties.filter(
    (party) =>
      party.partyType === "SUPPLIER"
  );

  const companyExpenses = parties.filter(
    (party) =>
      party.partyType === "COMPANY_EXPENSE"
  );

  // ==========================================
  // BALANCE SUMMARY
  // ==========================================

  const youllGet = parties
    .filter(
      (party) =>
        Number(party.currentBalance || 0) > 0
    )
    .reduce(
      (sum, party) =>
        sum +
        Number(
          party.currentBalance || 0
        ),
      0
    );

  const youllGive = parties
    .filter(
      (party) =>
        Number(party.currentBalance || 0) < 0
    )
    .reduce(
      (sum, party) =>
        sum +
        Math.abs(
          Number(
            party.currentBalance || 0
          )
        ),
      0
    );

  // ==========================================
  // LOAD ALL PARTIES
  // ==========================================

  const loadParties = async () => {
    try {
      const data = await getParties();

      setParties(data);

      return data;
    } catch (error) {
      console.error(
        "Failed to load parties:",
        error
      );

      setParties([]);

      return [];
    }
  };

  // ==========================================
  // LOAD PARTY LEDGER
  // ==========================================

  const loadLedger = async (
    partyId: string
  ) => {
    try {
      setLoading(true);

      const data =
        await getPartyLedger(
          partyId
        );

      setLedger(data);
    } catch (error) {
      console.error(
        "Failed to load ledger:",
        error
      );

      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REFRESH ACCOUNTS
  // ==========================================

  const refreshAccounts = async () => {
    try {
      const updatedParties =
        await loadParties();

      if (!selectedParty) {
        return;
      }

      const latestParty =
        updatedParties.find(
          (party: any) =>
            party._id ===
            selectedParty._id
        );

      // Party was deleted
      if (!latestParty) {
        setSelectedParty(null);
        setLedger([]);
        return;
      }

      // Refresh selected party
      setSelectedParty(
        latestParty
      );

      // Refresh its ledger
      await loadLedger(
        latestParty._id
      );
    } catch (error) {
      console.error(
        "Failed to refresh accounts:",
        error
      );
    }
  };

  // ==========================================
  // SELECT PARTY
  // ==========================================

  const handleSelectParty = async (
    party: any
  ) => {
    setSelectedParty(party);

    await loadLedger(
      party._id
    );
  };

  // ==========================================
  // ADD PARTY
  // ==========================================

  const handleAddParty = () => {
    setEditParty(null);
    setPartyModalOpen(true);
  };

  // ==========================================
  // EDIT PARTY
  // ==========================================

  const handleEditParty = () => {
    if (!selectedParty) {
      return;
    }

    setEditParty(
      selectedParty
    );

    setPartyModalOpen(true);
  };

  // ==========================================
  // PARTY MODAL CLOSE
  // ==========================================

  const handleClosePartyModal = () => {
    setPartyModalOpen(false);
    setEditParty(null);
  };

  // ==========================================
  // PARTY CREATED / UPDATED
  // ==========================================

  const handlePartySuccess =
    async () => {
      try {
        const updatedParties =
          await loadParties();

        /*
         * If we were editing an existing
         * party, keep that party selected.
         */
        if (editParty) {
          const latestParty =
            updatedParties.find(
              (party: any) =>
                party._id ===
                editParty._id
            );

          if (latestParty) {
            setSelectedParty(
              latestParty
            );

            await loadLedger(
              latestParty._id
            );
          }
        }

        setPartyModalOpen(false);
        setEditParty(null);
      } catch (error) {
        console.error(
          "Failed to refresh after party update:",
          error
        );
      }
    };

  // ==========================================
  // DELETE TRANSACTION
  // ==========================================

  const handleDeleteTransaction =
    async (
      transactionId: string
    ) => {
      const confirmed =
        window.confirm(
          "Delete this transaction?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteTransaction(
          transactionId
        );

        await refreshAccounts();
      } catch (error: any) {
        console.error(
          "Failed to delete transaction:",
          error
        );

        alert(
          error?.response?.data
            ?.message ??
            "Failed to delete transaction."
        );
      }
    };

  // ==========================================
  // DELETE PARTY
  // ==========================================

  const handleDeleteParty =
    async () => {
      if (!selectedParty) {
        return;
      }

      const confirmed =
        window.confirm(
          `Delete "${selectedParty.companyName}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteParty(
          selectedParty._id
        );

        await loadParties();

        setSelectedParty(null);
        setLedger([]);
      } catch (error: any) {
        console.error(
          "Failed to delete party:",
          error
        );

        alert(
          error?.response?.data
            ?.message ??
            "Failed to delete party."
        );
      }
    };

  // ==========================================
  // MONEY IN
  // ==========================================

  const handleMoneyIn = () => {
    if (!selectedParty) {
      return;
    }

    setTransactionType(
      "MONEY_IN"
    );

    setModalOpen(true);
  };

  // ==========================================
  // MONEY OUT
  // ==========================================

  const handleMoneyOut = () => {
    if (!selectedParty) {
      return;
    }

    setTransactionType(
      "MONEY_OUT"
    );

    setModalOpen(true);
  };

  // ==========================================
  // CLOSE TRANSACTION MODAL
  // ==========================================

  const handleCloseTransactionModal =
    () => {
      setModalOpen(false);
    };

  // ==========================================
  // TRANSACTION SUCCESS
  // ==========================================

  const handleTransactionSuccess =
    async () => {
      await refreshAccounts();

      setModalOpen(false);
    };

  // ==========================================
  // VIEW REPORT
  // ==========================================

  const handleViewReport = () => {
    if (!selectedParty) {
      return;
    }

    /*
     * Report UI can be connected here.
     *
     * We intentionally don't fake a report
     * action until the report component/page
     * is defined.
     */
    console.log(
      "View report:",
      selectedParty.companyName
    );
  };

  // ==========================================
  // EXPORT PARTY PDF
  // ==========================================

  const handleExportPdf =
    async () => {
      if (!selectedParty) {
        return;
      }

      try {
        await exportPartyLedgerPdf(
          selectedParty,
          ledger
        );
      } catch (error) {
        console.error(
          "PDF export failed:",
          error
        );

        alert(
          "Failed to export PDF."
        );
      }
    };

  // ==========================================
  // EXPORT PARTY EXCEL
  // ==========================================

  const handleExportExcel =
    async () => {
      if (!selectedParty) {
        return;
      }

      try {
        await exportPartyLedgerExcel(
          selectedParty,
          ledger
        );
      } catch (error) {
        console.error(
          "Excel export failed:",
          error
        );

        alert(
          "Failed to export Excel."
        );
      }
    };

    // ==========================================
// EXPORT WHOLE ACCOUNTS LEDGER
// ==========================================

const handleExportAccounts = async (
  format: "PDF" | "EXCEL"
) => {
  try {
    if (parties.length === 0) {
      alert("No accounts available to export.");
      return;
    }

    const exportRows: any[] = [];

    // Fetch ledger for every party
    for (const party of parties) {
      try {
        const partyLedger =
          await getPartyLedger(party._id);

        partyLedger.forEach(
          (transaction: any) => {
            exportRows.push({
              date: transaction.date,

              partyCode:
                party.partyCode || "--",

              partyName:
                party.companyName || "--",

              partyType:
                party.partyType || "--",

              contactPerson:
                party.contactPerson || "--",

              transactionType:
                transaction.transactionType ===
                "MONEY_IN"
                  ? "Money In"
                  : "Money Out",

              paymentMethod:
                transaction.paymentMethod || "--",

              amount:
                Number(
                  transaction.amount || 0
                ),

              balance:
                Number(
                  transaction.balanceAfterTransaction ||
                    0
                ),

              remarks:
                transaction.remarks || "--",
            });
          }
        );
      } catch (error) {
        console.error(
          `Failed to load ledger for ${party.companyName}:`,
          error
        );
      }
    }

    // Sort oldest → newest
    exportRows.sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

    // ======================================
    // SUMMARY
    // ======================================

    const summary = {
      totalParties:
        parties.length,

      customers:
        customers.length,

      suppliers:
        suppliers.length,

      companyExpenses:
        companyExpenses.length,

      youllGet,

      youllGive,
    };

    // ======================================
    // EXPORT
    // ======================================

    if (format === "PDF") {
      await exportAccountsPdf(
        exportRows,
        summary,
        "toy-hub-accounts-ledger"
      );
    }

    if (format === "EXCEL") {
      await exportAccountsExcel(
        exportRows,
        summary,
        "toy-hub-accounts-ledger"
      );
    }
  } catch (error) {
    console.error(
      "Accounts export failed:",
      error
    );

    alert(
      "Failed to export accounts ledger."
    );
  }
};

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadParties();
  }, []);

  // ==========================================
  // UI
  // ==========================================

  return (
    <AdminLayout>
      <PageContainer className="space-y-6">

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

  <PageHeader
    title="Accounts"
    subtitle="Customer, Supplier & Company Expense Ledger"
  />

  <div className="relative group">

    <button
      type="button"
      className="rounded-xl bg-[#17357A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#10295d]"
    >
      Export Accounts
    </button>

    <div className="absolute right-0 z-50 mt-2 hidden w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl group-hover:block">

      <button
        type="button"
        onClick={() =>
          handleExportAccounts("PDF")
        }
        className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Export Accounts PDF
      </button>

      <button
        type="button"
        onClick={() =>
          handleExportAccounts("EXCEL")
        }
        className="block w-full border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Export Accounts Excel
      </button>

    </div>

  </div>

</div>

        {/* =====================================
            SUMMARY CARDS
        ===================================== */}

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">

          {/* You'll Get */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              You'll Get
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              ₹
              {youllGet.toLocaleString(
                "en-IN"
              )}
            </h2>
          </div>

          {/* You'll Give */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              You'll Give
            </p>

            <h2 className="mt-2 text-3xl font-bold text-red-600">
              ₹
              {youllGive.toLocaleString(
                "en-IN"
              )}
            </h2>
          </div>

          {/* Customers */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Customers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {customers.length}
            </h2>
          </div>

          {/* Suppliers */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Suppliers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {suppliers.length}
            </h2>
          </div>

          {/* Company Expense */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Company Expense
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {companyExpenses.length}
            </h2>
          </div>

        </div>

        {/* =====================================
            MAIN ACCOUNTS AREA
        ===================================== */}

        <div className="grid gap-6 xl:grid-cols-12">

          {/* ===================================
              LEFT — PARTY LIST
          =================================== */}

          <div className="xl:col-span-4">

            <div className="h-[74vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <PartyList
                parties={parties}
                selectedParty={
                  selectedParty
                }
                setSelectedParty={
                  handleSelectParty
                }
                onAddParty={
                  handleAddParty
                }
              />

            </div>

          </div>

          {/* ===================================
              RIGHT — LEDGER
          =================================== */}

          <div className="xl:col-span-8">

            <div className="h-[74vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <LedgerPanel

                selectedParty={
                  selectedParty
                }

                ledger={ledger}

                loading={loading}

                /* Money */

                onMoneyIn={
                  handleMoneyIn
                }

                onMoneyOut={
                  handleMoneyOut
                }

                /* Transactions */

                onDelete={
                  handleDeleteTransaction
                }

                /* Party */

                onDeleteParty={
                  handleDeleteParty
                }

                onEditParty={
                  handleEditParty
                }

                /* Reports */

                onViewReport={
                  handleViewReport
                }

                /* Exports */

                onExportPdf={
                  handleExportPdf
                }

                onExportExcel={
                  handleExportExcel
                }

              />

            </div>

          </div>

        </div>

        {/* =====================================
            ADD / EDIT PARTY MODAL
        ===================================== */}

        <AddPartyModal

          open={
            partyModalOpen
          }

          editParty={
            editParty
          }

          onClose={
            handleClosePartyModal
          }

          onSuccess={
            handlePartySuccess
          }

        />

        {/* =====================================
            MONEY IN / MONEY OUT MODAL
        ===================================== */}

        <TransactionModal

          open={
            modalOpen
          }

          onClose={
            handleCloseTransactionModal
          }

          partyId={
            selectedParty?._id || ""
          }

          transactionType={
            transactionType
          }

          onSuccess={
            handleTransactionSuccess
          }

        />

      </PageContainer>
    </AdminLayout>
  );
};

export default AccountsPage;