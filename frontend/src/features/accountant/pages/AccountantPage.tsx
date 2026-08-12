import { useEffect, useState } from "react";

import AccountantLayout from "../layouts/AccountantLayout";

import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";

import PartyList from "../../accounts/components/PartyList";
import LedgerPanel from "../../accounts/components/LedgerPanel";
import TransactionModal from "../../accounts/components/TransactionModal";
import AddPartyModal from "../../accounts/components/AddPartyModal";

import {
  getParties,
} from "../../accounts/services/accountParty.service";

import {
  getPartyLedger,
} from "../../accounts/services/accountTransaction.service";

import { exportPartyLedgerPdf } from "../../../utils/exportPartyLedgerPdf";
import { exportPartyLedgerExcel } from "../../../utils/exportPartyLedgerExcel";

import { ArrowLeft } from "lucide-react";

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

  const [transactionType, setTransactionType] =
    useState<"MONEY_IN" | "MONEY_OUT">(
      "MONEY_IN"
    );

  /* ============================================================
     COUNTS
  ============================================================ */

  const customers = parties.filter(
    (p) => p.partyType === "CUSTOMER"
  );

  const suppliers = parties.filter(
    (p) => p.partyType === "SUPPLIER"
  );

  const companyExpenses = parties.filter(
    (p) =>
      p.partyType === "COMPANY_EXPENSE"
  );

  /* ============================================================
     SUMMARY
  ============================================================ */

  const youllGet = parties
    .filter(
      (p) => Number(p.currentBalance || 0) > 0
    )
    .reduce(
      (sum, p) =>
        sum + Number(p.currentBalance || 0),
      0
    );

  const youllGive = parties
    .filter(
      (p) => Number(p.currentBalance || 0) < 0
    )
    .reduce(
      (sum, p) =>
        sum +
        Math.abs(
          Number(p.currentBalance || 0)
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

      return data;
    } catch (error) {
      console.error(error);

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
      console.error(error);

      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     REFRESH ACCOUNTS
  ============================================================ */

  const refreshAccounts = async () => {
    const updated =
      await loadParties();

    if (!selectedParty) return;

    const latest =
      updated.find(
        (p: any) =>
          p._id === selectedParty._id
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
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadParties();
  }, []);

  /* ============================================================
     SELECT PARTY
  ============================================================ */

  const handleSelectParty = async (
    party: any
  ) => {
    setSelectedParty(party);

    await loadLedger(
      party._id
    );
  };

  /* ============================================================
     MOBILE BACK
  ============================================================ */

  const handleMobileBack = () => {
    setSelectedParty(null);
    setLedger([]);
  };

  /* ============================================================
     PARTY SUCCESS
  ============================================================ */

  const handlePartySuccess =
    async () => {
      const updated =
        await loadParties();

      if (editParty) {
        const latest =
          updated.find(
            (p: any) =>
              p._id === editParty._id
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

  return (
    <AccountantLayout>
      <PageContainer className="space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <PageHeader
          title="Accounts"
          subtitle="Customer, Supplier & Company Expense Ledger"
        />

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
            DESKTOP / LARGE SCREEN

            IMPORTANT:
            This is the existing two-panel workspace.

            Only shown at xl and above.
        ====================================================== */}

        <div
          className="
            hidden
            gap-6
            xl:grid
            xl:grid-cols-12
          "
        >

          {/* LEFT — PARTY LIST */}

          <div className="xl:col-span-4">
            <div
              className="
                h-[74vh]
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
                onAddParty={() => {
                  setEditParty(null);
                  setPartyModalOpen(
                    true
                  );
                }}
              />
            </div>
          </div>

          {/* RIGHT — LEDGER */}

          <div className="xl:col-span-8">
            <div
              className="
                h-[74vh]
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

                onEditParty={() => {
                  setEditParty(
                    selectedParty
                  );

                  setPartyModalOpen(
                    true
                  );
                }}

                onViewReport={() => {}}

                onExportPdf={() => {
                  if (!selectedParty)
                    return;

                  exportPartyLedgerPdf(
                    selectedParty,
                    ledger
                  );
                }}

                onExportExcel={() => {
                  if (!selectedParty)
                    return;

                  exportPartyLedgerExcel(
                    selectedParty,
                    ledger
                  );
                }}
              />
            </div>
          </div>
        </div>

        {/* ======================================================
            MOBILE / TABLET

            Below xl we use a list → detail experience.

            IMPORTANT:
            Desktop above is completely separate.
        ====================================================== */}

        <div className="xl:hidden">

          {/* ====================================================
              MOBILE PARTY LIST
          ==================================================== */}

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
                onAddParty={() => {
                  setEditParty(null);
                  setPartyModalOpen(
                    true
                  );
                }}
              />
            </div>
          )}

          {/* ====================================================
              MOBILE PARTY DETAIL
          ==================================================== */}

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

              {/* MOBILE BACK BAR */}

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
                    {selectedParty.companyName}
                  </p>

                  <p
                    className="
                      truncate
                      text-[10px]
                      text-slate-400
                    "
                  >
                    {selectedParty.partyCode}
                  </p>
                </div>
              </div>

              {/* MOBILE LEDGER */}

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

                  onEditParty={() => {
                    setEditParty(
                      selectedParty
                    );

                    setPartyModalOpen(
                      true
                    );
                  }}

                  onViewReport={() => {}}

                  onExportPdf={() => {
                    if (!selectedParty)
                      return;

                    exportPartyLedgerPdf(
                      selectedParty,
                      ledger
                    );
                  }}

                  onExportExcel={() => {
                    if (!selectedParty)
                      return;

                    exportPartyLedgerExcel(
                      selectedParty,
                      ledger
                    );
                  }}
                />
              </div>

            </div>
          )}

        </div>

        {/* ======================================================
            ADD / EDIT PARTY
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

        {/* ======================================================
            MONEY IN / MONEY OUT
        ====================================================== */}

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