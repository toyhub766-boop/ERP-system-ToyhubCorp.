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

      {/* Header */}

      <div className="bg-[#17357A] text-white px-4 py-4 flex items-center gap-3">

        <button
          onClick={() =>
            navigate(-1)
          }
          className="text-xl"
        >
          ←
        </button>

        <h1 className="font-semibold text-lg">
          Stock OUT
        </h1>

      </div>

      <div className="p-4 space-y-5">

        {/* Product */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Product
          </label>

          <input
            disabled
            value={`${product.name} (${product.sku})`}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          />

        </div>

        {/* Current Stock */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Current Stock
          </label>

          <div className="rounded-xl bg-slate-100 border border-slate-200 px-4 py-4">

            <span className="text-3xl font-bold text-[#17357A]">
              {product.currentStock}
            </span>

            <span className="ml-2 text-slate-500">
              {product.unit}
            </span>

          </div>

        </div>

        <div className="text-sm text-slate-500">
  Remaining after removal:
  <span className="font-semibold ml-2">
    {Math.max(
      0,
      product.currentStock -
        Number(quantity || 0)
    )}{" "}
    {product.unit}
  </span>
</div>

        {/* Quantity */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Remove Quantity
          </label>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(
                e.target.value
              )
            }
            placeholder="0"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

        </div>

        {/* Warehouse */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Warehouse
          </label>

          <input
            disabled
            value={
              product.warehouse
                ?.name
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          />

        </div>

        {/* Notes */}

        {/* Reason */}

<div>
  <label className="block text-sm font-medium mb-2">
    Reason
  </label>

  <div className="flex flex-wrap gap-2">

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
    className={`px-4 py-2 rounded-full border text-sm transition ${
      reason === item
        ? "bg-red-600 text-white border-red-600"
        : "bg-white text-slate-700 border-slate-300"
    }`}
  >
    {item}
  </button>
))}

  </div>
</div>

{/* Batch */}

<div>
  <label className="block text-sm font-medium mb-2">
    Batch / Marka
    <span className="text-slate-400 text-xs ml-1">
      (Optional)
    </span>
  </label>

  <input
    type="text"
    value={batch}
    onChange={(e) =>
      setBatch(e.target.value)
    }
    placeholder="e.g. BATCH-2406-A"
    className="w-full rounded-xl border border-slate-300 px-4 py-3"
  />
</div>

{/* Notes */}

<div>
  <label className="block text-sm font-medium mb-2">
    Notes
    <span className="text-slate-400 text-xs ml-1">
      (Optional)
    </span>
  </label>

  <textarea
    rows={4}
    value={notes}
    onChange={(e) =>
      setNotes(e.target.value)
    }
    placeholder="Additional notes..."
    className="w-full rounded-xl border border-slate-300 px-4 py-3 resize-none"
  />
</div>

        {/* Button */}

        <button
          onClick={
            handleSubmit
          }
          className="
bg-red-600
hover:bg-red-700
text-white
rounded-2xl
py-4
text-lg
font-semibold
"
        >
          ✓ Confirm Stock IN
        </button>

      </div>
          <BottomNavigation />
    </div>
  );
};

export default StockOutPage;