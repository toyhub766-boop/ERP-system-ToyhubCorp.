import {
  useEffect,
  useRef,
  useState,
} from "react";

import AccountantLayout from "../layouts/AccountantLayout";

import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";

import PartyList from "../../accounts/components/PartyList";
import LedgerPanel from "../../accounts/components/LedgerPanel";
import TransactionModal from "../../accounts/components/TransactionModal";
import AddPartyModal from "../../accounts/components/AddPartyModal";

import {
  getParties,
  deleteParty,
} from "../../accounts/services/accountParty.service";

import {
  getPartyLedger,
  deleteTransaction,
} from "../../accounts/services/accountTransaction.service";

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
  ArrowLeft,
  ChevronDown,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

const AccountsPage = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [parties, setParties] =
    useState<any[]>([]);

  const [
    filteredParties,
    setFilteredParties,
  ] = useState<any[]>([]);

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
    useState<
      "MONEY_IN" | "MONEY_OUT"
    >("MONEY_IN");

  const [
    accountsExportOpen,
    setAccountsExportOpen,
  ] = useState(false);

  const exportAccountsRef =
    useRef<HTMLDivElement>(null);

  // ============================================================
  // SUMMARY
  // ============================================================

  const customers = parties.filter(
    (party) =>
      party.partyType === "CUSTOMER"
  );

  const suppliers = parties.filter(
    (party) =>
      party.partyType === "SUPPLIER"
  );

  const companyExpenses =
    parties.filter(
      (party) =>
        party.partyType ===
        "COMPANY_EXPENSE"
    );

  const youllGet = parties
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

  const youllGive = parties
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

  // ============================================================
  // LOAD PARTIES
  // ============================================================

  const loadParties = async () => {
    try {
      const data = await getParties();

      setParties(data);
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

  // ============================================================
  // LOAD PARTY LEDGER
  // ============================================================

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
        "Failed to load party ledger:",
        error
      );

      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // REFRESH
  // ============================================================

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

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadParties();
  }, []);

  // ============================================================
  // CLOSE EXPORT DROPDOWN
  // ============================================================

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
        setAccountsExportOpen(
          false
        );
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

  // ============================================================
  // SELECT PARTY
  // ============================================================

  const handleSelectParty =
    async (party: any) => {
      setSelectedParty(party);

      await loadLedger(
        party._id
      );
    };

  // ============================================================
  // MOBILE BACK
  // ============================================================

  const handleMobileBack = () => {
    setSelectedParty(null);
    setLedger([]);
  };

  // ============================================================
  // ADD PARTY
  // ============================================================

  const handleAddParty = () => {
    setEditParty(null);
    setPartyModalOpen(true);
  };

  // ============================================================
  // EDIT PARTY
  // ============================================================

  const handleEditParty = () => {
    if (!selectedParty) {
      return;
    }

    setEditParty(
      selectedParty
    );

    setPartyModalOpen(true);
  };

  // ============================================================
  // DELETE PARTY
  // ============================================================

  const handleDeleteParty = async () => {
    if (!selectedParty) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${selectedParty.companyName}?`
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
        error?.response?.data?.message ||
          "Failed to delete party."
      );
    }
  };

  // ============================================================
  // DELETE TRANSACTION
  // ============================================================

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
          error?.response?.data?.message ||
            "Failed to delete transaction."
        );
      }
    };

  // ============================================================
  // PARTY SUCCESS
  // ============================================================

  const handlePartySuccess =
    async () => {
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
          setSelectedParty(
            latest
          );

          await loadLedger(
            latest._id
          );
        }
      }

      setPartyModalOpen(false);
      setEditParty(null);
    };

  // ============================================================
  // SELECTED PARTY PDF
  // ============================================================

  const handlePartyPdf =
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
          "Party PDF export failed:",
          error
        );

        alert(
          "Failed to export party ledger PDF."
        );
      }
    };

  // ============================================================
  // SELECTED PARTY EXCEL
  // ============================================================

  const handlePartyExcel =
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
          "Party Excel export failed:",
          error
        );

        alert(
          "Failed to export party ledger Excel."
        );
      }
    };

  // ============================================================
  // WHOLE FILTERED ACCOUNTS EXPORT
  // ============================================================

  const handleExportAccounts =
    async (
      format: "PDF" | "EXCEL"
    ) => {
      setAccountsExportOpen(false);

      try {
        const partiesToExport =
          filteredParties.length
            ? filteredParties
            : parties;

        if (
          partiesToExport.length === 0
        ) {
          alert(
            "There are no accounts to export."
          );

          return;
        }

        const rows: any[] = [];

        for (
          const party of partiesToExport
        ) {
          try {
            const partyLedger =
              await getPartyLedger(
                party._id
              );

            partyLedger.forEach(
              (transaction: any) => {
                rows.push({
                  date:
                    transaction.createdAt ||
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
              `Failed loading ledger for ${party.companyName}`,
              error
            );
          }
        }

        rows.sort(
          (a, b) =>
            new Date(
              a.date
            ).getTime() -
            new Date(
              b.date
            ).getTime()
        );

        const filteredCustomers =
          partiesToExport.filter(
            (party) =>
              party.partyType ===
              "CUSTOMER"
          );

        const filteredSuppliers =
          partiesToExport.filter(
            (party) =>
              party.partyType ===
              "SUPPLIER"
          );

        const filteredExpenses =
          partiesToExport.filter(
            (party) =>
              party.partyType ===
              "COMPANY_EXPENSE"
          );

        const filteredYoullGet =
          partiesToExport
            .filter(
              (party) =>
                Number(
                  party.currentBalance ||
                    0
                ) > 0
            )
            .reduce(
              (sum, party) =>
                sum +
                Number(
                  party.currentBalance ||
                    0
                ),
              0
            );

        const filteredYoullGive =
          partiesToExport
            .filter(
              (party) =>
                Number(
                  party.currentBalance ||
                    0
                ) < 0
            )
            .reduce(
              (sum, party) =>
                sum +
                Math.abs(
                  Number(
                    party.currentBalance ||
                      0
                  )
                ),
              0
            );

        const summary = {
          totalParties:
            partiesToExport.length,

          customers:
            filteredCustomers.length,

          suppliers:
            filteredSuppliers.length,

          companyExpenses:
            filteredExpenses.length,

          youllGet:
            filteredYoullGet,

          youllGive:
            filteredYoullGive,
        };

        if (
          format === "PDF"
        ) {
          await exportAccountsPdf(
            rows,
            summary,
            "toy-hub-accounts-ledger"
          );
        } else {
          await exportAccountsExcel(
            rows,
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
          "Failed to export whole accounts ledger."
        );
      }
    };

  return (
    <AccountantLayout>
      <PageContainer className="space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <PageHeader
            title="Accounts"
            subtitle="Customer, Supplier & Company Expense Ledger"
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
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                font-semibold
                text-slate-700
                shadow-sm
                transition
                hover:bg-slate-50
              "
            >
              <FileText
                size={16}
              />

              <span className="hidden sm:inline">
                Export Ledger
              </span>

              <ChevronDown
                size={15}
              />
            </button>

            {accountsExportOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-12
                  z-50
                  w-44
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-1
                  shadow-lg
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
                    gap-2
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-medium
                    text-slate-700
                    hover:bg-slate-50
                  "
                >
                  <FileText
                    size={15}
                  />

                  Export PDF
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
                    gap-2
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-medium
                    text-slate-700
                    hover:bg-slate-50
                  "
                >
                  <FileSpreadsheet
                    size={15}
                  />

                  Export Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            SUMMARY
        ====================================================== */}

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">
              You'll Get
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              ₹{youllGet}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">
              You'll Give
            </p>

            <h2 className="mt-2 text-3xl font-bold text-red-600">
              ₹{youllGive}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">
              Customers
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {customers.length}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">
              Suppliers
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {suppliers.length}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">
              Company Expense
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {companyExpenses.length}
            </h2>
          </div>

        </div>

        {/* ======================================================
            DESKTOP
        ====================================================== */}

        <div
          className="
            hidden
            gap-6
            xl:grid
            xl:grid-cols-12
          "
        >

          <div className="xl:col-span-4">
            <div
              className="
                h-[90vh]
min-h-[650px]
                overflow-hidden
                rounded-2xl
                border
                bg-white
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
            </div>
          </div>

          <div className="xl:col-span-8">
            <div
              className="
                h-[90vh]
min-h-[650px]
                overflow-hidden
                rounded-2xl
                border
                bg-white
              "
            >
              <LedgerPanel
                selectedParty={
                  selectedParty
                }
                ledger={ledger}
                loading={loading}

                onMoneyIn={() => {
                  setTransactionType(
                    "MONEY_IN"
                  );

                  setModalOpen(true);
                }}

                onMoneyOut={() => {
                  setTransactionType(
                    "MONEY_OUT"
                  );

                  setModalOpen(true);
                }}

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
                  handlePartyPdf
                }

                onExportExcel={
                  handlePartyExcel
                }
              />
            </div>
          </div>

        </div>

        {/* ======================================================
            MOBILE / TABLET
        ====================================================== */}

        <div className="xl:hidden">

          {!selectedParty && (
            <div
              className="
                h-[calc(100vh-13rem)]
                min-h-[480px]
                overflow-hidden
                rounded-2xl
                border
                bg-white
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
            </div>
          )}

          {selectedParty && (
            <div
              className="
                flex
                h-[calc(100vh-13rem)]
                min-h-[480px]
                flex-col
                overflow-hidden
                rounded-2xl
                border
                bg-white
              "
            >

              <div
                className="
                  flex
                  h-12
                  shrink-0
                  items-center
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
                    items-center
                    gap-1.5
                    rounded-lg
                    px-2.5
                    text-xs
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-100
                    hover:text-slate-900
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
                    ml-2
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

                  onMoneyIn={() => {
                    setTransactionType(
                      "MONEY_IN"
                    );

                    setModalOpen(true);
                  }}

                  onMoneyOut={() => {
                    setTransactionType(
                      "MONEY_OUT"
                    );

                    setModalOpen(true);
                  }}

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
                    handlePartyPdf
                  }

                  onExportExcel={
                    handlePartyExcel
                  }
                />
              </div>

            </div>
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
    </AccountantLayout>
  );
};

export default AccountsPage;