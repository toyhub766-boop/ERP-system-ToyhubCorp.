import { useEffect, useRef, useState } from "react";

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

import { exportPartyLedgerPdf } from "../../../utils/exportPartyLedgerPdf";
import { exportPartyLedgerExcel } from "../../../utils/exportPartyLedgerExcel";

import { exportAccountsPdf } from "../../../utils/exportAccountsPdf";
import { exportAccountsExcel } from "../../../utils/exportAccountsExcel";

import {
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

const AccountsPage = () => {
  const [parties, setParties] = useState<any[]>([]);

  /*
   * This is the exact list currently visible
   * after PartyList filters are applied.
   */
  const [filteredParties, setFilteredParties] =
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

  const [transactionType, setTransactionType] =
    useState<"MONEY_IN" | "MONEY_OUT">(
      "MONEY_IN"
    );

  const [accountsExportOpen, setAccountsExportOpen] =
    useState(false);

  const exportAccountsRef =
    useRef<HTMLDivElement>(null);

  /* ============================================================
     SUMMARY DATA
  ============================================================ */

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

  const youllGet = parties
    .filter(
      (party) =>
        Number(party.currentBalance || 0) > 0
    )
    .reduce(
      (sum, party) =>
        sum +
        Number(party.currentBalance || 0),
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
          Number(party.currentBalance || 0)
        ),
      0
    );

  /* ============================================================
     LOAD PARTIES
  ============================================================ */

  const loadParties = async () => {
    try {
      const data = await getParties();

      setParties(data);

      /*
       * Keep filtered parties initially aligned
       * with the complete list.
       *
       * PartyList will immediately replace this
       * with its actual filtered result.
       */
      setFilteredParties(data);

      return data;
    } catch (error) {
      console.error(
        "Failed to load parties:",
        error
      );

      setParties([]);
      setFilteredParties([]);

      return [];
    }
  };

  /* ============================================================
     LOAD LEDGER
  ============================================================ */

  const loadLedger = async (
    partyId: string
  ) => {
    try {
      setLoading(true);

      const data =
        await getPartyLedger(partyId);

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

  /* ============================================================
     SELECT PARTY
  ============================================================ */

  const handleSelectParty = async (
    party: any
  ) => {
    setSelectedParty(party);

    await loadLedger(party._id);
  };

  /* ============================================================
     MOBILE BACK TO PARTY LIST
  ============================================================ */

  const handleMobileBack = () => {
    setSelectedParty(null);
    setLedger([]);
  };

  /* ============================================================
     REFRESH ACCOUNTS
  ============================================================ */

  const refreshAccounts = async () => {
    const updated =
      await loadParties();

    if (!selectedParty) {
      return;
    }

    const latest =
      updated.find(
        (party: any) =>
          party._id ===
          selectedParty._id
      );

    if (!latest) {
      setSelectedParty(null);
      setLedger([]);

      return;
    }

    setSelectedParty(latest);

    await loadLedger(
      latest._id
    );
  };

  /* ============================================================
     PARTY ACTIONS
  ============================================================ */

  const handleAddParty = () => {
    setEditParty(null);
    setPartyModalOpen(true);
  };

  const handleEditParty = () => {
    if (!selectedParty) {
      return;
    }

    setEditParty(selectedParty);
    setPartyModalOpen(true);
  };

  const handleDeleteParty = async () => {
    if (!selectedParty) {
      return;
    }

    if (
      !window.confirm(
        `Delete ${selectedParty.companyName}?`
      )
    ) {
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
        error?.response?.data?.message ||
          "Failed to delete party."
      );
    }
  };

  /* ============================================================
     TRANSACTION ACTIONS
  ============================================================ */

  const handleMoneyIn = () => {
    if (!selectedParty) {
      return;
    }

    setTransactionType("MONEY_IN");
    setModalOpen(true);
  };

  const handleMoneyOut = () => {
    if (!selectedParty) {
      return;
    }

    setTransactionType("MONEY_OUT");
    setModalOpen(true);
  };

  const handleDeleteTransaction =
    async (
      transactionId: string
    ) => {
      if (
        !window.confirm(
          "Delete this transaction?"
        )
      ) {
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
          error?.response?.data?.message ||
            "Failed to delete transaction."
        );
      }
    };

  /* ============================================================
     PARTY MODAL SUCCESS
  ============================================================ */

  const handlePartySuccess = async () => {
    const updated =
      await loadParties();

    if (editParty) {
      const latest =
        updated.find(
          (party: any) =>
            party._id ===
            editParty._id
        );

      if (latest) {
        setSelectedParty(latest);

        await loadLedger(
          latest._id
        );
      }
    }

    setPartyModalOpen(false);
    setEditParty(null);
  };

  /* ============================================================
     SELECTED PARTY EXPORTS
  ============================================================ */

  const handleExportPdf = async () => {
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
        "Party PDF export failed:",
        error
      );

      alert(
        "Failed to export party ledger PDF."
      );
    }
  };

  const handleExportExcel = async () => {
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
        "Party Excel export failed:",
        error
      );

      alert(
        "Failed to export party ledger Excel."
      );
    }
  };

  /* ============================================================
     WHOLE ACCOUNTS EXPORT
  ============================================================ */

  const handleExportAccounts = async (
  format: "PDF" | "EXCEL"
) => {
  setAccountsExportOpen(false);

  try {
    // IMPORTANT:
    // Export exactly the parties currently visible
    // after all filters.
    const partiesToExport = filteredParties;

    if (partiesToExport.length === 0) {
      alert("There are no accounts to export.");
      return;
    }

    const rows: any[] = [];

    for (const party of partiesToExport) {
      let youllGive = 0;
      let youllGet = 0;

      // ----------------------------------------------------------
      // Load transactions only to calculate You Gave / You Got.
      // The PARTY itself is always exported, even with zero
      // transactions.
      // ----------------------------------------------------------

      try {
        const partyLedger = await getPartyLedger(
          party._id
        );

        if (Array.isArray(partyLedger)) {
          partyLedger.forEach(
            (transaction: any) => {
              const amount = Number(
                transaction.amount || 0
              );

              if (
                transaction.transactionType ===
                "MONEY_OUT"
              ) {
                youllGive += amount;
              }

              if (
                transaction.transactionType ===
                "MONEY_IN"
              ) {
                youllGet += amount;
              }
            }
          );
        }
      } catch (error) {
        console.error(
          `Failed to load ledger for ${party.companyName}:`,
          error
        );

        // Do NOT remove the party from the export.
        // It simply gets zero transaction values.
      }

      // ----------------------------------------------------------
      // ONE ROW PER PARTY
      // ----------------------------------------------------------

      rows.push({
        partyCode:
          party.partyCode || "--",

        partyName:
          party.companyName || "--",

        contactPerson:
          party.contactPerson || "--",

        openingBalance: Number(
          party.openingBalance || 0
        ),

        youllGive,

        youllGet,

        balance: Number(
          party.currentBalance || 0
        ),
      });
    }

    // ----------------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------------

    const customers =
      partiesToExport.filter(
        (party) =>
          party.partyType === "CUSTOMER"
      ).length;

    const suppliers =
      partiesToExport.filter(
        (party) =>
          party.partyType === "SUPPLIER"
      ).length;

    const companyExpenses =
      partiesToExport.filter(
        (party) =>
          party.partyType ===
          "COMPANY_EXPENSE"
      ).length;

    const totalYoullGet =
      rows.reduce(
        (sum, row) =>
          sum + Number(row.youllGet || 0),
        0
      );

    const totalYoullGive =
      rows.reduce(
        (sum, row) =>
          sum + Number(row.youllGive || 0),
        0
      );

    const summary = {
      totalParties:
        partiesToExport.length,

      customers,

      suppliers,

      companyExpenses,

      youllGet:
        totalYoullGet,

      youllGive:
        totalYoullGive,
    };

    // ----------------------------------------------------------
    // EXPORT
    // ----------------------------------------------------------

    if (format === "PDF") {
      await exportAccountsPdf(
        rows,
        summary,
        "toy-hub-whole-accounts-ledger"
      );
    } else {
      await exportAccountsExcel(
        rows,
        summary,
        "toy-hub-whole-accounts-ledger"
      );
    }
  } catch (error) {
    console.error(
      "Accounts export failed:",
      error
    );

    alert(
      "Failed to export whole accounts ledger."
    );
  }
};
  /* ============================================================
     EFFECTS
  ============================================================ */

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        exportAccountsRef.current &&
        !exportAccountsRef.current.contains(
          event.target as Node
        )
      ) {
        setAccountsExportOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <AdminLayout>
      <PageContainer
        className="
          gap-5
          pb-5
        "
      >

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          className="
            flex
            shrink-0
            items-start
            justify-between
            gap-4
          "
        >
          <PageHeader
            title="Accounts"
            subtitle="Customer, Supplier & Company Expense Ledger"
            className="mb-0"
          />

          <div
            ref={exportAccountsRef}
            className="
              relative
              shrink-0
            "
          >
            <button
              type="button"
              onClick={() =>
                setAccountsExportOpen(
                  (open) => !open
                )
              }
              className="
                inline-flex
                h-10
                items-center
                gap-2
                rounded-xl
                bg-[#17357A]
                px-4
                text-xs
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-[#10295d]
                sm:h-11
                sm:text-sm
              "
            >
              <Download size={16} />

              <span>
                Export Accounts
              </span>

              <ChevronDown
                size={15}
                className={
                  accountsExportOpen
                    ? "rotate-180 transition-transform"
                    : "transition-transform"
                }
              />
            </button>

            {accountsExportOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[calc(100%+8px)]
                  z-[200]
                  w-56
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-1.5
                  shadow-xl
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    handleExportAccounts(
                      "PDF"
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-3
                    text-left
                    hover:bg-slate-50
                  "
                >
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-red-50
                      text-red-500
                    "
                  >
                    <FileText size={15} />
                  </span>

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Export PDF
                    </span>

                    <span className="text-[11px] text-slate-400">
                      Whole accounts ledger
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleExportAccounts(
                      "EXCEL"
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-3
                    text-left
                    hover:bg-slate-50
                  "
                >
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-emerald-50
                      text-emerald-600
                    "
                  >
                    <FileSpreadsheet size={15} />
                  </span>

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Export Excel
                    </span>

                    <span className="text-[11px] text-slate-400">
                      Whole accounts ledger
                    </span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            SUMMARY
        ====================================================== */}

        <div
          className="
            grid
            shrink-0
            grid-cols-2
            gap-3
            lg:grid-cols-5
          "
        >
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
            value={companyExpenses.length}
          />
        </div>

        {/* ======================================================
            DESKTOP WORKSPACE
        ====================================================== */}

        <div
          className="
            hidden
            min-h-0
            h-[720px]
            grid-cols-12
            gap-5
            xl:grid
          "
        >
          <section
            className="
              flex
              h-full
              min-h-0
              min-w-0
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-[0_2px_12px_rgba(15,23,42,0.04)]
              xl:col-span-4
            "
          >
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
              onFilteredPartiesChange={
                setFilteredParties
              }
            />
          </section>

          <section
            className="
              flex
              h-full
              min-h-0
              min-w-0
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-[0_2px_12px_rgba(15,23,42,0.04)]
              xl:col-span-8
            "
          >
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
              onViewReport={() => {}}
              onExportPdf={
                handleExportPdf
              }
              onExportExcel={
                handleExportExcel
              }
            />
          </section>
        </div>

        {/* ======================================================
            MOBILE / TABLET WORKSPACE
        ====================================================== */}

        <div
          className="
            min-h-0
            xl:hidden
          "
        >
          {!selectedParty && (
            <section
              className="
                flex
                h-[560px]
                min-h-0
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-[0_2px_12px_rgba(15,23,42,0.04)]
                sm:h-[620px]
              "
            >
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
                onFilteredPartiesChange={
                  setFilteredParties
                }
              />
            </section>
          )}

          {selectedParty && (
            <section
              className="
                flex
                h-[560px]
                min-h-0
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-[0_2px_12px_rgba(15,23,42,0.04)]
                sm:h-[620px]
              "
            >
              <div
                className="
                  flex
                  h-12
                  shrink-0
                  items-center
                  gap-2
                  border-b
                  border-slate-200
                  bg-white
                  px-3
                "
              >
                <button
                  type="button"
                  onClick={
                    handleMobileBack
                  }
                  className="
                    inline-flex
                    h-9
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-lg
                    px-2
                    text-xs
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-100
                    hover:text-slate-900
                    active:scale-[0.98]
                  "
                >
                  <ArrowLeft
                    size={15}
                  />

                  <span>
                    Parties
                  </span>
                </button>

                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <p
                    className="
                      truncate
                      text-xs
                      font-semibold
                      text-slate-800
                    "
                  >
                    {
                      selectedParty.companyName
                    }
                  </p>

                  <p
                    className="
                      truncate
                      text-[10px]
                      text-slate-400
                    "
                  >
                    {
                      selectedParty.partyCode
                    }
                  </p>
                </div>
              </div>

              <div
                className="
                  min-h-0
                  flex-1
                  overflow-hidden
                "
              >
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
                  onViewReport={() => {}}
                  onExportPdf={
                    handleExportPdf
                  }
                  onExportExcel={
                    handleExportExcel
                  }
                />
              </div>
            </section>
          )}
        </div>

        {/* ======================================================
            MODALS
        ====================================================== */}

        <AddPartyModal
          open={partyModalOpen}
          editParty={editParty}
          onClose={() => {
            setPartyModalOpen(false);
            setEditParty(null);
          }}
          onSuccess={
            handlePartySuccess
          }
        />

        <TransactionModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
          partyId={
            selectedParty?._id || ""
          }
          transactionType={
            transactionType
          }
          onSuccess={async () => {
            await refreshAccounts();
            setModalOpen(false);
          }}
        />

      </PageContainer>
    </AdminLayout>
  );
};

/* ================================================================
   SUMMARY CARD
================================================================ */

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
    <div
      className="
        min-w-0
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-4
        py-3.5
        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
        sm:px-5
        sm:py-4
      "
    >
      <p
        className="
          truncate
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.08em]
          text-slate-400
          sm:text-[11px]
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1.5
          truncate
          text-2xl
          font-bold
          tracking-tight
          sm:text-3xl
          ${valueClass}
        `}
      >
        {value}
      </p>
    </div>
  );
};

export default AccountsPage;