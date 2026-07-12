import { useEffect, useState } from "react";
import AdminLayout from "../../../app/layouts/AdminLayout";
import AccountsModal from "../components/AccountsModal";
import { deleteAccount } from "../services/account.service";

import { exportExcel } from "../../../utils/exportExcel";
import { exportPdf } from "../../../utils/exportPdf";

import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";
import SectionCard from "../../../components/ui/SectionCard";
import StatCard from "../../../components/ui/StatCard";

import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiDownload,
  FiFileText,
} from "react-icons/fi";

import {
  getAccounts,
  getSummary,
} from "../services/account.service";

const AccountsPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState<any>(null);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("All");

  const loadData = async () => {
    try {
      const [transactionsData, summaryData] =
        await Promise.all([
          getAccounts(),
          getSummary(),
        ]);

      setTransactions(transactionsData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const filteredTransactions = transactions.filter(
    (transaction: any) => {
      const matchesSearch = transaction.category
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All" ||
        transaction.type === typeFilter;

      return matchesSearch && matchesType;
    }
  );

  let runningBalance = 0;
  {
    filteredTransactions.map((transaction: any) => {

      runningBalance +=
        transaction.type === "Income"
          ? transaction.amount
          : -transaction.amount;

    })
  }

  return (
  <AdminLayout>
    <PageContainer className="space-y-8">

      <PageHeader
        title="Accounts Management"
        subtitle="Track income, expenses and business cash flow."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="
              flex items-center gap-2
              rounded-xl
              bg-[#17357A]
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#21439A]
            "
          >
            <FiPlus />
            Add Transaction
          </button>
        }
      />

      {/* Stats */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <p className="text-sm text-slate-500">Total Income</p>
  <h2 className="mt-2 text-3xl font-bold text-green-600">
    ₹{summary?.totalIncome ?? 0}
  </h2>
</div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <p className="text-sm text-slate-500">Total Expense</p>
  <h2 className="mt-2 text-3xl font-bold text-red-600">
    ₹{summary?.totalExpense ?? 0}
  </h2>
</div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <p className="text-sm text-slate-500">Net Balance</p>
  <h2 className="mt-2 text-3xl font-bold text-blue-600">
    ₹{summary?.netBalance ?? 0}
  </h2>
</div>
        

        <StatCard
          title="Transactions"
          value={summary?.totalTransactions ?? 0}
        />

      </div>

      <SectionCard>

        <div className="flex flex-col gap-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-semibold text-slate-900">
                Transactions
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Manage all financial records.
              </p>

            </div>

          </div>

          {/* Toolbar */}

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="flex flex-1 gap-3">

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
                className="
                  h-11
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  outline-none
                  focus:border-[#17357A]
                "
              >
                <option>All</option>
                <option>Income</option>
                <option>Expense</option>
              </select>

              <input
                type="text"
                placeholder="Search category..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="
                  h-11
                  flex-1
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  outline-none
                  focus:border-[#17357A]
                "
              />

            </div>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  exportExcel(
                    filteredTransactions,
                    "accounts"
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-3
                  hover:bg-slate-50
                "
              >
                <FiDownload />
                Excel
              </button>

              <button
                onClick={() =>
                  exportPdf(
                    filteredTransactions,
                    "accounts"
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-3
                  hover:bg-slate-50
                "
              >
                <FiFileText />
                PDF
              </button>

            </div>

          </div>

          {/* Table */}

          <div className="overflow-x-auto rounded-2xl border border-slate-200">

            <table className="min-w-[1050px] w-full">

              <thead className="bg-slate-50">

                <tr className="text-left">

                  <th className="px-6 py-4 font-semibold">
                    Date
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Type
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Category
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Description
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Payment
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Amount
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Balance
                  </th>

                  <th className="px-6 py-4 text-center font-semibold">
                    Actions
                  </th>

                </tr>

              </thead>

                  <tbody>

            {filteredTransactions.map((transaction: any) => {
  runningBalance +=
    transaction.type === "Income"
      ? transaction.amount
      : -transaction.amount;

  return (
    <tr
      key={transaction._id}
      className="border-t border-slate-200 transition hover:bg-slate-50"
    >
      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">
        {new Date(transaction.date).toLocaleDateString()}
      </td>

      <td className="px-6 py-5">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            transaction.type === "Income"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {transaction.type}
        </span>
      </td>

      <td className="px-6 py-5 font-medium text-slate-900">
        {transaction.category}
      </td>

      <td className="px-6 py-5 text-slate-600 max-w-xs">
        {transaction.description || "-"}
      </td>

      <td className="px-6 py-5">
        <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm">
          {transaction.paymentMethod}
        </span>
      </td>

      <td
        className={`px-6 py-5 font-bold whitespace-nowrap ${
          transaction.type === "Income"
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        {transaction.type === "Income" ? "+" : "-"}₹
        {transaction.amount}
      </td>

      <td className="px-6 py-5 font-semibold whitespace-nowrap text-slate-900">
        ₹{runningBalance}
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center justify-center gap-2">

          <button
            onClick={() => {
              setEditingTransaction(transaction);
              setShowModal(true);
            }}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              border
              border-slate-200
              text-blue-600
              transition
              hover:bg-blue-50
            "
            title="Edit"
          >
            <FiEdit2 size={17} />
          </button>

          <button
            onClick={async () => {
              if (!window.confirm("Delete transaction?"))
                return;

              await deleteAccount(transaction._id);
              loadData();
            }}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              border
              border-slate-200
              text-red-600
              transition
              hover:bg-red-50
            "
            title="Delete"
          >
            <FiTrash2 size={17} />
          </button>

        </div>
      </td>
    </tr>
  );
})}
            </tbody>

          </table>

        </div>
      </div>

      </SectionCard>

      <AccountsModal
        open={showModal}
        transaction={editingTransaction}
        onClose={() => {
          setShowModal(false);
          setEditingTransaction(null);
        }}
        onSuccess={async () => {
          await loadData();
        }}
      />

    </PageContainer>
  </AdminLayout>
);
};

export default AccountsPage;