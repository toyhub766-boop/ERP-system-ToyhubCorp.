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

  const demoParty = {
  _id: "demo-party",
  companyName: "ABC Toys",
  partyType: "Customer",
  currentBalance: 25000,
  contactPerson: "Rahul",
  phone: "9876543210",
};

  // const loadParties = async () => {
  //   try {
  //     const data = await getParties();
  //     setParties(data);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const loadParties = async () => {
  try {
    const data = await getParties();

    if (data && data.length > 0) {
      setParties(data);
    } else {
      setParties([demoParty]);
    }
  } catch (error) {
    console.error(error);

    // Temporary fallback while backend isn't deployed
    setParties([demoParty]);
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
              ₹0
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              You'll Give
            </p>

            <h2 className="mt-2 text-3xl font-bold text-red-600">
              ₹0
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Customers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#17357A]">
              0
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Suppliers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#17357A]">
              0
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
              />

            </div>

          </div>

        </div>

        <TransactionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          customerId={selectedParty?._id || ""}
          transactionType={transactionType}
          onSuccess={async () => {
            if (!selectedParty) return;

            await loadParties();
            await loadLedger(selectedParty._id);
          }}
        />

      </PageContainer>
    </AdminLayout>
  );
};

export default AccountsPage;