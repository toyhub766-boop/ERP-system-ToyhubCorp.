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

  const handleSubmit = async () => {
    if (!product || !quantity) return;

    try {
      await stockIn({
        productId: product._id,
        quantity: Number(quantity),
        reason,
        notes,
        batch,
      });

      alert("Stock added successfully");

      navigate("/staff/inventory");
    } catch (err) {
      console.error(err);

      alert("Failed to add stock");
    }
  };

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-100
          p-6
        "
      >
        <p className="text-sm font-medium text-slate-600">
          Loading...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-100
          p-6
        "
      >
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800">
            Product not found
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              mt-4
              rounded-xl
              bg-[#17357A]
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
            "
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const updatedStock =
    product.currentStock +
    Number(quantity || 0);

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
            max-w-3xl
            space-y-5
            pb-28
            sm:space-y-6
          "
        >
          {/* =====================================================
              HEADER
          ===================================================== */}

          <PageHeader
            title="Stock In"
            subtitle="Receive inventory into warehouse."
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
              PRODUCT
          ===================================================== */}

          <SectionCard>
            <div
              className="
                flex
                items-center
                gap-3
                sm:gap-4
              "
            >
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-50
                  text-2xl
                  sm:h-16
                  sm:w-16
                  sm:text-3xl
                "
              >
                📦
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  className="
                    truncate
                    text-lg
                    font-bold
                    text-slate-900
                    sm:text-xl
                  "
                >
                  {product.name}
                </h2>

                <p
                  className="
                    mt-1
                    truncate
                    text-xs
                    text-slate-500
                    sm:text-sm
                  "
                >
                  SKU: {product.sku}
                </p>

                <p
                  className="
                    truncate
                    text-xs
                    text-slate-500
                    sm:text-sm
                  "
                >
                  {product.warehouse?.name}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* =====================================================
              STOCK SUMMARY
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
              title="Current Stock"
              value={`${product.currentStock}`}
            />

            <StatCard
              title="After Update"
              value={`${updatedStock}`}
            />
          </div>

          {/* =====================================================
              QUANTITY
          ===================================================== */}

          <SectionCard>
            <h3
              className="
                mb-4
                text-base
                font-semibold
                text-slate-900
                sm:mb-5
                sm:text-lg
              "
            >
              Add Quantity
            </h3>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              placeholder="Enter quantity"
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-base
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                hover:border-slate-300
                focus:border-[#17357A]
                focus:ring-2
                focus:ring-[#17357A]/10
                sm:h-13
                sm:rounded-2xl
                sm:px-5
              "
            />
          </SectionCard>

          {/* =====================================================
              REASON
          ===================================================== */}

          <SectionCard>
            <h3
              className="
                mb-4
                text-base
                font-semibold
                text-slate-900
                sm:mb-5
                sm:text-lg
              "
            >
              Reason
            </h3>

            <div
              className="
                flex
                flex-wrap
                gap-2
                sm:gap-3
              "
            >
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
                  onClick={() =>
                    setReason(item)
                  }
                  className={`
                    min-h-10
                    rounded-full
                    px-3.5
                    py-2
                    text-xs
                    font-medium
                    transition
                    active:scale-[0.97]
                    sm:px-4
                    sm:py-2.5
                    sm:text-sm
                    ${
                      reason === item
                        ? "bg-[#17357A] text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }
                  `}
                >
                  {item}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* =====================================================
              ADDITIONAL DETAILS
          ===================================================== */}

          <SectionCard>
            <div className="grid gap-5">
              <div>
                <label
                  htmlFor="stock-in-batch"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-slate-700
                    sm:text-sm
                  "
                >
                  Batch / Marka
                </label>

                <input
                  id="stock-in-batch"
                  value={batch}
                  onChange={(e) =>
                    setBatch(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3.5
                    text-sm
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-[#17357A]
                    focus:ring-2
                    focus:ring-[#17357A]/10
                    sm:h-12
                    sm:rounded-2xl
                    sm:px-4
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="stock-in-notes"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-slate-700
                    sm:text-sm
                  "
                >
                  Notes
                </label>

                <textarea
                  id="stock-in-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  placeholder="Additional notes..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3.5
                    py-3
                    text-sm
                    leading-5
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-[#17357A]
                    focus:ring-2
                    focus:ring-[#17357A]/10
                    sm:rounded-2xl
                    sm:px-4
                  "
                />
              </div>
            </div>
          </SectionCard>

          {/* =====================================================
              CONFIRM
          ===================================================== */}

          <div
            className="
              sticky
              bottom-[4.5rem]
              z-30
              -mx-1
              bg-slate-100/95
              px-1
              pb-2
              pt-3
              backdrop-blur-sm
              sm:static
              sm:mx-0
              sm:bg-transparent
              sm:px-0
              sm:pb-0
              sm:pt-2
              sm:backdrop-blur-none
            "
          >
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !quantity ||
                Number(quantity) <= 0
              }
              className="
                h-12
                w-full
                rounded-xl
                bg-[#17357A]
                px-4
                text-sm
                font-semibold
                text-white
                shadow-lg
                transition
                hover:bg-[#21479f]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:h-13
                sm:rounded-2xl
                sm:text-base
              "
            >
              Confirm Stock In
            </button>
          </div>
        </div>
      </PageContainer>

      <BottomNavigation />
    </div>
  );
};

export default StockInPage;