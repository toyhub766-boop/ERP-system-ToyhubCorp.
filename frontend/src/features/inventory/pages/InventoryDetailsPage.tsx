import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../../app/layouts/AdminLayout";
import PageContainer from "../../../components/ui/PageContainer";
import SectionCard from "../../../components/ui/SectionCard";
import PageHeader from "../../../components/ui/PageHeader";
import StatCard from "../../../components/ui/StatCard";

import { getProductById } from "../services/product.service";
import type { Product } from "../../staff/types/inventory.types";
import { getProductTransactions } from "../../staff/services/inventory.service";

import {
  ArrowLeft,
  Package,
  MapPin,
  CalendarDays,
} from "lucide-react";

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
        const [
          productData,
          transactionData,
        ] = await Promise.all([
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
    return (
      <AdminLayout>
        <PageContainer>
          <div
            className="
              flex
              min-h-[50vh]
              items-center
              justify-center
              text-sm
              font-medium
              text-slate-500
            "
          >
            Loading product...
          </div>
        </PageContainer>
      </AdminLayout>
    );
  }

  const statusClass =
    product.status === "Healthy"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : product.status === "Low Stock"
        ? "bg-amber-50 text-amber-700 ring-amber-100"
        : "bg-red-50 text-red-700 ring-red-100";

  return (
    <AdminLayout>
      <PageContainer className="space-y-6 sm:space-y-8 lg:space-y-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <PageHeader
          title="Product Details"
          subtitle="View inventory information and transaction history."
          action={
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                flex
                h-10
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                font-medium
                text-slate-700
                transition
                hover:bg-slate-50
                active:scale-[0.98]
                sm:px-4
              "
            >
              <ArrowLeft size={17} />
              <span>Back</span>
            </button>
          }
        />

        {/* =====================================================
            PRODUCT HERO
        ===================================================== */}

        <SectionCard>
          <div
            className="
              flex
              min-w-0
              flex-col
              gap-5
              sm:gap-6
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            {/* PRODUCT INFO */}

            <div
              className="
                flex
                min-w-0
                items-start
                gap-3
                sm:gap-5
              "
            >
              {/* PRODUCT ICON */}

              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-100
                  text-[#17357A]
                  sm:h-20
                  sm:w-20
                "
              >
                <Package
                  className="
                    h-7
                    w-7
                    sm:h-9
                    sm:w-9
                  "
                />
              </div>

              {/* DETAILS */}

              <div className="min-w-0">
                <h2
                  className="
                    break-words
                    text-xl
                    font-bold
                    leading-7
                    tracking-tight
                    text-slate-900
                    sm:text-2xl
                    lg:text-3xl
                  "
                >
                  {product.name}
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                    sm:mt-2
                    sm:text-sm
                    sm:text-slate-500
                  "
                >
                  SKU {product.sku}
                </p>

                <div
                  className="
                    mt-3
                    flex
                    max-w-full
                    flex-wrap
                    gap-1.5
                    sm:gap-2
                  "
                >
                  <span
                    className="
                      max-w-full
                      truncate
                      rounded-full
                      bg-blue-50
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      text-blue-700
                      sm:px-3
                      sm:text-xs
                    "
                  >
                    {product.category.name}
                  </span>

                  <span
                    className="
                      rounded-full
                      bg-orange-50
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      text-orange-700
                      sm:px-3
                      sm:text-xs
                    "
                  >
                    {product.type === "FINISHED"
                      ? "Finished Product"
                      : "Raw Material"}
                  </span>

                  <span
                    className="
                      inline-flex
                      max-w-full
                      items-center
                      gap-1
                      truncate
                      rounded-full
                      bg-slate-100
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      text-slate-700
                      sm:px-3
                      sm:text-xs
                    "
                  >
                    <MapPin
                      size={11}
                      className="shrink-0"
                    />

                    <span className="truncate">
                      {product.warehouse.name}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* STATUS */}

            <span
              className={`
                inline-flex
                w-fit
                shrink-0
                rounded-full
                px-3
                py-1.5
                text-xs
                font-semibold
                ring-1
                sm:px-5
                sm:py-2
                sm:text-sm
                ${statusClass}
              `}
            >
              {product.status}
            </span>
          </div>
        </SectionCard>

        {/* =====================================================
            STOCK SUMMARY
        ===================================================== */}

        <section className="space-y-3 sm:space-y-4">
          <h2
            className="
              text-base
              font-semibold
              tracking-tight
              text-slate-900
              sm:text-lg
            "
          >
            Stock Summary
          </h2>

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:gap-5
              lg:grid-cols-4
            "
          >
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

        {/* =====================================================
            PRODUCT INFORMATION
        ===================================================== */}

        <SectionCard>
          <h2
            className="
              mb-5
              text-base
              font-semibold
              tracking-tight
              text-slate-900
              sm:mb-6
              sm:text-lg
            "
          >
            Product Information
          </h2>

          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              sm:gap-6
              md:grid-cols-3
            "
          >
            <InfoItem
              label="Category"
              value={product.category.name}
            />

            <InfoItem
              label="Product Type"
              value={
                product.type === "FINISHED"
                  ? "Finished Product"
                  : "Raw Material"
              }
            />

            <InfoItem
              label="Status"
              value={product.status}
            />
          </div>
        </SectionCard>

        {/* =====================================================
            TRANSACTIONS
        ===================================================== */}

        <SectionCard>
          <div className="mb-5 sm:mb-6">
            <h2
              className="
                text-base
                font-semibold
                tracking-tight
                text-slate-900
                sm:text-lg
              "
            >
              Recent Transactions
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
                sm:text-sm
              "
            >
              Inventory movement history for
              this product.
            </p>
          </div>

          {transactions.length === 0 ? (
            <div
              className="
                rounded-xl
                border
                border-dashed
                border-slate-200
                px-4
                py-10
                text-center
                text-sm
                text-slate-400
              "
            >
              No transactions found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map(
                (transaction) => (
                  <div
                    key={transaction._id}
                    className="
                      flex
                      min-w-0
                      flex-col
                      gap-3
                      py-4
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      sm:py-5
                    "
                  >
                    {/* TRANSACTION INFO */}

                    <div className="min-w-0">
                      <p
                        className="
                          break-words
                          text-sm
                          font-semibold
                          text-slate-800
                          sm:text-base
                        "
                      >
                        {transaction.reason}
                      </p>

                      <div
                        className="
                          mt-1.5
                          flex
                          flex-wrap
                          items-center
                          gap-x-2
                          gap-y-1
                          text-xs
                          text-slate-400
                          sm:text-sm
                        "
                      >
                        {transaction.performedBy
                          ?.name && (
                          <span>
                            {
                              transaction
                                .performedBy
                                .name
                            }
                          </span>
                        )}

                        <span className="text-slate-200">
                          •
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <CalendarDays
                            size={11}
                          />

                          {new Date(
                            transaction.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* AMOUNT */}

                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        justify-between
                        gap-4
                        sm:block
                        sm:text-right
                      "
                    >
                      <span
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wide
                          text-slate-400
                          sm:hidden
                        "
                      >
                        Quantity
                      </span>

                      <div>
                        <p
                          className={`
                            text-sm
                            font-bold
                            sm:text-base
                            ${
                              transaction.type ===
                              "IN"
                                ? "text-emerald-600"
                                : "text-red-600"
                            }
                          `}
                        >
                          {transaction.type ===
                          "IN"
                            ? "+"
                            : "-"}
                          {transaction.quantity}
                        </p>

                        <p
                          className="
                            mt-0.5
                            hidden
                            text-xs
                            text-slate-400
                            sm:block
                          "
                        >
                          {new Date(
                            transaction.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </SectionCard>
      </PageContainer>
    </AdminLayout>
  );
};

/* ================================================================
   SMALL INFORMATION COMPONENT
================================================================ */

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
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
        {label}
      </p>

      <p
        className="
          mt-1.5
          break-words
          text-sm
          font-semibold
          text-slate-800
          sm:mt-2
        "
      >
        {value}
      </p>
    </div>
  );
};

export default InventoryDetailsPage;