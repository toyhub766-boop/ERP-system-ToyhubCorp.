import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getProducts,
  stockIn,
} from "../../staff/services/inventory.service";

import type { Product } from "../../staff/types/inventory.types";

import BottomNavigation from "../components/BottomNavigation";

import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";
import SectionCard from "../../../components/ui/SectionCard";
import StatCard from "../../../components/ui/StatCard";

const StockInPage = () => {
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
  useState("Purchase");

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

  const handleSubmit =
    async () => {
      if (
        !product ||
        !quantity
      )
        return;

      try {
        await stockIn({
  productId: product._id,
  quantity: Number(quantity),
  reason,
  notes,
  batch,
});

        alert(
          "Stock added successfully"
        );

        navigate(
          "/staff/inventory"
        );
      } catch (err) {
        console.error(err);
        alert(
          "Failed to add stock"
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

      <div className="mx-auto w-full max-w-3xl space-y-6">

        <PageHeader
          title="Stock In"
          subtitle="Receive inventory into warehouse."
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

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
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
            title="After Update"
            value={
              quantity
                ? `${product.currentStock + Number(quantity)}`
                : `${product.currentStock}`
            }
          />

        </div>

        {/* Quantity */}

        <SectionCard>

          <h3 className="mb-5 text-lg font-semibold">
            Add Quantity
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
              focus:border-[#17357A]
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
              "Purchase",
              "Production",
              "Customer Return",
              "Stock Adjustment",
              "Transfer In",
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
                      ? "bg-[#17357A] text-white"
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
                  focus:border-[#17357A]
                "
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Notes
              </label>

              <textarea
                rows={5}
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
                  focus:border-[#17357A]
                "
              />

            </div>

          </div>

        </SectionCard>

        <button
          onClick={handleSubmit}
          className="
            w-full
            rounded-2xl
            bg-[#17357A]
            py-4
            text-lg
            font-semibold
            text-white
            transition
            hover:bg-[#21479f]
            active:scale-[0.99]
          "
        >
          Confirm Stock In
        </button>

      </div>

    </PageContainer>

    <BottomNavigation />

  </div>
);
};

export default StockInPage;