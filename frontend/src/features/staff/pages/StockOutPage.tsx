import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getProducts,
  stockOut,
} from "../services/inventory.service";

import type { Product } from "../../staff/types/inventory.types";

import BottomNavigation from "../components/BottomNavigation";
import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";
import SectionCard from "../../../components/ui/SectionCard";
import StatCard from "../../../components/ui/StatCard";

const StockOutPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [quantity, setQuantity] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [reason, setReason] =
  useState("Production");

const [batch, setBatch] =
  useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const products =
          await getProducts();

        const selected =
          products.find(
            (p: Product) =>
              p._id === id
          );

        if (selected) {
          setProduct(selected);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async () => {
  if (!product || !quantity) return;

  try {
    await stockOut({
      productId: product._id,
      quantity: Number(quantity),
      reason,
      notes,
      batch,
    });

    alert("Stock removed successfully");

    navigate("/staff/inventory");
  } catch (err: any) {
    alert(
      err?.response?.data?.message ??
        "Failed to remove stock"
    );
  }
};

  if (loading)
    return (
      <div className="p-6">
        Loading...
      </div>
    );

  if (!product)
    return (
      <div className="p-6">
        Product not found
      </div>
    );

return (
  <div className="min-h-screen bg-slate-100">

    <PageContainer>

      <div className="mx-auto w-full max-w-3xl space-y-6 pb-28">

        <PageHeader
          title="Stock Out"
          subtitle="Remove inventory from warehouse."
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
                transition
                hover:bg-slate-50
              "
            >
              ← Back
            </button>
          }
        />

        {/* Product */}

        <SectionCard>

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
              📦
            </div>

            <div className="flex-1">

              <h2 className="text-xl font-bold">
                {product.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                SKU : {product.sku}
              </p>

              <p className="text-sm text-slate-500">
                {product.warehouse?.name}
              </p>

            </div>

          </div>

        </SectionCard>

        {/* Stock */}

        <div className="grid grid-cols-2 gap-5">

          <StatCard
            title="Current Stock"
            value={`${product.currentStock}`}
          />

          <StatCard
            title="Remaining Stock"
            value={`${Math.max(
              0,
              product.currentStock - Number(quantity || 0)
            )}`}
          />

        </div>

        {/* Quantity */}

        <SectionCard>

          <h3 className="mb-5 text-lg font-semibold">
            Remove Quantity
          </h3>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            className="
              w-full
              rounded-2xl
              border
              border-slate-200
              px-5
              py-4
              text-lg
              outline-none
              transition
              focus:border-red-500
            "
          />

        </SectionCard>

        {/* Reason */}

        <SectionCard>

          <h3 className="mb-5 text-lg font-semibold">
            Reason
          </h3>

          <div className="flex flex-wrap gap-3">

            {[
              "Production",
              "Sales / Dispatch",
              "Damaged",
              "Loss / Theft",
              "Transfer Out",
              "Stock Adjustment",
              "Sample",
              "Other",
            ].map((item) => (

              <button
                key={item}
                type="button"
                onClick={() => setReason(item)}
                className={`
                  rounded-full
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  transition
                  ${
                    reason === item
                      ? "bg-red-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }
                `}
              >
                {item}
              </button>

            ))}

          </div>

        </SectionCard>

        {/* Additional */}

        <SectionCard>

          <div className="grid gap-5">

            <div>

              <label className="mb-2 block text-sm font-medium">
                Batch / Marka
              </label>

              <input
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Optional"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  px-4
                  py-3
                  outline-none
                  focus:border-red-500
                "
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Notes
              </label>

              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                className="
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-slate-200
                  px-4
                  py-3
                  outline-none
                  focus:border-red-500
                "
              />

            </div>

          </div>

        </SectionCard>

        <div className="sticky bottom-20 bg-slate-100 pt-4">
  <button
    onClick={handleSubmit}
    className="
      w-full
      rounded-2xl
      bg-red-600
      py-4
      text-lg
      font-semibold
      text-white
      hover:bg-red-700
      transition
      active:scale-[0.99]
    "
  >
    Confirm Stock Out
  </button>
</div>

      </div>

    </PageContainer>

    <BottomNavigation />

  </div>
);};

export default StockOutPage;