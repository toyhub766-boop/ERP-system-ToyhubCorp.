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

type AccountType =
  | "ALL"
  | "CUSTOMER"
  | "SUPPLIER"
  | "COMPANY_EXPENSE";

interface SummaryCardData {
  label: string;
  value: string | number;
  valueClass?: string;
}

const AccountsPage = () => {
  const [parties, setParties] = useState<any[]>([]);
  const [filteredParties, setFilteredParties] = useState<any[]>([]);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [partyModalOpen, setPartyModalOpen] = useState(false);
  const [editParty, setEditParty] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [transactionType, setTransactionType] =
    useState<"MONEY_IN" | "MONEY_OUT">("MONEY_IN");

  const [accountsExportOpen, setAccountsExportOpen] =
    useState(false);

  const [summaryOpen, setSummaryOpen] = useState(false);

  const [activeAccountType, setActiveAccountType] =
    useState<AccountType>("ALL");

  const exportAccountsRef =
    useRef<HTMLDivElement>(null);

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

  const handleSelectParty = async (
    party: any
  ) => {
    setSelectedParty(party);

    await loadLedger(party._id);
  };

  const handleMobileBack = () => {
    setSelectedParty(null);
    setLedger([]);
  };

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

  /*
   * These handlers intentionally accept
   * an optional ledger argument.
   *
   * LedgerPanel passes its date-filtered
   * transaction list here.
   *
   * If no list is supplied, the complete
   * currently loaded ledger is used.
   */
  const handleExportPdf = async (
    exportLedger: any[] = ledger
  ) => {
    if (!selectedParty) {
      return;
    }

    if (exportLedger.length === 0) {
      alert(
        "There are no transactions to export."
      );

      return;
    }

    try {
      await exportPartyLedgerPdf(
        selectedParty,
        exportLedger
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

  const handleExportExcel =
    async (
      exportLedger: any[] = ledger
    ) => {
      if (!selectedParty) {
        return;
      }

      if (exportLedger.length === 0) {
        alert(
          "There are no transactions to export."
        );

        return;
      }

      try {
        await exportPartyLedgerExcel(
          selectedParty,
          exportLedger
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

  /*
   * Whole Accounts export remains
   * based on PartyList's filtered parties.
   *
   * This is separate from the individual
   * party transaction-date export.
   */
  const handleExportAccounts =
    async (
      format: "PDF" | "EXCEL"
    ) => {
      setAccountsExportOpen(
        false
      );

      try {
        const partiesToExport =
          filteredParties;

        if (
          partiesToExport.length ===
          0
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
          let youllGive = 0;
          let youllGet = 0;

          try {
            const partyLedger =
              await getPartyLedger(
                party._id
              );

            if (
              Array.isArray(
                partyLedger
              )
            ) {
              partyLedger.forEach(
                (
                  transaction: any
                ) => {
                  const amount =
                    Number(
                      transaction.amount ||
                        0
                    );

                  if (
                    transaction.transactionType ===
                    "MONEY_OUT"
                  ) {
                    youllGive +=
                      amount;
                  }

                  if (
                    transaction.transactionType ===
                    "MONEY_IN"
                  ) {
                    youllGet +=
                      amount;
                  }
                }
              );
            }
          } catch (error) {
            console.error(
              `Failed to load ledger for ${party.companyName}:`,
              error
            );
          }

          rows.push({
            partyCode:
              party.partyCode ||
              "--",

            partyName:
              party.companyName ||
              "--",

            contactPerson:
              party.contactPerson ||
              "--",

            openingBalance:
              Number(
                party.openingBalance ||
                  0
              ),

            youllGive,

            youllGet,

            balance:
              Number(
                party.currentBalance ||
                  0
              ),
          });
        }

        const customers =
          partiesToExport.filter(
            (party) =>
              party.partyType ===
              "CUSTOMER"
          ).length;

        const suppliers =
          partiesToExport.filter(
            (party) =>
              party.partyType ===
              "SUPPLIER"
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
              sum +
              Number(
                row.youllGet || 0
              ),
            0
          );

        const totalYoullGive =
          rows.reduce(
            (sum, row) =>
              sum +
              Number(
                row.youllGive || 0
              ),
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

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    const handleOutsideClick =
      (
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

  /*
   * SUMMARY
   *
   * Always use filteredParties here.
   *
   * PartyList controls:
   * - account type
   * - search
   * - firm
   * - status
   * - balance
   * - due date
   *
   * Therefore the summary represents
   * exactly the current report view.
   */
  const reportParties =
    filteredParties;

  const reportCustomers =
    reportParties.filter(
      (party) =>
        party.partyType ===
        "CUSTOMER"
    );

  const reportSuppliers =
    reportParties.filter(
      (party) =>
        party.partyType ===
        "SUPPLIER"
    );

  const reportCompanyExpenses =
    reportParties.filter(
      (party) =>
        party.partyType ===
        "COMPANY_EXPENSE"
    );

  const reportPositiveBalance =
    reportParties
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

  const reportNegativeBalance =
    reportParties
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

  const reportBalance =
    reportParties.reduce(
      (sum, party) =>
        sum +
        Number(
          party.currentBalance ||
            0
        ),
      0
    );

  const reportActive =
    reportParties.filter(
      (party) =>
        party.status === "Active"
    ).length;

  const reportInactive =
    reportParties.filter(
      (party) =>
        party.status !== "Active"
    ).length;

  const reportZeroBalance =
    reportParties.filter(
      (party) =>
        Number(
          party.currentBalance ||
            0
        ) === 0
    ).length;

  const reportWithDueDate =
    reportParties.filter(
      (party) =>
        party.customerDetails
          ?.dueDate ||
        party.supplierDetails
          ?.dueDate
    ).length;

  /*
   * Explicit type prevents the
   * valueClass TypeScript union error.
   */
  let summaryCards: SummaryCardData[];

  if (
    activeAccountType ===
    "CUSTOMER"
  ) {
    summaryCards = [
      {
        label: "Customers",
        value:
          reportCustomers.length,
      },
      {
        label: "Positive Balance",
        value: `₹${reportPositiveBalance.toLocaleString(
          "en-IN"
        )}`,
        valueClass:
          "text-emerald-600",
      },
      {
        label: "Negative Balance",
        value: `₹${reportNegativeBalance.toLocaleString(
          "en-IN"
        )}`,
        valueClass:
          "text-red-600",
      },
      {
        label: "Active",
        value: reportActive,
      },
      {
        label: "With Due Date",
        value: reportWithDueDate,
      },
    ];
  } else if (
    activeAccountType ===
    "SUPPLIER"
  ) {
    summaryCards = [
      {
        label: "Suppliers",
        value:
          reportSuppliers.length,
      },
      {
        label: "Positive Balance",
        value: `₹${reportPositiveBalance.toLocaleString(
          "en-IN"
        )}`,
        valueClass:
          "text-emerald-600",
      },
      {
        label: "Negative Balance",
        value: `₹${reportNegativeBalance.toLocaleString(
          "en-IN"
        )}`,
        valueClass:
          "text-red-600",
      },
      {
        label: "Active",
        value: reportActive,
      },
      {
        label: "With Due Date",
        value: reportWithDueDate,
      },
    ];
  } else if (
    activeAccountType ===
    "COMPANY_EXPENSE"
  ) {
    summaryCards = [
      {
        label: "Company Expense",
        value:
          reportCompanyExpenses.length,
      },
      {
        label: "Balance",
        value: `₹${Math.abs(
          reportBalance
        ).toLocaleString(
          "en-IN"
        )}`,
      },
      {
        label: "Active",
        value: reportActive,
      },
      {
        label: "Inactive",
        value: reportInactive,
      },
      {
        label: "Zero Balance",
        value:
          reportZeroBalance,
      },
    ];
  } else {
    summaryCards = [
      {
        label: "Total Accounts",
        value:
          reportParties.length,
      },
      {
        label: "Positive Balance",
        value: `₹${reportPositiveBalance.toLocaleString(
          "en-IN"
        )}`,
        valueClass:
          "text-emerald-600",
      },
      {
        label: "Negative Balance",
        value: `₹${reportNegativeBalance.toLocaleString(
          "en-IN"
        )}`,
        valueClass:
          "text-red-600",
      },
      {
        label: "Customers",
        value:
          reportCustomers.length,
      },
      {
        label: "Suppliers",
        value:
          reportSuppliers.length,
      },
    ];
  }

  return (
    <AdminLayout>
      <PageContainer className="gap-5 pb-5">
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
            className="relative shrink-0"
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
                    <FileSpreadsheet
                      size={15}
                    />
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

        <div className="shrink-0">
          <button
            type="button"
            onClick={() =>
              setSummaryOpen(
                (open) => !open
              )
            }
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-left
              shadow-[0_2px_12px_rgba(15,23,42,0.04)]
              transition
              hover:bg-slate-50
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                  text-slate-600
                "
              >
                <span className="text-sm font-bold">
                  ₹
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {activeAccountType ===
                  "ALL"
                    ? "Account Summary"
                    : activeAccountType ===
                      "CUSTOMER"
                    ? "Customer Summary"
                    : activeAccountType ===
                      "SUPPLIER"
                    ? "Supplier Summary"
                    : "Company Expense Summary"}
                </p>

                <p className="truncate text-[11px] text-slate-400">
                  {reportParties.length}{" "}
                  accounts in this view
                </p>
              </div>
            </div>

            <ChevronDown
              size={18}
              className={`
                shrink-0
                text-slate-400
                transition-transform
                duration-200
                ${
                  summaryOpen
                    ? "rotate-180"
                    : ""
                }
              `}
            />
          </button>

          <div
            className={`
              grid
              transition-all
              duration-200
              ease-out
              ${
                summaryOpen
                  ? "mt-3 max-h-[500px] grid-rows-[1fr] opacity-100"
                  : "mt-0 max-h-0 grid-rows-[0fr] opacity-0"
              }
            `}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  lg:grid-cols-5
                "
              >
                {summaryCards.map(
                  (card) => (
                    <SummaryCard
                      key={card.label}
                      label={card.label}
                      value={card.value}
                      valueClass={
                        card.valueClass
                      }
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>

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
              activeAccountType={
                activeAccountType
              }
              onAccountTypeChange={
                setActiveAccountType
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

        <div className="min-h-0 xl:hidden">
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
                activeAccountType={
                  activeAccountType
                }
                onAccountTypeChange={
                  setActiveAccountType
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
                  <ArrowLeft size={15} />
                  <span>Parties</span>
                </button>

                <div className="min-w-0 flex-1">
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