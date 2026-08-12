import { deleteProduct } from "../services/product.service";
import type { Product } from "../../staff/types/inventory.types";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}

const DeleteProductModal = ({
  open,
  onClose,
  onSuccess,
  product,
}: DeleteProductModalProps) => {
  const handleDelete = async () => {
    if (!product) return;

    try {
      await deleteProduct(product._id);

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product.");
    }
  };

  if (!open || !product) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-slate-950/45
        p-4
        backdrop-blur-[2px]
        sm:p-6
      "
    >
      <div
        className="
          w-full
          max-w-md
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-[0_20px_60px_rgba(15,23,42,0.18)]
          sm:rounded-3xl
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            relative
            border-b
            border-slate-100
            px-5
            py-6
            sm:px-7
            sm:py-7
          "
        >
          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              absolute
              right-4
              top-4
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              sm:right-5
              sm:top-5
            "
          >
            <X size={17} />
          </button>

          {/* ICON */}

          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-red-50
              text-red-600
            "
          >
            <Trash2
              size={24}
              strokeWidth={1.9}
            />
          </div>

          <h2
            className="
              mt-4
              text-center
              text-xl
              font-bold
              tracking-tight
              text-slate-900
              sm:text-2xl
            "
          >
            Delete Product?
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-sm
              text-center
              text-xs
              leading-5
              text-slate-500
              sm:text-sm
            "
          >
            This will permanently remove the
            product from your inventory.
          </p>
        </div>

        {/* =====================================================
            BODY
        ===================================================== */}

        <div
          className="
            px-5
            py-5
            sm:px-7
            sm:py-6
          "
        >
          {/* PRODUCT */}

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-slate-50/70
              p-4
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.08em]
                text-slate-400
              "
            >
              Product
            </p>

            <div
              className="
                mt-2
                min-w-0
              "
            >
              <h3
                className="
                  truncate
                  text-base
                  font-bold
                  text-slate-900
                  sm:text-lg
                "
              >
                {product.name}
              </h3>

              <div
                className="
                  mt-1
                  flex
                  flex-wrap
                  items-center
                  gap-x-2
                  gap-y-1
                "
              >
                <span
                  className="
                    text-xs
                    font-medium
                    text-slate-500
                  "
                >
                  SKU
                </span>

                <span
                  className="
                    rounded-md
                    bg-white
                    px-1.5
                    py-0.5
                    text-[10px]
                    font-semibold
                    text-slate-600
                    ring-1
                    ring-slate-200
                  "
                >
                  {product.sku}
                </span>
              </div>
            </div>
          </div>

          {/* WARNING */}

          <div
            className="
              mt-4
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-red-100
              bg-red-50/70
              px-3.5
              py-3
            "
          >
            <AlertTriangle
              size={16}
              className="
                mt-0.5
                shrink-0
                text-red-500
              "
            />

            <p
              className="
                text-xs
                font-medium
                leading-5
                text-red-700
              "
            >
              This operation cannot be undone.
            </p>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div
          className="
            flex
            flex-col-reverse
            gap-2
            border-t
            border-slate-100
            bg-slate-50/60
            px-5
            py-4
            sm:flex-row
            sm:justify-end
            sm:px-7
            sm:py-5
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              h-10
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:border-slate-300
              hover:bg-slate-50
              active:scale-[0.98]
              sm:w-auto
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="
              inline-flex
              h-10
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-600
              px-5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-red-700
              active:scale-[0.98]
              sm:w-auto
            "
          >
            <Trash2
              size={15}
              strokeWidth={2}
            />

            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;