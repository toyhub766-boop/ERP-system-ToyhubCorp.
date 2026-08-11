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
    useState<
      "MONEY_IN" | "MONEY_OUT"
    >("MONEY_IN");

  const [exporting, setExporting] =
    useState(false);


  // ==========================================
  // SUMMARY
  // ==========================================

  const customers = parties.filter(
    (p) =>
      p.partyType === "CUSTOMER"
  );

  const suppliers = parties.filter(
    (p) =>
      p.partyType === "SUPPLIER"
  );

  const companyExpenses =
    parties.filter(
      (p) =>
        p.partyType ===
        "COMPANY_EXPENSE"
    );


  const youllGet = parties
    .filter(
      (p) =>
        Number(p.currentBalance) > 0
    )
    .reduce(
      (sum, p) =>
        sum +
        Number(p.currentBalance || 0),
      0
    );


  const youllGive = parties
    .filter(
      (p) =>
        Number(p.currentBalance) < 0
    )
    .reduce(
      (sum, p) =>
        sum +
        Math.abs(
          Number(
            p.currentBalance || 0
          )
        ),
      0
    );


  // ==========================================
  // LOAD PARTIES
  // ==========================================

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

  const refreshAccounts =
    async () => {

      const updated =
        await loadParties();

      if (!selectedParty) {
        return;
      }

      const latest =
        updated.find(
          (p: any) =>
            p._id ===
            selectedParty._id
        );

      if (!latest) {

        setSelectedParty(null);
        setLedger([]);

        return;

      }

      setSelectedParty(
        latest
      );

      await loadLedger(
        latest._id
      );

    };


  // ==========================================
  // WHOLE ACCOUNTS EXPORT
  // ==========================================

  const handleExportAccounts =
    async (
      format:
        | "PDF"
        | "EXCEL"
    ) => {

      try {

        if (
          parties.length === 0
        ) {

          alert(
            "No accounts available to export."
          );

          return;

        }

        setExporting(true);

        // --------------------------------------
        // Fetch all party ledgers
        // --------------------------------------

        const results =
          await Promise.all(
            parties.map(
              async (party) => {

                try {

                  const partyLedger =
                    await getPartyLedger(
                      party._id
                    );

                  return {
                    party,
                    ledger:
                      partyLedger,
                  };

                } catch (error) {

                  console.error(
                    `Failed to load ledger for ${party.companyName}:`,
                    error
                  );

                  return {
                    party,
                    ledger: [],
                  };

                }

              }
            )
          );


        // --------------------------------------
        // Prepare export rows
        // --------------------------------------

        const exportRows: any[] =
          [];

        results.forEach(
          ({
            party,
            ledger,
          }) => {

            ledger.forEach(
              (transaction: any) => {

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

          });


        // --------------------------------------
        // Sort by date
        // --------------------------------------

        exportRows.sort(
          (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        );


        // --------------------------------------
        // Summary
        // --------------------------------------

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


        // --------------------------------------
        // Export
        // --------------------------------------

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

      } finally {

        setExporting(false);

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

    <AccountantLayout>

      <PageContainer
        className="space-y-6"
      >

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <PageHeader
            title="Accounts"
            subtitle="Customer, Supplier & Company Expense Ledger"
          />

          {/* Whole Accounts Export */}

          <div className="relative group shrink-0">

            <button
              type="button"
              disabled={exporting}
              className="rounded-xl bg-[#17357A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#10295d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporting
                ? "Exporting..."
                : "Export Accounts"}
            </button>


            <div className="absolute right-0 z-50 mt-2 hidden w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl group-hover:block">

              <button
                type="button"
                disabled={exporting}
                onClick={() =>
                  handleExportAccounts(
                    "PDF"
                  )
                }
                className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Export Accounts PDF
              </button>


              <button
                type="button"
                disabled={exporting}
                onClick={() =>
                  handleExportAccounts(
                    "EXCEL"
                  )
                }
                className="block w-full border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Export Accounts Excel
              </button>

            </div>

          </div>

        </div>


        {/* =====================================
            SUMMARY
        ===================================== */}

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">

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


          <div className="rounded-xl border border-slate-200 bg-white p-5">

            <p className="text-sm text-slate-500">
              Customers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {customers.length}
            </h2>

          </div>


          <div className="rounded-xl border border-slate-200 bg-white p-5">

            <p className="text-sm text-slate-500">
              Suppliers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {suppliers.length}
            </h2>

          </div>


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
            MAIN CONTENT
        ===================================== */}

        <div className="grid gap-6 xl:grid-cols-12">


          {/* ===================================
              PARTY LIST
          =================================== */}

          <div className="xl:col-span-4">

            <div className="h-[74vh] overflow-hidden rounded-2xl border border-slate-200 bg-white">

              <PartyList

                parties={
                  parties
                }

                selectedParty={
                  selectedParty
                }

                setSelectedParty={
                  async (
                    party
                  ) => {

                    setSelectedParty(
                      party
                    );

                    await loadLedger(
                      party._id
                    );

                  }
                }

                onAddParty={() => {

                  setEditParty(
                    null
                  );

                  setPartyModalOpen(
                    true
                  );

                }}

              />

            </div>

          </div>


          {/* ===================================
              LEDGER
          =================================== */}

          <div className="xl:col-span-8">

            <div className="h-[74vh] overflow-hidden rounded-2xl border border-slate-200 bg-white">

              <LedgerPanel

                selectedParty={
                  selectedParty
                }

                ledger={
                  ledger
                }

                loading={
                  loading
                }


                onMoneyIn={() => {

                  setTransactionType(
                    "MONEY_IN"
                  );

                  setModalOpen(
                    true
                  );

                }}


                onMoneyOut={() => {

                  setTransactionType(
                    "MONEY_OUT"
                  );

                  setModalOpen(
                    true
                  );

                }}


                onEditParty={() => {

                  if (
                    !selectedParty
                  ) {
                    return;
                  }

                  setEditParty(
                    selectedParty
                  );

                  setPartyModalOpen(
                    true
                  );

                }}


                onViewReport={() => {
                  // Reserved for future
                  // accountant report view.
                }}


                onExportPdf={() => {

                  if (
                    !selectedParty
                  ) {
                    return;
                  }

                  exportPartyLedgerPdf(
                    selectedParty,
                    ledger
                  );

                }}


                onExportExcel={() => {

                  if (
                    !selectedParty
                  ) {
                    return;
                  }

                  exportPartyLedgerExcel(
                    selectedParty,
                    ledger
                  );

                }}

              />

            </div>

          </div>

        </div>


        {/* =====================================
            ADD / EDIT PARTY
        ===================================== */}

        <AddPartyModal

          open={
            partyModalOpen
          }

          editParty={
            editParty
          }


          onClose={() => {

            setPartyModalOpen(
              false
            );

            setEditParty(
              null
            );

          }}


          onSuccess={
            async () => {

              const updated =
                await loadParties();


              if (
                editParty
              ) {

                const latest =
                  updated.find(
                    (p: any) =>
                      p._id ===
                      editParty._id
                  );


                if (
                  latest
                ) {

                  setSelectedParty(
                    latest
                  );

                  await loadLedger(
                    latest._id
                  );

                }

              }


              setPartyModalOpen(
                false
              );

              setEditParty(
                null
              );

            }
          }

        />


        {/* =====================================
            MONEY IN / MONEY OUT
        ===================================== */}

        <TransactionModal

          open={
            modalOpen
          }

          onClose={() => {

            setModalOpen(
              false
            );

          }}

          partyId={
            selectedParty?._id ||
            ""
          }

          transactionType={
            transactionType
          }

          onSuccess={
            async () => {

              await refreshAccounts();

              setModalOpen(
                false
              );

            }
          }

        />

      </PageContainer>

    </AccountantLayout>

  );

};

export default AccountsPage;