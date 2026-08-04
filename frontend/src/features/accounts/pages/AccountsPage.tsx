import { useEffect, useState } from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";
import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";

import PartyList from "../components/PartyList";
import LedgerPanel from "../components/LedgerPanel";
import TransactionModal from "../components/TransactionModal";

import { getParties } from "../services/accountParty.service";

import {
  getPartyLedger,
  deleteTransaction,
} from "../services/accountTransaction.service";

import AddPartyModal from "../components/AddPartyModal";

const AccountsPage = () => {
  const [parties, setParties] = useState<any[]>([]);
  const [selectedParty, setSelectedParty] = useState<any>(null);

  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [partyModalOpen, setPartyModalOpen] =
    useState(false);

  const [editParty, setEditParty] =
    useState<any>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [transactionType, setTransactionType] = useState<
    "MONEY_IN" | "MONEY_OUT"
  >("MONEY_IN");

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
    .reduce((sum, p) => sum + p.currentBalance, 0);

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
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const loadLedger = async (partyId: string) => {
  console.log("Loading ledger for:", partyId);

  setLoading(true);

  const data = await getPartyLedger(partyId);

  console.log("Ledger:", data);

  setLedger(data);

  setLoading(false);
};

  const refreshAccounts = async () => {
    const updated = await loadParties();

    if (!selectedParty) return;

    const party = updated.find(
      (p: any) => p._id === selectedParty._id
    );

    if (party) {
      setSelectedParty(party);

      const ledger =
        await getPartyLedger(party._id);

      setLedger(ledger);
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    if (
      !window.confirm(
        "Delete transaction?"
      )
    )
      return;

    try {
      await deleteTransaction(id);

      await refreshAccounts();
    } catch (err) {
      console.error(err);
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

        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">

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

        <div className="grid xl:grid-cols-12 gap-6">

          <div className="xl:col-span-4">

            <div className="h-[74vh] rounded-2xl border bg-white overflow-hidden">

              <PartyList
                parties={parties}
                selectedParty={selectedParty}
                setSelectedParty={(party) => {
  console.log("Selected:", party.companyName);

  setSelectedParty(party);

  loadLedger(party._id);
}}
                onAddParty={() => {
                  setEditParty(null);
                  setPartyModalOpen(true);
                }}
              />

            </div>

          </div>

          <div className="xl:col-span-8">

            <div className="h-[74vh] rounded-2xl border bg-white overflow-hidden">

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

                onDelete={handleDelete}

                onEditParty={() => {
                  setEditParty(selectedParty);
                  setPartyModalOpen(true);
                }}

                onViewReport={() => {
                  // Navigate to Reports page
                  // or open Report Modal later
                }}
              />

            </div>

          </div>

        </div>

        <AddPartyModal
  open={partyModalOpen}
  onClose={() => {
    setPartyModalOpen(false);
    setEditParty(null);
  }}
  editParty={editParty}
  onSuccess={async () => {
    await loadParties();

    if (editParty) {
      const updated = await getParties();

      const selected = updated.find(
        (p: any) =>
          p._id === editParty._id
      );

      if (selected) {
        setSelectedParty(selected);
      }
    }

    setPartyModalOpen(false);
    setEditParty(null);
  }}
/>

        <TransactionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          partyId={selectedParty?._id || ""}
          transactionType={transactionType}
          onSuccess={refreshAccounts}
        />

      </PageContainer>
    </AdminLayout>
  );
};

export default AccountsPage;