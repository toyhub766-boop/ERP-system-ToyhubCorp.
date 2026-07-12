import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTransactions } from "../services/inventory.service";

import type {
  Transaction,
} from "../types/inventory.types";

import BottomNavigation from "../components/BottomNavigation";
import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";
import SectionCard from "../../../components/ui/SectionCard";
import StatCard from "../../../components/ui/StatCard";

const TransactionsPage = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data =
          await getTransactions();

        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return (
  <div className="min-h-screen bg-slate-100">

    <PageContainer>

      <div className="mx-auto w-full max-w-4xl space-y-6">

        <PageHeader
          title="Transactions"
          subtitle="View all stock movement history."
          action={
            <button
              onClick={() => navigate(-1)}
              className="
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-700
                transition
                hover:bg-slate-50
              "
            >
              ← Back
            </button>
          }
        />

        <div className="grid grid-cols-2 gap-5">

          <StatCard
            title="Total Transactions"
            value={transactions.length}
          />

          <StatCard
            title="Today's Records"
            value={
              transactions.filter((item) => {
                const today = new Date();
                const date = new Date(item.createdAt);

                return (
                  today.getDate() === date.getDate() &&
                  today.getMonth() === date.getMonth() &&
                  today.getFullYear() === date.getFullYear()
                );
              }).length
            }
          />

        </div>

        {loading ? (

          <SectionCard>

            <div className="py-16 text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#17357A]" />

              <p className="font-medium text-slate-600">
                Loading transactions...
              </p>

            </div>

          </SectionCard>

        ) : transactions.length === 0 ? (

          <SectionCard>

            <div className="py-16 text-center">

              <div className="text-5xl mb-4">
                📄
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                No Transactions Found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Stock movement will appear here once inventory is updated.
              </p>

            </div>

          </SectionCard>

        ) : (

          <div className="space-y-4">

            {transactions.map((item) => (

              <SectionCard
                key={item._id}
                className="space-y-5"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      {item.product?.name || "Deleted Product"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.reason}
                    </p>

                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.type === "IN"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.type === "IN"
                      ? "Stock In"
                      : "Stock Out"}
                  </span>

                </div>

                <div className="grid grid-cols-3 gap-4">

                  <div className="rounded-xl bg-slate-50 p-4 text-center">

                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Quantity
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-[#17357A]">
                      {item.quantity}
                    </h3>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 text-center">

                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Previous
                    </p>

                    <h3 className="mt-2 text-xl font-semibold">
                      {item.previousStock}
                    </h3>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 text-center">

                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Current
                    </p>

                    <h3 className="mt-2 text-xl font-semibold">
                      {item.currentStock}
                    </h3>

                  </div>

                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">

                  <div>

                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Movement
                    </p>

                    <p className="mt-1 font-semibold">
                      {item.previousStock} → {item.currentStock}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-sm font-medium text-slate-700">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>

                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </p>

                  </div>

                </div>

              </SectionCard>

            ))}

          </div>

        )}

      </div>

    </PageContainer>

    <BottomNavigation />

  </div>
);
};

export default TransactionsPage;