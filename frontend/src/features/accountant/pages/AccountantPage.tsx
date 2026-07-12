import { useEffect, useState } from "react";

import AccountantLayout from "../layouts/AccountantLayout";
import AccountsModal from "../../accounts/components/AccountsModal";

import {
  deleteAccount,
  getAccounts,
  getSummary,
} from "../../accounts/services/account.service";

import { exportExcel } from "../../../utils/exportExcel";
import { exportPdf } from "../../../utils/exportPdf";

import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiDownload,
  FiFileText,
} from "react-icons/fi";

import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";
import SectionCard from "../../../components/ui/SectionCard";
import StatCard from "../../../components/ui/StatCard";

const AccountantPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const [showModal, setShowModal] = useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState<any>(null);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState("All");

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

  const filteredTransactions =
    transactions.filter((transaction: any) => {
      const matchesSearch =
        transaction.category
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All" ||
        transaction.type === typeFilter;

      return matchesSearch && matchesType;
    });

  let runningBalance = 0;

  return (
    <AccountantLayout>

      <PageContainer className="max-w-7xl mx-auto">

        <PageHeader
          title="Accounts Management"
          subtitle="Track income, expenses and financial transactions."
        />

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

          <StatCard
            title="Total Income"
            value={`₹${summary?.totalIncome ?? 0}`}
          />

          <StatCard
            title="Total Expense"
            value={`₹${summary?.totalExpense ?? 0}`}
          />

          <StatCard
            title="Net Balance"
            value={`₹${summary?.netBalance ?? 0}`}
          />

          <StatCard
            title="Transactions"
            value={summary?.totalTransactions ?? 0}
          />

        </div>

        <SectionCard>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

            <div>

              <h2 className="text-xl font-semibold">
                Transactions
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Search, filter and manage all financial records.
              </p>

            </div>

            <button
              onClick={() => {
                setEditingTransaction(null);
                setShowModal(true);
              }}
              className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#17357A]
              px-5
              py-3
              font-medium
              text-white
              hover:bg-[#22479c]
              transition
              "
            >
              <FiPlus />
              Add Transaction
            </button>

          </div>

          <div className="flex flex-col xl:flex-row gap-4 justify-between mb-6">

            <div className="flex flex-col sm:flex-row gap-3">

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
                className="
                rounded-xl
                border
                border-slate-300
                px-4
                py-3
                bg-white
                "
              >
                <option>All</option>
                <option>Income</option>
                <option>Expense</option>
              </select>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search category..."
                className="
                rounded-xl
                border
                border-slate-300
                px-4
                py-3
                w-full
                sm:w-80
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
                rounded-xl
                border
                border-slate-300
                px-4
                py-3
                hover:bg-slate-50
                transition
                "
              >
                <FiDownload />
              </button>

              <button
                onClick={() =>
                  exportPdf(
                    filteredTransactions,
                    "accounts"
                  )
                }
                className="
                rounded-xl
                border
                border-slate-300
                px-4
                py-3
                hover:bg-slate-50
                transition
                "
              >
                <FiFileText />
              </button>

            </div>

          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">

            <table className="min-w-[950px] w-full">

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
                      className="border-t hover:bg-slate-50 transition"
                    >

                      <td className="px-6 py-5 whitespace-nowrap">
                        {new Date(
                          transaction.date
                        ).toLocaleDateString()}
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

                      <td className="px-6 py-5 font-medium">
                        {transaction.category}
                      </td>

                      <td className="px-6 py-5 text-slate-600 max-w-xs truncate">
                        {transaction.description || "-"}
                      </td>

                      <td className="px-6 py-5">
                        {transaction.paymentMethod}
                      </td>

                      <td
                        className={`px-6 py-5 font-semibold ${
                          transaction.type === "Income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "Income"
                          ? "+"
                          : "-"}
                        ₹{transaction.amount}
                      </td>

                      <td className="px-6 py-5 font-bold whitespace-nowrap">
                        ₹{runningBalance}
                      </td>

                      <td className="px-6 py-5">

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() => {
                              setEditingTransaction(transaction);
                              setShowModal(true);
                            }}
                            className="
                            h-10
                            w-10
                            rounded-lg
                            border
                            border-slate-200
                            text-blue-600
                            transition
                            hover:bg-blue-50
                            "
                            title="Edit"
                          >
                            <FiEdit2 className="mx-auto" />
                          </button>

                          <button
                            onClick={async () => {

                              if (
                                !window.confirm(
                                  "Delete transaction?"
                                )
                              )
                                return;

                              await deleteAccount(
                                transaction._id
                              );

                              loadData();

                            }}
                            className="
                            h-10
                            w-10
                            rounded-lg
                            border
                            border-slate-200
                            text-red-600
                            transition
                            hover:bg-red-50
                            "
                            title="Delete"
                          >
                            <FiTrash2 className="mx-auto" />
                          </button>

                        </div>

                      </td>

                    </tr>

                  );

                })}

                {filteredTransactions.length === 0 && (

                  <tr>

                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center text-slate-500"
                    >
                      No transactions found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </SectionCard>

      </PageContainer>

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