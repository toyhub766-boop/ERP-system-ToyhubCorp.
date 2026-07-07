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
  }, [product]);

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    [],
  );

  const [warehouses, setWarehouses] = useState<{ _id: string; name: string }[]>(
    [],
  );

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
        !form.name ||
        !form.type ||
        !form.sku ||
        !form.category ||
        !form.warehouse
      ) {
        alert("Please fill all required fields.");
        return;
      }

      await updateProduct(product!._id, form);

      onSuccess();

      onClose();

      setForm({
        name: "",
        type: "RAW",
        sku: "",
        category: "",
        warehouse: "",
        unit: "PCS",
        minimumStock: 0,
        currentStock: 0,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to create product.");
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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold">Edit Product</h2>

            <p className="text-sm text-slate-500">Update product information</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}

        <div className="p-6">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Product Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="RAW">Raw Material</option>
                <option value="FINISHED">Finished Product</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>

              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="">Select Category</option>

                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Warehouse
              </label>

              <select
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="">Select Warehouse</option>

                {warehouses.map((warehouse) => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Unit</label>

              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="PCS">PCS</option>
                <option value="BOX">BOX</option>
                <option value="SET">SET</option>
                <option value="KG">KG</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Stock
              </label>

              <input
                type="number"
                name="minimumStock"
                value={form.minimumStock}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Current Stock
              </label>

              <input
                type="number"
                name="currentStock"
                value={form.currentStock}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="border-t p-6 flex justify-end gap-3">
          <button
            onClick={() => {
              setForm({
                name: "",
                type: "RAW",
                sku: "",
                category: "",
                warehouse: "",
                unit: "PCS",
                minimumStock: 0,
                currentStock: 0,
              });

              onSuccess();
              onClose();
            }}
            className="px-6 py-3 rounded-xl border hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-[#17357A] text-white rounded-xl"
          >
            Update Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
