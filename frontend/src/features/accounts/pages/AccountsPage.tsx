import { useState, useEffect } from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";

import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";

import PartyList from "../components/PartyList";
import LedgerPanel from "../components/LedgerPanel";

import TransactionModal from "../components/TransactionModal";

import {
  getParties,
  getCustomerLedger,
  deleteTransaction,
} from "../services/accountTransaction.service";

const AccountsPage = () => {
  const [parties, setParties] = useState<any[]>([]);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [transactionType, setTransactionType] = useState<
    "MONEY_IN" | "MONEY_OUT"
  >("MONEY_IN");

  const customers = parties.filter(
    p => p.partyType === "CUSTOMER"
  );

  const suppliers = parties.filter(
    p => p.partyType === "SUPPLIER"
  );

  const youllGet = parties
    .filter(p => p.currentBalance > 0)
    .reduce((sum, p) => sum + p.currentBalance, 0);

  const youllGive = parties
    .filter(p => p.currentBalance < 0)
    .reduce((sum, p) => sum + Math.abs(p.currentBalance), 0);


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

  const loadLedger = async (customerId: string) => {
    try {
      setLoading(true);

      const data = await getCustomerLedger(customerId);

      setLedger(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParties();
  }, []);

const handleDelete = async (
  id: string
) => {
  if (
    !window.confirm(
      "Delete this transaction?"
    )
  )
    return;

  try {
    await deleteTransaction(id);

    await refreshAccounts();

  } catch (err) {
    console.error(err);

    alert(
      "Failed to delete transaction."
    );
  }
};

const refreshAccounts = async () => {
  if (!selectedParty) return;

  const updatedParties = await getParties();

  setParties(updatedParties);

  const updatedSelectedParty =
    updatedParties.find(
      (p: any) =>
        p._id === selectedParty._id
    );

  if (updatedSelectedParty) {
    setSelectedParty(updatedSelectedParty);
  }

  const updatedLedger =
    await getCustomerLedger(
      selectedParty._id
    );

  setLedger(updatedLedger);
};

  return (
    <AdminLayout>
      <PageContainer className="space-y-6">

        <PageHeader
          title="Accounts Management"
          subtitle="Manage customer & supplier ledgers."
        />

        {/* Summary Cards Placeholder */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              You'll Get
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              ₹{youllGet}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              You'll Give
            </p>

            <h2 className="mt-2 text-3xl font-bold text-red-600">
              ₹{youllGive}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Customers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#17357A]">
              {customers.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Suppliers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#17357A]">
              {suppliers.length}
            </h2>
          </div>

        </div>

        {/* Main Layout */}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Left Panel */}

          <div className="xl:col-span-4">

            <div className="h-[72vh] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              <PartyList
                parties={parties}
                selectedParty={selectedParty}
                setSelectedParty={(party) => {
                  setSelectedParty(party);
                  loadLedger(party._id);
                }}
              />
            </div>

          </div>

          {/* Right Panel */}

          <div className="xl:col-span-8">

            <div className="h-[72vh] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

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
              />

            </div>

          </div>

        </div>

        <TransactionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          customerId={selectedParty?._id || ""}
          transactionType={transactionType}
          onSuccess={refreshAccounts}
        />

      </PageContainer>
    </AdminLayout>
  );
};

export default AccountsPage;