import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

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
      "bg-green-100 text-green-700",

    "Low Stock":
      "bg-yellow-100 text-yellow-700",

    Critical:
      "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

      <div className="flex justify-between">

        <div className="flex gap-4">

          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
            📦
          </div>

          <div>

            <h2 className="font-bold text-lg">
              {product.name}
            </h2>

            <div className="flex items-center gap-2 mt-1">

  <p className="text-sm text-slate-500">
    {product.sku} • {product.category?.name}
  </p>

  <span
    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
      product.type === "FINISHED"
        ? "bg-blue-100 text-blue-700"
        : "bg-orange-100 text-orange-700"
    }`}
  >
    {product.type === "FINISHED"
      ? "Finished Product"
      : "Raw Material"}
  </span>

</div>

          </div>

        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColor[
              product.status as keyof typeof statusColor
            ]
          }`}
        >
          {product.status}
        </span>

      </div>

      <div className="grid grid-cols-3 gap-8 mt-6">

        <div>
          <p className="text-xs text-slate-500">
            Current
          </p>

          <h3 className="text-3xl font-bold">
            {product.currentStock}
          </h3>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Minimum
          </p>

          <h3 className="text-3xl font-bold">
            {product.minimumStock}
          </h3>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Location
          </p>

          <h3 className="font-semibold text-[#17357A]">
            {product.warehouse?.name}
          </h3>
        </div>

      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">

        <button
          onClick={() =>
            onView(product._id)
          }
          className="flex items-center justify-center gap-2 rounded-xl py-3 bg-blue-50 text-[#17357A] font-medium"
        >
          <Eye size={18} />
          View
        </button>

        <button
          onClick={() =>
            onEdit(product)
          }
          className="flex items-center justify-center gap-2 rounded-xl py-3 bg-yellow-100 text-yellow-800 font-medium"
        >
          <Pencil size={18} />
          Edit
        </button>

        <button
          onClick={() =>
            onDelete(product)
          }
          className="flex items-center justify-center rounded-xl py-3 bg-red-100 text-red-600"
        >
          <Trash2 size={18} />
        </button>

      </div>

    </div>
  );
};

export default InventoryCard;