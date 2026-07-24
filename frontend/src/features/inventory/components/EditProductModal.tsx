import { useState } from "react";
import { useEffect } from "react";
import { getCategories } from "../../categories/services/category.service";
import { getWarehouses } from "../../warehouses/services/warehouse.service";
import { updateProduct } from "../services/product.service";
import { X } from "lucide-react";
import type { Product } from "../../staff/types/inventory.types";

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}

const EditProductModal = ({
  open,
  onClose,
  onSuccess,
  product,
}: EditProductModalProps) => {
  const [form, setForm] = useState({
    name: "",
    type: "RAW",
    sku: "",
    category: "",
    warehouse: "",
    unit: "PCS",
    minimumStock: 0,
    currentStock: 0,
  });

  useEffect(() => {
    if (!product) return;

    setForm({
      name: product.name,
      type: product.type,
      sku: product.sku,
      category: product.category._id,
      warehouse: product.warehouse._id,
      unit: product.unit,
      minimumStock: product.minimumStock,
      currentStock: product.currentStock,
    });

    setPreview(product.image || "");
setImage(null);
  }, [product]);

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    [],
  );

  const [warehouses, setWarehouses] = useState<{ _id: string; name: string }[]>(
    [],
  );

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleSubmit = async () => {
  try {
    if (
      !product ||
      !form.name ||
      !form.type ||
      !form.sku ||
      !form.category ||
      !form.warehouse
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("type", form.type);
    formData.append("sku", form.sku);
    formData.append("category", form.category);
    formData.append("warehouse", form.warehouse);
    formData.append("unit", form.unit);
    formData.append(
      "minimumStock",
      String(form.minimumStock)
    );
    formData.append(
      "currentStock",
      String(form.currentStock)
    );

    if (image) {
      formData.append("image", image);
    }

    await updateProduct(product._id, formData);

    onSuccess();
    onClose();

    setImage(null);
    setPreview("");

  } catch (error) {
    console.error(error);
    alert("Failed to update product.");
  }
};


  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        const [categoriesData, warehousesData] = await Promise.all([
          getCategories(),
          getWarehouses(),
        ]);

        setCategories(categoriesData);
        setWarehouses(warehousesData);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [open]);

  if (!open) return null;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-6">

    <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">

      {/* Header */}

      <div className="flex items-start justify-between border-b border-slate-200 px-8 py-6">

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Edit Product
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update product information.
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} />
        </button>

      </div>

      {/* Body */}

      <div className="max-h-[70vh] overflow-y-auto px-8 py-7">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Product Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  setImage(file);
                  setPreview(URL.createObjectURL(file));
                }}
              />

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-4 h-40 w-40 rounded-xl border object-cover"
                />
              )}
            </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Product Name *
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-slate-300 px-4 transition focus:border-[#17357A] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              SKU *
            </label>

            <input
              type="text"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-slate-300 px-4 transition focus:border-[#17357A] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Product Type *
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-slate-300 px-4"
            >
              <option value="RAW">Raw Material</option>
              <option value="FINISHED">Finished Product</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Unit
            </label>

            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-slate-300 px-4"
            >
              <option value="PCS">PCS</option>
              <option value="BOX">BOX</option>
              <option value="SET">SET</option>
              <option value="KG">KG</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Category *
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-slate-300 px-4"
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Warehouse *
            </label>

            <select
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-slate-300 px-4"
            >
              <option value="">
                Select Warehouse
              </option>

              {warehouses.map((warehouse) => (
                <option
                  key={warehouse._id}
                  value={warehouse._id}
                >
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Minimum Stock
            </label>

            <input
              type="number"
              name="minimumStock"
              value={form.minimumStock}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-slate-300 px-4"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Current Stock
            </label>

            <input
              type="number"
              name="currentStock"
              value={form.currentStock}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-slate-300 px-4"
            />
          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-8 py-5">

        <button
          onClick={() => {
  if (!product) return;
  setForm({
    name: product.name,
    type: product.type,
    sku: product.sku,
    category: product.category._id,
    warehouse: product.warehouse._id,
    unit: product.unit,
    minimumStock: product.minimumStock,
    currentStock: product.currentStock,
  });

  setPreview(product.image || "");
setImage(null);

  onClose();
}}
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
          onClick={handleSubmit}
          className="
            rounded-xl
            bg-[#17357A]
            px-5
            py-2.5
            font-semibold
            text-white
            transition
            hover:bg-[#20459D]
          "
        >
          Update Product
        </button>

      </div>

    </div>

  </div>
);
};

export default EditProductModal;
