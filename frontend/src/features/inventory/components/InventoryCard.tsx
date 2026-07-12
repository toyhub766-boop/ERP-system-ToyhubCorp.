import { Eye, Pencil, Trash2, MapPin, Package } from "lucide-react";
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
    Healthy: "bg-green-100 text-green-700",
    "Low Stock": "bg-yellow-100 text-yellow-700",
    Critical: "bg-red-100 text-red-700",
  };

  return (
    <div className="
      bg-white
      border
      border-slate-200
      rounded-2xl
      shadow-sm
      hover:shadow-md
      transition-all
      duration-200
      p-6
    ">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

        <div className="flex gap-4">

          <div className="
            h-16
            w-16
            rounded-2xl
            bg-slate-100
            flex
            items-center
            justify-center
          ">
            <Package className="h-8 w-8 text-[#17357A]" />
          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              {product.name}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">

              <span>{product.sku}</span>

              <span>•</span>

              <span>{product.category?.name}</span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
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
          className={`inline-flex h-fit rounded-full px-3 py-1 text-xs font-semibold ${
            statusColor[
              product.status as keyof typeof statusColor
            ]
          }`}
        >
          {product.status}
        </span>

      </div>

      {/* Divider */}

      <div className="my-6 border-t border-slate-100" />

      {/* Stats */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

        <div>

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Current Stock
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {product.currentStock}
          </p>

        </div>

        <div>

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Minimum Stock
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {product.minimumStock}
          </p>

        </div>

        <div>

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Warehouse
          </p>

          <div className="mt-2 flex items-center gap-2 font-semibold text-[#17357A]">

            <MapPin size={16} />

            {product.warehouse?.name}

          </div>

        </div>

        <div>

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Product Type
          </p>

          <p className="mt-2 font-semibold text-slate-700">
            {product.type}
          </p>

        </div>

      </div>

      {/* Divider */}

      <div className="my-6 border-t border-slate-100" />

      {/* Actions */}

      <div className="flex flex-wrap justify-end gap-3">

        <button
          onClick={() => onView(product._id)}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-medium
            text-slate-700
            hover:bg-slate-50
          "
        >
          <Eye size={18} />
          View
        </button>

        <button
          onClick={() => onEdit(product)}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-yellow-100
            px-4
            py-2.5
            text-sm
            font-medium
            text-yellow-800
            hover:bg-yellow-200
          "
        >
          <Pencil size={18} />
          Edit
        </button>

        <button
          onClick={() => onDelete(product)}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-red-100
            px-4
            py-2.5
            text-sm
            font-medium
            text-red-600
            hover:bg-red-200
          "
        >
          <Trash2 size={18} />
          Delete
        </button>

      </div>

    </div>
  );
};

export default InventoryCard;