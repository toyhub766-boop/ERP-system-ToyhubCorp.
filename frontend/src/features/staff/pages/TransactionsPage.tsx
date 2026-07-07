import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTransactions } from "../services/inventory.service";

import type {
  Transaction,
} from "../types/inventory.types";

import BottomNavigation from "../components/BottomNavigation";

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

      {/* Header */}

      <div className="bg-[#17357A] text-white px-4 py-4 flex items-center gap-3">

        <button
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        <h1 className="text-lg font-semibold">
          Transactions
        </h1>

      </div>

      <div className="p-4 space-y-4 pb-24">

        {loading && (
          <p>Loading...</p>
        )}

        {!loading &&
          transactions.map((item) => (

            <div
              key={item._id}
              className="bg-white rounded-2xl shadow-sm border p-4"
            >

              <div className="flex justify-between items-start">

                <div>

                  <h2 className="font-semibold">
  {item.product?.name || "Deleted Product"}
</h2>

                  <p className="text-sm text-slate-500">
                    {item.reason}
                  </p>

                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.type === "IN"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.type}
                </span>

              </div>

              <div className="mt-4 flex justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Quantity
                  </p>

                  <p className="font-bold text-lg">
                    {item.quantity}
                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Stock
                  </p>

                  <p className="font-bold">
                    {item.previousStock}
                    {" → "}
                    {item.currentStock}
                  </p>

                </div>

              </div>

              <p className="text-xs text-slate-400 mt-4">
                {new Date(
                  item.createdAt
                ).toLocaleString()}
              </p>

            </div>

          ))}

      </div>
          <BottomNavigation />
    </div>
  );
};

export default TransactionsPage;