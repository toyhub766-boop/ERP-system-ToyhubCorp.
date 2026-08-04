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

  const customers = parties.filter(
    (p) => p.partyType === "CUSTOMER"
  );

  const suppliers = parties.filter(
    (p) => p.partyType === "SUPPLIER"
  );

  const companyExpenses = parties.filter(
    (p) => p.partyType === "COMPANY_EXPENSE"
  );

  const youllGet = parties
    .filter((p) => p.currentBalance > 0)
    .reduce(
      (sum, p) => sum + p.currentBalance,
      0
    );

  const youllGive = parties
    .filter((p) => p.currentBalance < 0)
    .reduce(
      (sum, p) => sum + Math.abs(p.currentBalance),
      0
    );

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

    await loadLedger(latest._id);

  };

  const handleDeleteTransaction =
    async (id: string) => {

      if (
        !window.confirm(
          "Delete this transaction?"
        )
      )
        return;

      try {

        await deleteTransaction(id);

        await refreshAccounts();

      } catch (error) {

        console.error(error);

      }

    };

  const handleDeleteParty =
    async () => {

      if (!selectedParty) return;

      if (
        !window.confirm(
          "Delete this party?"
        )
      )
        return;

      try {

        await deleteParty(
          selectedParty._id
        );

        await loadParties();

        setSelectedParty(null);

        setLedger([]);

      } catch (error: any) {

        alert(
          error?.response?.data
            ?.message ??
            "Failed to delete party."
        );

      }

    };

    useEffect(() => {
  loadParties();
}, []);

return (
  <AdminLayout>

    <PageContainer className="space-y-6">

      <PageHeader
        title="Accounts"
        subtitle="Customer, Supplier & Company Expense Ledger"
      />

      {/* ================= SUMMARY ================= */}

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

      {/* ================= CONTENT ================= */}

      <div className="grid gap-6 xl:grid-cols-12">

        {/* LEFT */}

        <div className="xl:col-span-4">

          <div className="h-[74vh] overflow-hidden rounded-2xl border bg-white">

            <PartyList
              parties={parties}
              selectedParty={selectedParty}
              setSelectedParty={async (party) => {

                setSelectedParty(party);

                await loadLedger(party._id);

              }}
              onAddParty={() => {

                setEditParty(null);

                setPartyModalOpen(true);

              }}
            />

          </div>

        </div>

        {/* RIGHT */}

        <div className="xl:col-span-8">

          <div className="h-[74vh] overflow-hidden rounded-2xl border bg-white">

            <LedgerPanel

              selectedParty={selectedParty}

              ledger={ledger}

              loading={loading}

              onMoneyIn={() => {

                setTransactionType("MONEY_IN");

                setModalOpen(true);

              }}

              onMoneyOut={() => {

                setTransactionType("MONEY_OUT");

                setModalOpen(true);

              }}

              onDelete={handleDeleteTransaction}

              onDeleteParty={handleDeleteParty}

              onEditParty={() => {

                setEditParty(selectedParty);

                setPartyModalOpen(true);

              }}

              onExportPdf={() => {

                if (!selectedParty) return;

                exportPartyLedgerPdf(
                  selectedParty,
                  ledger
                );

              }}

              onExportExcel={() => {

                if (!selectedParty) return;

                exportPartyLedgerExcel(
                  selectedParty,
                  ledger
                );

              }}

            />

          </div>

        </div>

      </div>

              {/* ================= ADD / EDIT PARTY ================= */}

        <AddPartyModal
          open={partyModalOpen}
          editParty={editParty}
          onClose={() => {

            setPartyModalOpen(false);

            setEditParty(null);

          }}
          onSuccess={async () => {

            const updated =
              await loadParties();

            if (editParty) {

              const latest =
                updated.find(
                  (p: any) =>
                    p._id === editParty._id
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

          }}
        />

        {/* ================= MONEY IN / MONEY OUT ================= */}

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

export default AccountsPage;