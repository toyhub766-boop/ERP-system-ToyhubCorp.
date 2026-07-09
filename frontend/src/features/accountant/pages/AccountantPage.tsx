import { useEffect, useState } from "react";
import AccountantLayout from "../layouts/AccountantLayout";
import AccountsModal from "../../accounts/components/AccountsModal";
import { deleteAccount } from "../../accounts/services/account.service";

import { exportExcel } from "../../../utils/exportExcel";
import { exportPdf } from "../../../utils/exportPdf";

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
} from "../../accounts/services/account.service";

const AccountantPage = () => {
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
    <AccountantLayout>
      <div className="p-6 space-y-6">

        <div>
          <p className="text-sm text-slate-500">
            Admin &gt; Accounts
          </p>

          <h1 className="text-3xl font-bold mt-2">
            Accounts Management
          </h1>
        </div>

      </div>

      <div className="grid grid-cols-4 gap-4">

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-slate-500 text-sm">
            Total Income
          </p>

          <h2 className="text-2xl font-bold text-green-600">
            ₹{summary?.totalIncome ?? 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-slate-500 text-sm">
            Total Expense
          </p>

          <h2 className="text-2xl font-bold text-red-600">
            ₹{summary?.totalExpense ?? 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-slate-500 text-sm">
            Net Balance
          </p>

          <h2 className="text-2xl font-bold text-blue-600">
            ₹{summary?.netBalance ?? 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-slate-500 text-sm">
            Transactions
          </p>

          <h2 className="text-2xl font-bold">
            {summary?.totalTransactions ?? 0}
          </h2>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow p-5">

        <div className="flex items-center justify-between mb-5">

          <h2 className="text-xl font-semibold">
            Transactions
          </h2>

        </div>

        <div className="flex items-center justify-between mb-5">

          <div className="flex gap-3">

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
              className="border rounded-lg px-3 py-2"
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
              className="border rounded-lg px-3 py-2 w-64"
            />

          </div>

          <div className="flex gap-3">

            <button
              onClick={() => exportExcel(filteredTransactions, "accounts")}
              className="border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50"
            >
              <FiDownload />
            </button>

            <button
              onClick={() => exportPdf(filteredTransactions, "accounts")}
              className="border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50"
            >
              <FiFileText />
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="bg-[#172B6B] text-white px-5 py-2 rounded-lg flex items-center gap-2"
            >
              <FiPlus />
              Add Transaction
            </button>

          </div>

        </div>

        <table className="w-full">

          <thead>
            <tr className="border-b text-left">

              <th className="py-3">Date</th>

              <th>Type</th>

              <th>Category</th>

              <th>Description</th>

              <th>Payment</th>

              <th>Amount</th>

              <th>Balance</th>

              <th className="text-center">Actions</th>

            </tr>
          </thead>
          <tbody>

            {transactions.map((transaction: any) => {

              runningBalance +=
                transaction.type === "Income"
                  ? transaction.amount
                  : -transaction.amount;

              return (

                <tr
                  key={transaction._id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="py-4">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>

                  <td>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.type === "Income"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {transaction.type}
                    </span>

                  </td>

                  <td>{transaction.category}</td>

                  <td>
                    {transaction.description || "-"}
                  </td>

                  <td>{transaction.paymentMethod}</td>

                  <td
                    className={`font-semibold ${transaction.type === "Income"
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {transaction.type === "Income"
                      ? "+"
                      : "-"}
                    ₹{transaction.amount}
                  </td>

                  <td className="font-bold">
                    ₹{runningBalance}
                  </td>

                  <td>

                    <div className="flex justify-center gap-4">

                      <button
                        onClick={() => {
                          setEditingTransaction(transaction);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <FiEdit2 size={18} />
                      </button>

                      <button
  onClick={async () => {
    if (!window.confirm("Delete transaction?")) return;

    await deleteAccount(transaction._id);
    loadData();
  }}
  className="text-red-600 hover:text-red-800"
  title="Delete"
>
  <FiTrash2 size={18} />
</button>

                    </div>

                  </td>

                </tr>

              );
            })}

          </tbody>

        </table>

      </div>

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
    </AccountantLayout>
  );
};

export default AccountantPage;