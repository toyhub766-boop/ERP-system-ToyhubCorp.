import { deleteProduct } from "../services/product.service";
import type { Product } from "../../staff/types/inventory.types";

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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-6">

    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

      {/* Header */}

      <div className="border-b border-slate-200 px-7 py-6">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7L5 7M10 11V17M14 11V17M9 7V4H15V7M6 7L7 20H17L18 7"
            />
          </svg>

        </div>

        <h2 className="mt-4 text-center text-2xl font-bold text-slate-900">
          Delete Product
        </h2>

        <p className="mt-2 text-center text-sm text-slate-500">
          This action permanently removes the product from inventory.
        </p>

      </div>

      {/* Body */}

      <div className="px-7 py-6">

        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">

          <p className="text-sm text-slate-600">
            You are about to delete
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {product.name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            SKU: {product.sku}
          </p>

        </div>

        <p className="mt-5 text-sm text-red-600 font-medium">
          This operation cannot be undone.
        </p>

      </div>

      {/* Footer */}

      <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-7 py-5">

        <button
          onClick={onClose}
          className="
            rounded-xl
            border
            border-slate-300
            bg-white
            px-5
            py-2.5
            font-medium
            text-slate-700
            transition
            hover:bg-slate-100
          "
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          className="
            rounded-xl
            bg-red-600
            px-5
            py-2.5
            font-semibold
            text-white
            transition
            hover:bg-red-700
          "
        >
          Delete Product
        </button>

      </div>

    </div>

  </div>
);
};


export default DeleteProductModal;