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

import {
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from "lucide-react";

const AccountsPage = () => {
  const [parties, setParties] =
    useState<any[]>([]);

  const [selectedParty, setSelectedParty] =
    useState<any>(null);

  const [ledger, setLedger] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [partyModalOpen, setPartyModalOpen] =
    useState(false);

  const [editParty, setEditParty] =
    useState<any>(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    transactionType,
    setTransactionType,
  ] = useState<
    "MONEY_IN" | "MONEY_OUT"
  >("MONEY_IN");

  const [
    accountsExportOpen,
    setAccountsExportOpen,
  ] = useState(false);

  const customers =
    parties.filter(
      (party) =>
        party.partyType ===
        "CUSTOMER"
    );

  const suppliers =
    parties.filter(
      (party) =>
        party.partyType ===
        "SUPPLIER"
    );

  const companyExpenses =
    parties.filter(
      (party) =>
        party.partyType ===
        "COMPANY_EXPENSE"
    );

  const youllGet =
    parties
      .filter(
        (party) =>
          Number(
            party.currentBalance || 0
          ) > 0
      )
      .reduce(
        (sum, party) =>
          sum +
          Number(
            party.currentBalance || 0
          ),
        0
      );

  const youllGive =
    parties
      .filter(
        (party) =>
          Number(
            party.currentBalance || 0
          ) < 0
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

  const loadParties = async () => {
    try {
      const data =
        await getParties();

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

  const refreshAccounts =
    async () => {
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

        if (!latestParty) {
          setSelectedParty(null);
          setLedger([]);
          return;
        }

        setSelectedParty(
          latestParty
        );

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

  const handleSelectParty =
    async (party: any) => {
      setSelectedParty(party);

      await loadLedger(
        party._id
      );
    };

  const handleAddParty = () => {
    setEditParty(null);
    setPartyModalOpen(true);
  };

  const handleEditParty = () => {
    if (!selectedParty) {
      return;
    }

    setEditParty(
      selectedParty
    );

    setPartyModalOpen(true);
  };

  const handleClosePartyModal =
    () => {
      setPartyModalOpen(false);
      setEditParty(null);
    };

  const handlePartySuccess =
    async () => {
      try {
        const updatedParties =
          await loadParties();

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

  const handleMoneyIn = () => {
    if (!selectedParty) {
      return;
    }

    setTransactionType(
      "MONEY_IN"
    );

    setModalOpen(true);
  };

  const handleMoneyOut = () => {
    if (!selectedParty) {
      return;
    }

    setTransactionType(
      "MONEY_OUT"
    );

    setModalOpen(true);
  };

  const handleCloseTransactionModal =
    () => {
      setModalOpen(false);
    };

  const handleTransactionSuccess =
    async () => {
      await refreshAccounts();

      setModalOpen(false);
    };

  const handleViewReport = () => {
    if (!selectedParty) {
      return;
    }

    console.log(
      "View report:",
      selectedParty.companyName
    );
  };

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

  const handleExportAccounts =
    async (
      format: "PDF" | "EXCEL"
    ) => {
      setAccountsExportOpen(false);

      try {
        if (parties.length === 0) {
          alert(
            "No accounts available to export."
          );
          return;
        }

        const exportRows: any[] =
          [];

        for (
          const party of parties
        ) {
          try {
            const partyLedger =
              await getPartyLedger(
                party._id
              );

            partyLedger.forEach(
              (
                transaction: any
              ) => {
                exportRows.push({
                  date:
                    transaction.date,

                  partyCode:
                    party.partyCode ||
                    "--",

                  partyName:
                    party.companyName ||
                    "--",

                  partyType:
                    party.partyType ||
                    "--",

                  contactPerson:
                    party.contactPerson ||
                    "--",

                  transactionType:
                    transaction.transactionType ===
                    "MONEY_IN"
                      ? "Money In"
                      : "Money Out",

                  paymentMethod:
                    transaction.paymentMethod ||
                    "--",

                  amount:
                    Number(
                      transaction.amount ||
                        0
                    ),

                  balance:
                    Number(
                      transaction.balanceAfterTransaction ||
                        0
                    ),

                  remarks:
                    transaction.remarks ||
                    "--",
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

        exportRows.sort(
          (a, b) =>
            new Date(
              a.date
            ).getTime() -
            new Date(
              b.date
            ).getTime()
        );

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

        if (
          format === "PDF"
        ) {
          await exportAccountsPdf(
            exportRows,
            summary,
            "toy-hub-accounts-ledger"
          );
        }

        if (
          format === "EXCEL"
        ) {
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

  useEffect(() => {
    loadParties();
  }, []);

  return (
    <AdminLayout>

      <PageContainer className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <PageHeader
            title="Accounts"
            subtitle="Customer, Supplier & Company Expense Ledger"
            className="mb-0"
          />

          {/* WHOLE ACCOUNTS EXPORT */}

          <div className="relative shrink-0">

            <button
              type="button"
              onClick={() =>
                setAccountsExportOpen(
                  (value) => !value
                )
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#17357A] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(23,53,122,0.18)] transition hover:bg-[#10295d] active:scale-[0.98]"
            >
              <Download size={16} />

              Export Accounts

              <ChevronDown
                size={15}
                className={`transition-transform ${
                  accountsExportOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {accountsExportOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-[100] w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">

                <button
                  type="button"
                  onClick={() =>
                    handleExportAccounts(
                      "PDF"
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                    <FileText
                      size={15}
                    />
                  </div>

                  <div>
                    <p className="font-semibold">
                      Export PDF
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Full accounts report
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleExportAccounts(
                      "EXCEL"
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <FileSpreadsheet
                      size={15}
                    />
                  </div>

                  <div>
                    <p className="font-semibold">
                      Export Excel
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Full accounts spreadsheet
                    </p>
                  </div>
                </button>

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-5">

          <SummaryCard
            label="You'll Get"
            value={`₹${youllGet.toLocaleString(
              "en-IN"
            )}`}
            valueClass="text-emerald-600"
          />

          <SummaryCard
            label="You'll Give"
            value={`₹${youllGive.toLocaleString(
              "en-IN"
            )}`}
            valueClass="text-red-600"
          />

          <SummaryCard
            label="Customers"
            value={customers.length}
          />

          <SummaryCard
            label="Suppliers"
            value={suppliers.length}
          />

          <SummaryCard
            label="Company Expense"
            value={
              companyExpenses.length
            }
          />

        </div>

        {/* =================================================
            ACCOUNTS WORKSPACE
        ================================================= */}

        <div className="grid items-start gap-5 xl:grid-cols-12">

          {/* PARTY LIST */}

          <div className="min-w-0 xl:col-span-4">

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] xl:sticky xl:top-5">

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

          {/* LEDGER */}

          <div className="min-w-0 xl:col-span-8">

            <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

              <LedgerPanel
                selectedParty={
                  selectedParty
                }

                ledger={ledger}

                loading={loading}

                onMoneyIn={
                  handleMoneyIn
                }

                onMoneyOut={
                  handleMoneyOut
                }

                onDelete={
                  handleDeleteTransaction
                }

                onDeleteParty={
                  handleDeleteParty
                }

                onEditParty={
                  handleEditParty
                }

                onViewReport={
                  handleViewReport
                }

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

        {/* =================================================
            MODALS
        ================================================= */}

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

        <TransactionModal
          open={
            modalOpen
          }
          onClose={
            handleCloseTransactionModal
          }
          partyId={
            selectedParty?._id ||
            ""
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

interface SummaryCardProps {
  label: string;
  value: string | number;
  valueClass?: string;
}

const SummaryCard = ({
  label,
  value,
  valueClass = "text-slate-900",
}: SummaryCardProps) => {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_5px_18px_rgba(15,23,42,0.07)] sm:p-5">

      <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 truncate text-2xl font-bold tracking-tight sm:text-3xl ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
};

export default AccountsPage;