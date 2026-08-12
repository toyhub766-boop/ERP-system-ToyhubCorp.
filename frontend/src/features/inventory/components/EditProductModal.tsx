import { useEffect, useState } from "react";

import {
  getCategories,
} from "../../categories/services/category.service";

import {
  getWarehouses,
} from "../../warehouses/services/warehouse.service";

import {
  updateProduct,
} from "../services/product.service";

import {
  ImagePlus,
  X,
} from "lucide-react";

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

  const [categories, setCategories] =
    useState<
      { _id: string; name: string }[]
    >([]);

  const [warehouses, setWarehouses] =
    useState<
      { _id: string; name: string }[]
    >([]);

  const [image, setImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  /* ============================================================
     LOAD PRODUCT INTO FORM
  ============================================================ */

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

  /* ============================================================
     LOAD CATEGORIES + WAREHOUSES
  ============================================================ */

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        const [
          categoriesData,
          warehousesData,
        ] = await Promise.all([
          getCategories(),
          getWarehouses(),
        ]);

        setCategories(
          categoriesData
        );

        setWarehouses(
          warehousesData
        );
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [open]);

  /* ============================================================
     FORM CHANGE
  ============================================================ */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setForm((current) => ({
      ...current,
      [e.target.name]:
        e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    }));
  };

  /* ============================================================
     IMAGE CHANGE
  ============================================================ */

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setImage(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  /* ============================================================
     UPDATE PRODUCT
  ============================================================ */

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
        alert(
          "Please fill all required fields."
        );
        return;
      }

      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "name",
        form.name
      );

      formData.append(
        "type",
        form.type
      );

      formData.append(
        "sku",
        form.sku
      );

      formData.append(
        "category",
        form.category
      );

      formData.append(
        "warehouse",
        form.warehouse
      );

      formData.append(
        "unit",
        form.unit
      );

      formData.append(
        "minimumStock",
        String(
          form.minimumStock
        )
      );

      formData.append(
        "currentStock",
        String(
          form.currentStock
        )
      );

      if (image) {
        formData.append(
          "image",
          image
        );
      }

      await updateProduct(
        product._id,
        formData
      );

      onSuccess();
      onClose();

      setImage(null);
      setPreview("");
    } catch (error) {
      console.error(error);

      alert(
        "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     RESET + CLOSE
  ============================================================ */

  const handleClose = () => {
    if (saving) return;

    if (product) {
      setForm({
        name: product.name,
        type: product.type,
        sku: product.sku,
        category: product.category._id,
        warehouse: product.warehouse._id,
        unit: product.unit,
        minimumStock:
          product.minimumStock,
        currentStock:
          product.currentStock,
      });

      setPreview(
        product.image || ""
      );

      setImage(null);
    }

    onClose();
  };

  if (!open || !product) {
    return null;
  }

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
        p-3
        backdrop-blur-[2px]
        sm:p-5
      "
    >
      <div
        className="
          flex
          max-h-[calc(100vh-24px)]
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-[0_20px_60px_rgba(15,23,42,0.18)]
          sm:max-h-[calc(100vh-40px)]
          sm:rounded-3xl
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            flex
            shrink-0
            items-start
            justify-between
            border-b
            border-slate-100
            px-4
            py-4
            sm:px-6
            sm:py-5
            lg:px-7
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.1em]
                text-[#17357A]
              "
            >
              Inventory
            </p>

            <h2
              className="
                mt-1
                text-lg
                font-bold
                tracking-tight
                text-slate-900
                sm:text-xl
              "
            >
              Edit Product
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
                sm:text-sm
              "
            >
              Update product information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            aria-label="Close modal"
            className="
              ml-3
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* =====================================================
            BODY
        ===================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-4
            py-5
            sm:px-6
            sm:py-6
            lg:px-7
          "
        >
          <div className="space-y-6">

            {/* =================================================
                PRODUCT IMAGE
            ================================================= */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-semibold
                  text-slate-700
                "
              >
                Product Image
              </label>

              <label
                className="
                  flex
                  min-h-[160px]
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-300
                  bg-slate-50/60
                  transition
                  hover:border-[#17357A]/40
                  hover:bg-slate-50
                "
              >
                {preview ? (
                  <div
                    className="
                      relative
                      min-h-[160px]
                      w-full
                    "
                  >
                    <img
                      src={preview}
                      alt="Product preview"
                      className="
                        h-[160px]
                        w-full
                        object-contain
                        p-4
                      "
                    />

                    <span
                      className="
                        absolute
                        right-3
                        top-3
                        rounded-lg
                        bg-white/90
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        text-slate-600
                        shadow-sm
                      "
                    >
                      Change image
                    </span>
                  </div>
                ) : (
                  <>
                    <span
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        text-[#17357A]
                        shadow-sm
                      "
                    >
                      <ImagePlus
                        size={20}
                      />
                    </span>

                    <p
                      className="
                        mt-3
                        text-sm
                        font-semibold
                        text-slate-700
                      "
                    >
                      Upload product image
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-400
                      "
                    >
                      PNG, JPG or WEBP
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handleImageChange
                  }
                />
              </label>
            </div>

            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div>
              <div
                className="
                  mb-3
                  flex
                  items-center
                  gap-2
                "
              >
                <div
                  className="
                    h-5
                    w-1
                    rounded-full
                    bg-[#17357A]
                  "
                />

                <h3
                  className="
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  Product Information
                </h3>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >
                {/* PRODUCT NAME */}

                <FormField
                  label="Product Name"
                  required
                >
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </FormField>

                {/* SKU */}

                <FormField
                  label="SKU"
                  required
                >
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </FormField>

                {/* PRODUCT TYPE */}

                <FormField
                  label="Product Type"
                  required
                >
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="RAW">
                      Raw Material
                    </option>

                    <option value="FINISHED">
                      Finished Product
                    </option>
                  </select>
                </FormField>

                {/* UNIT */}

                <FormField label="Unit">
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="PCS">
                      PCS
                    </option>

                    <option value="BOX">
                      BOX
                    </option>

                    <option value="SET">
                      SET
                    </option>

                    <option value="KG">
                      KG
                    </option>
                  </select>
                </FormField>

                {/* CATEGORY */}

                <FormField
                  label="Category"
                  required
                >
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category._id
                          }
                          value={
                            category._id
                          }
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </FormField>

                {/* WAREHOUSE */}

                <FormField
                  label="Warehouse"
                  required
                >
                  <select
                    name="warehouse"
                    value={form.warehouse}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">
                      Select Warehouse
                    </option>

                    {warehouses.map(
                      (warehouse) => (
                        <option
                          key={
                            warehouse._id
                          }
                          value={
                            warehouse._id
                          }
                        >
                          {warehouse.name}
                        </option>
                      )
                    )}
                  </select>
                </FormField>
              </div>
            </div>

            {/* =================================================
                STOCK
            ================================================= */}

            <div>
              <div
                className="
                  mb-3
                  flex
                  items-center
                  gap-2
                "
              >
                <div
                  className="
                    h-5
                    w-1
                    rounded-full
                    bg-[#FF8A1F]
                  "
                />

                <h3
                  className="
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  Stock Configuration
                </h3>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >
                <FormField label="Minimum Stock">
                  <input
                    type="number"
                    min="0"
                    name="minimumStock"
                    value={
                      form.minimumStock
                    }
                    onChange={handleChange}
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Current Stock">
                  <input
                    type="number"
                    min="0"
                    name="currentStock"
                    value={
                      form.currentStock
                    }
                    onChange={handleChange}
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div
          className="
            flex
            shrink-0
            flex-col-reverse
            gap-2
            border-t
            border-slate-100
            bg-slate-50/60
            px-4
            py-3
            sm:flex-row
            sm:items-center
            sm:justify-end
            sm:px-6
            sm:py-4
            lg:px-7
          "
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
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
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:w-auto
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="
              h-10
              w-full
              rounded-xl
              bg-[#17357A]
              px-5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#10295d]
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:w-auto
            "
          >
            {saving
              ? "Updating..."
              : "Update Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   FORM HELPERS
================================================================ */

const inputClass = `
  h-11
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-3.5
  text-sm
  font-medium
  text-slate-700
  outline-none
  transition
  placeholder:text-slate-400
  hover:border-slate-300
  focus:border-[#17357A]
  focus:ring-2
  focus:ring-[#17357A]/10
`;

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField = ({
  label,
  required,
  children,
}: FormFieldProps) => {
  return (
    <div className="min-w-0">
      <label
        className="
          mb-1.5
          block
          text-xs
          font-semibold
          text-slate-600
        "
      >
        {label}

        {required && (
          <span className="ml-0.5 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
};

export default EditProductModal;