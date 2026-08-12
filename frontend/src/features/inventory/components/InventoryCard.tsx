import {
  Eye,
  Pencil,
  Trash2,
  MapPin,
  Package,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Product } from "../../staff/types/inventory.types";

interface InventoryCardProps {
  product: Product;
  onView: (id: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const InventoryCard = ({
  product,
  onView,
  onEdit,
  onDelete,
}: InventoryCardProps) => {
  const statusColor = {
    Healthy:
      "bg-emerald-50 text-emerald-700 ring-emerald-100",
    "Low Stock":
      "bg-amber-50 text-amber-700 ring-amber-100",
    Critical:
      "bg-red-50 text-red-700 ring-red-100",
  };

  const [previewImage, setPreviewImage] =
    useState<string | null>(null);

  const currentStatusColor =
    statusColor[
      product.status as keyof typeof statusColor
    ] ||
    "bg-slate-50 text-slate-600 ring-slate-200";

  return (
    <>
      <article
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
          transition-shadow
          duration-200
          hover:shadow-md
          sm:p-5
          lg:p-6
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            flex
            min-w-0
            flex-col
            gap-4
            sm:gap-5
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >
          {/* PRODUCT */}

          <div
            className="
              flex
              min-w-0
              items-start
              gap-3
              sm:gap-4
            "
          >
            {/* IMAGE */}

            <button
              type="button"
              disabled={!product.image}
              onClick={() => {
                if (product.image) {
                  setPreviewImage(
                    product.image
                  );
                }
              }}
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                bg-slate-100
                sm:h-16
                sm:w-16
                sm:rounded-2xl
              "
              aria-label={
                product.image
                  ? `View ${product.name} image`
                  : undefined
              }
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition
                    duration-200
                    hover:scale-105
                  "
                />
              ) : (
                <Package
                  className="
                    h-7
                    w-7
                    text-[#17357A]
                    sm:h-8
                    sm:w-8
                  "
                />
              )}
            </button>

            {/* PRODUCT INFO */}

            <div className="min-w-0 pt-0.5">
              <h2
                className="
                  break-words
                  text-base
                  font-bold
                  leading-6
                  text-slate-900
                  sm:text-lg
                  lg:text-xl
                "
              >
                {product.name}
              </h2>

              <div
                className="
                  mt-1.5
                  flex
                  flex-wrap
                  items-center
                  gap-x-2
                  gap-y-1.5
                  text-xs
                  text-slate-500
                  sm:mt-2
                  sm:text-sm
                "
              >
                <span
                  className="
                    max-w-full
                    truncate
                  "
                >
                  {product.sku}
                </span>

                <span className="text-slate-300">
                  •
                </span>

                <span
                  className="
                    max-w-[140px]
                    truncate
                  "
                >
                  {product.category?.name ||
                    "Uncategorized"}
                </span>

                <span
                  className={`
                    rounded-full
                    px-2
                    py-0.5
                    text-[10px]
                    font-semibold
                    sm:px-2.5
                    sm:py-1
                    sm:text-xs
                    ${
                      product.type ===
                      "FINISHED"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-orange-50 text-orange-700"
                    }
                  `}
                >
                  {product.type ===
                  "FINISHED"
                    ? "Finished Product"
                    : "Raw Material"}
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
              px-2.5
              py-1
              text-[10px]
              font-semibold
              ring-1
              sm:px-3
              sm:py-1.5
              sm:text-xs
              ${currentStatusColor}
            `}
          >
            {product.status}
          </span>
        </div>

        {/* =====================================================
            DIVIDER
        ===================================================== */}

        <div className="my-4 border-t border-slate-100 sm:my-5 lg:my-6" />

        {/* =====================================================
            STATS
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-2
            gap-x-4
            gap-y-5
            sm:gap-x-6
            lg:grid-cols-4
            lg:gap-6
          "
        >
          {/* CURRENT STOCK */}

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
              Current Stock
            </p>

            <p
              className="
                mt-1
                text-xl
                font-bold
                tracking-tight
                text-slate-900
                sm:text-2xl
                lg:text-3xl
              "
            >
              {product.currentStock}
            </p>
          </div>

          {/* MINIMUM STOCK */}

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
              Minimum Stock
            </p>

            <p
              className="
                mt-1
                text-xl
                font-bold
                tracking-tight
                text-slate-900
                sm:text-2xl
                lg:text-3xl
              "
            >
              {product.minimumStock}
            </p>
          </div>

          {/* WAREHOUSE */}

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
              Warehouse
            </p>

            <div
              className="
                mt-1.5
                flex
                min-w-0
                items-center
                gap-1.5
                text-sm
                font-semibold
                text-[#17357A]
              "
            >
              <MapPin
                size={15}
                className="shrink-0"
              />

              <span
                className="
                  min-w-0
                  truncate
                "
              >
                {product.warehouse?.name ||
                  "—"}
              </span>
            </div>
          </div>

          {/* PRODUCT TYPE */}

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
              Product Type
            </p>

            <p
              className="
                mt-1.5
                truncate
                text-sm
                font-semibold
                text-slate-700
              "
            >
              {product.type}
            </p>
          </div>
        </div>

        {/* =====================================================
            DIVIDER
        ===================================================== */}

        <div className="my-4 border-t border-slate-100 sm:my-5 lg:my-6" />

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-3
            gap-2
            sm:flex
            sm:flex-wrap
            sm:justify-end
            sm:gap-2.5
            lg:gap-3
          "
        >
          {/* VIEW */}

          <button
            type="button"
            onClick={() =>
              onView(product._id)
            }
            className="
              flex
              h-10
              items-center
              justify-center
              gap-1.5
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              text-xs
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
              active:scale-[0.98]
              sm:h-10
              sm:px-4
              sm:text-sm
            "
          >
            <Eye
              size={16}
              className="shrink-0"
            />

            <span>View</span>
          </button>

          {/* EDIT */}

          <button
            type="button"
            onClick={() =>
              onEdit(product)
            }
            className="
              flex
              h-10
              items-center
              justify-center
              gap-1.5
              rounded-xl
              bg-yellow-50
              px-3
              text-xs
              font-semibold
              text-yellow-800
              transition
              hover:bg-yellow-100
              active:scale-[0.98]
              sm:h-10
              sm:px-4
              sm:text-sm
            "
          >
            <Pencil
              size={16}
              className="shrink-0"
            />

            <span>Edit</span>
          </button>

          {/* DELETE */}

          <button
            type="button"
            onClick={() =>
              onDelete(product)
            }
            className="
              flex
              h-10
              items-center
              justify-center
              gap-1.5
              rounded-xl
              bg-red-50
              px-3
              text-xs
              font-semibold
              text-red-600
              transition
              hover:bg-red-100
              active:scale-[0.98]
              sm:h-10
              sm:px-4
              sm:text-sm
            "
          >
            <Trash2
              size={16}
              className="shrink-0"
            />

            <span>Delete</span>
          </button>
        </div>
      </article>

      {/* =======================================================
          IMAGE PREVIEW
      ======================================================= */}

      {previewImage && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-slate-950/80
            p-4
            backdrop-blur-sm
            sm:p-6
          "
          onClick={() =>
            setPreviewImage(null)
          }
        >
          <button
            type="button"
            onClick={() =>
              setPreviewImage(null)
            }
            aria-label="Close image preview"
            className="
              absolute
              right-3
              top-3
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white
              text-slate-700
              shadow-lg
              transition
              hover:bg-slate-100
              sm:right-6
              sm:top-6
            "
          >
            <X size={18} />
          </button>

          <img
            src={previewImage}
            alt="Product Preview"
            onClick={(e) =>
              e.stopPropagation()
            }
            className="
              max-h-[85vh]
              max-w-full
              rounded-2xl
              bg-white
              object-contain
              shadow-2xl
              sm:max-h-[90vh]
              sm:max-w-[90vw]
            "
          />
        </div>
      )}
    </>
  );
};

export default InventoryCard;