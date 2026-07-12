import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../../app/layouts/AdminLayout";
import PageContainer from "../../../components/ui/PageContainer";
import SectionCard from "../../../components/ui/SectionCard";
import PageHeader from "../../../components/ui/PageHeader";
import StatCard from "../../../components/ui/StatCard";

import { getProductById } from "../services/product.service";

import type { Product } from "../../staff/types/inventory.types";

import { getProductTransactions }
from "../../staff/services/inventory.service";

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";


const InventoryDetailsPage = () => {
    const navigate = useNavigate();
  const { id } = useParams();

const [product, setProduct] =
  useState<Product | null>(null);

  const [transactions, setTransactions] =
  useState<any[]>([]);

useEffect(() => {
  if (!id) return;

  const loadProduct = async () => {
    try {
      const [productData, transactionData] =
        await Promise.all([
          getProductById(id),
          getProductTransactions(id),
        ]);

      setProduct(productData);
      setTransactions(transactionData);
    } catch (err) {
      console.error(err);
    }
  };

  loadProduct();
}, [id]);

if (!product) {
  return <div>Loading...</div>;
}

return (
  <AdminLayout>
    <PageContainer className="space-y-10">

      <PageHeader
        title="Product Details"
        subtitle="View inventory information and transaction history."
        action={
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        }
      />

      {/* Hero */}

      <SectionCard>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-5">

            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-4xl">
              📦
            </div>

            <div>

              <h2 className="text-3xl font-bold">
                {product.name}
              </h2>

              <p className="mt-2 text-slate-500">
                SKU {product.sku}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {product.category.name}
                </span>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                  {product.type === "FINISHED"
                    ? "Finished Product"
                    : "Raw Material"}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {product.warehouse.name}
                </span>

              </div>

            </div>

          </div>

          <span
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              product.status === "Healthy"
                ? "bg-green-100 text-green-700"
                : product.status === "Low Stock"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.status}
          </span>

        </div>

      </SectionCard>

      {/* Stock Summary */}

      <section className="space-y-4">

        <h2 className="text-lg font-semibold">
          Stock Summary
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

          <StatCard
            title="Current Stock"
            value={product.currentStock}
          />

          <StatCard
            title="Minimum Stock"
            value={product.minimumStock}
          />

          <StatCard
            title="Warehouse"
            value={product.warehouse.name}
          />

          <StatCard
            title="Unit"
            value={product.unit}
          />

        </div>

      </section>

      {/* Product Information */}

      <SectionCard>

        <h2 className="mb-6 text-lg font-semibold">
          Product Information
        </h2>

        <div className="grid gap-6 md:grid-cols-3">

          <div>

            <p className="text-xs uppercase text-slate-500">
              Category
            </p>

            <p className="mt-2 font-semibold">
              {product.category.name}
            </p>

          </div>

          <div>

            <p className="text-xs uppercase text-slate-500">
              Product Type
            </p>

            <p className="mt-2 font-semibold">
              {product.type === "FINISHED"
                ? "Finished Product"
                : "Raw Material"}
            </p>

          </div>

          <div>

            <p className="text-xs uppercase text-slate-500">
              Status
            </p>

            <p className="mt-2 font-semibold">
              {product.status}
            </p>

          </div>

        </div>

      </SectionCard>

      {/* Transactions */}

      <SectionCard>

        <h2 className="mb-6 text-lg font-semibold">
          Recent Transactions
        </h2>

        <div className="divide-y divide-slate-100">

          {transactions.map((transaction) => (

            <div
              key={transaction._id}
              className="flex items-center justify-between py-5"
            >

              <div>

                <p className="font-semibold">
                  {transaction.reason}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {transaction.performedBy?.name}
                </p>

              </div>

              <div className="text-right">

                <p
                  className={`font-semibold ${
                    transaction.type === "IN"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "IN" ? "+" : "-"}
                  {transaction.quantity}
                </p>

                <p className="text-xs text-slate-500">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </p>

              </div>

            </div>

          ))}

        </div>

      </SectionCard>

    </PageContainer>
  </AdminLayout>
);
};

export default InventoryDetailsPage;
