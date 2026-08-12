import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTransactions } from "../services/inventory.service";

import type { Transaction } from "../types/inventory.types";

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
        const data = await getTransactions();

        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const todaysRecords = transactions.filter(
    (item) => {
      const today = new Date();
      const date = new Date(item.createdAt);

      return (
        today.getDate() === date.getDate() &&
        today.getMonth() === date.getMonth() &&
        today.getFullYear() === date.getFullYear()
      );
    }
  ).length;

  return (
    <div
      className="
        min-h-screen
        bg-slate-100
        pb-24
      "
    >
      <PageContainer>
        <div
          className="
            mx-auto
            w-full
            max-w-4xl
            space-y-5
            sm:space-y-6
          "
        >
          {/* =====================================================
              HEADER
          ===================================================== */}

          <PageHeader
            title="Transactions"
            subtitle="View all stock movement history."
            action={
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-700
                  shadow-sm
                  transition
                  hover:bg-slate-50
                  active:scale-[0.98]
                  sm:px-4
                "
              >
                ← Back
              </button>
            }
          />

          {/* =====================================================
              STATS
          ===================================================== */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:gap-5
            "
          >
            <StatCard
              title="Total Transactions"
              value={transactions.length}
            />

            <StatCard
              title="Today's Records"
              value={todaysRecords}
            />
          </div>

          {/* =====================================================
              CONTENT
          ===================================================== */}

          {loading ? (
            <SectionCard>
              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  py-16
                  text-center
                "
              >
                <div
                  className="
                    mb-4
                    h-9
                    w-9
                    animate-spin
                    rounded-full
                    border-4
                    border-slate-200
                    border-t-[#17357A]
                  "
                />

                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-600
                  "
                >
                  Loading transactions...
                </p>
              </div>
            </SectionCard>
          ) : transactions.length === 0 ? (
            <SectionCard>
              <div
                className="
                  py-14
                  text-center
                  sm:py-16
                "
              >
                <div className="mb-4 text-4xl sm:text-5xl">
                  📄
                </div>

                <h3
                  className="
                    text-lg
                    font-semibold
                    text-slate-800
                  "
                >
                  No Transactions Found
                </h3>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-sm
                    text-sm
                    leading-5
                    text-slate-500
                  "
                >
                  Stock movement will appear here once
                  inventory is updated.
                </p>
              </div>
            </SectionCard>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {transactions.map((item) => (
                <SectionCard
                  key={item._id}
                  className="space-y-4 sm:space-y-5"
                >
                  {/* =================================================
                      TRANSACTION HEADER
                  ================================================= */}

                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
                    "
                  >
                    <div className="min-w-0">
                      <h2
                        className="
                          truncate
                          text-base
                          font-bold
                          text-slate-900
                          sm:text-lg
                        "
                      >
                        {item.product?.name ||
                          "Deleted Product"}
                      </h2>

                      <p
                        className="
                          mt-1
                          truncate
                          text-sm
                          text-slate-500
                        "
                      >
                        {item.reason}
                      </p>
                    </div>

                    <span
                      className={`
                        inline-flex
                        w-fit
                        shrink-0
                        rounded-full
                        px-3
                        py-1
                        text-[11px]
                        font-semibold
                        sm:text-xs
                        ${
                          item.type === "IN"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {item.type === "IN"
                        ? "Stock In"
                        : "Stock Out"}
                    </span>
                  </div>

                  {/* =================================================
                      STOCK NUMBERS
                  ================================================= */}

                  <div
                    className="
                      grid
                      grid-cols-3
                      gap-2
                      sm:gap-4
                    "
                  >
                    <div
                      className="
                        min-w-0
                        rounded-xl
                        bg-slate-50
                        px-2
                        py-3
                        text-center
                        sm:p-4
                      "
                    >
                      <p
                        className="
                          truncate
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-wide
                          text-slate-400
                          sm:text-xs
                          sm:text-slate-500
                        "
                      >
                        Quantity
                      </p>

                      <h3
                        className="
                          mt-1
                          text-xl
                          font-bold
                          text-[#17357A]
                          sm:mt-2
                          sm:text-2xl
                        "
                      >
                        {item.quantity}
                      </h3>
                    </div>

                    <div
                      className="
                        min-w-0
                        rounded-xl
                        bg-slate-50
                        px-2
                        py-3
                        text-center
                        sm:p-4
                      "
                    >
                      <p
                        className="
                          truncate
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-wide
                          text-slate-400
                          sm:text-xs
                          sm:text-slate-500
                        "
                      >
                        Previous
                      </p>

                      <h3
                        className="
                          mt-1
                          text-lg
                          font-semibold
                          text-slate-800
                          sm:mt-2
                          sm:text-xl
                        "
                      >
                        {item.previousStock}
                      </h3>
                    </div>

                    <div
                      className="
                        min-w-0
                        rounded-xl
                        bg-slate-50
                        px-2
                        py-3
                        text-center
                        sm:p-4
                      "
                    >
                      <p
                        className="
                          truncate
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-wide
                          text-slate-400
                          sm:text-xs
                          sm:text-slate-500
                        "
                      >
                        Current
                      </p>

                      <h3
                        className="
                          mt-1
                          text-lg
                          font-semibold
                          text-slate-800
                          sm:mt-2
                          sm:text-xl
                        "
                      >
                        {item.currentStock}
                      </h3>
                    </div>
                  </div>

                  {/* =================================================
                      MOVEMENT + DATE
                  ================================================= */}

                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      border-t
                      border-slate-100
                      pt-4
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <div className="min-w-0">
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wide
                          text-slate-400
                          sm:text-xs
                          sm:text-slate-500
                        "
                      >
                        Movement
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-semibold
                          text-slate-800
                        "
                      >
                        {item.previousStock} →{" "}
                        {item.currentStock}
                      </p>
                    </div>

                    <div
                      className="
                        text-left
                        sm:text-right
                      "
                    >
                      <p
                        className="
                          text-xs
                          font-medium
                          text-slate-700
                          sm:text-sm
                        "
                      >
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString()}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[11px]
                          text-slate-400
                          sm:text-xs
                          sm:text-slate-500
                        "
                      >
                        {new Date(
                          item.createdAt
                        ).toLocaleTimeString()}
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