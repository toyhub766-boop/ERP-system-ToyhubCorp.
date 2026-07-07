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
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
    <div className="bg-white rounded-2xl p-6 w-[420px]">

      <h2 className="text-2xl font-bold">
        Delete Product
      </h2>

      <p className="mt-4 text-slate-600">
        Are you sure you want to delete
        <span className="font-semibold">
          {" "}
          {product.name}
        </span>
        ?
      </p>

      <p className="text-red-500 mt-2 text-sm">
        This action cannot be undone.
      </p>

      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={onClose}
          className="border rounded-xl px-5 py-2"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-600 text-white rounded-xl px-5 py-2"
        >
          Delete
        </button>
      </div>

    </div>
  </div>

);
};


export default DeleteProductModal;