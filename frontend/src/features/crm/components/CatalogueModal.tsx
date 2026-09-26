import { useEffect, useState } from "react";

import {
  createCatalogue,
  updateCatalogue,
} from "../services/catalogue.service";

import { getBOMs } from "../../bom/services/bom.service";

interface CatalogueModalProps {
  open: boolean;
  catalogue?: any;
  onClose: () => void;
  onSaved: () => void;
}

const CatalogueModal = ({
  open,
  catalogue,
  onClose,
  onSaved,
}: CatalogueModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [marka, setMarka] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [moq, setMoq] = useState("1");

  const [productType, setProductType] = useState<
    "TRADING" | "MANUFACTURING"
  >("TRADING");

  const [bom, setBom] = useState("");
  const [boms, setBoms] = useState<any[]>([]);
  const [loadingBOMs, setLoadingBOMs] = useState(false);

  const [isActive, setIsActive] = useState(true);

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(catalogue);

  /*
   * LOAD BOMs
   */
  useEffect(() => {
    if (!open) return;

    const loadBOMs = async () => {
      try {
        setLoadingBOMs(true);

        const data = await getBOMs();

        setBoms(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load BOMs:",
          error
        );

        setBoms([]);
      } finally {
        setLoadingBOMs(false);
      }
    };

    loadBOMs();
  }, [open]);

  /*
   * LOAD / RESET FORM
   */
  useEffect(() => {
    if (!open) return;

    setName(catalogue?.name || "");
    setDescription(catalogue?.description || "");
    setCategory(catalogue?.category || "");
    setModelNumber(catalogue?.modelNumber || "");
    setMarka(catalogue?.marka || "");

    setPrice(
      catalogue?.price !== undefined &&
        catalogue?.price !== null
        ? String(catalogue.price)
        : ""
    );

    setUnit(catalogue?.unit || "");

    setMoq(
      catalogue?.moq !== undefined &&
        catalogue?.moq !== null
        ? String(catalogue.moq)
        : "1"
    );

    /*
     * Product type is authoritative.
     *
     * Manufacturing products can exist
     * with or without BOM.
     */
    if (catalogue?.productType) {
      setProductType(
        catalogue.productType
      );

      if (
        catalogue.productType ===
        "MANUFACTURING"
      ) {
        if (catalogue?.bom?._id) {
          setBom(catalogue.bom._id);
        } else if (catalogue?.bom) {
          setBom(catalogue.bom);
        } else {
          setBom("");
        }
      } else {
        setBom("");
      }
    } else {
      /*
       * Backward compatibility for
       * older records.
       */
      if (catalogue?.bom?._id) {
        setProductType("MANUFACTURING");
        setBom(catalogue.bom._id);
      } else if (catalogue?.bom) {
        setProductType("MANUFACTURING");
        setBom(catalogue.bom);
      } else {
        setProductType("TRADING");
        setBom("");
      }
    }

    setIsActive(
      catalogue?.isActive ?? true
    );

    setImage(null);
    setPreview(
      catalogue?.image || ""
    );
  }, [open, catalogue]);

  if (!open) return null;

  /*
   * IMAGE
   */
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

  /*
   * PRODUCT TYPE
   */
  const handleProductTypeChange = (
    type:
      | "TRADING"
      | "MANUFACTURING"
  ) => {
    setProductType(type);

    // Trading products cannot have a BOM.
    if (type === "TRADING") {
      setBom("");
    }
  };

  /*
   * SUBMIT
   */
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      alert(
        "Product name is required."
      );
      return;
    }

    const parsedMOQ = Number(moq);

    if (
      !Number.isInteger(parsedMOQ) ||
      parsedMOQ < 1
    ) {
      alert(
        "MOQ must be a positive whole number."
      );
      return;
    }

    /*
     * Manufacturing products do NOT
     * require a BOM.
     */

    try {
      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "name",
        name.trim()
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "category",
        category
      );

      formData.append(
        "modelNumber",
        modelNumber
      );

      formData.append(
        "marka",
        marka
      );

      formData.append(
        "unit",
        unit
      );

      formData.append(
        "moq",
        String(parsedMOQ)
      );

      formData.append(
        "productType",
        productType
      );

      formData.append(
        "isActive",
        String(isActive)
      );

      /*
       * Manufacturing:
       *   selected BOM → send BOM ID
       *   no BOM        → empty string
       *
       * Trading:
       *   always empty BOM
       */
      formData.append(
        "bom",
        productType ===
          "MANUFACTURING"
          ? bom
          : ""
      );

      if (price !== "") {
        formData.append(
          "price",
          price
        );
      }

      if (image) {
        formData.append(
          "image",
          image
        );
      }

      if (isEditing) {
        await updateCatalogue(
          catalogue._id,
          formData
        );
      } else {
        await createCatalogue(
          formData
        );
      }

      onSaved();
      onClose();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data
          ?.message ||
          "Failed to save catalogue product."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEditing
                ? "Edit Catalogue Product"
                : "Add Catalogue Product"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add the product information and photograph.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >

          {/* IMAGE */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Product Photograph
            </label>

            <div className="flex flex-col gap-4 sm:flex-row">

              <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border bg-slate-50 sm:w-40">
                {preview ? (
                  <img
                    src={preview}
                    alt={
                      name ||
                      "Product preview"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-4 text-center text-sm text-slate-400">
                    No photograph
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-center">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  className="block w-full rounded-lg border p-2 text-sm"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Upload a clear product photograph.
                </p>
              </div>

            </div>
          </div>

          {/* NAME */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Product Name *
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter product name"
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* MODEL NUMBER + MARKA */}
          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Model Number
              </label>

              <input
                type="text"
                value={modelNumber}
                onChange={(e) =>
                  setModelNumber(
                    e.target.value
                  )
                }
                placeholder="Enter model number"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Marka / Mark
              </label>

              <input
                type="text"
                value={marka}
                onChange={(e) =>
                  setMarka(
                    e.target.value
                  )
                }
                placeholder="Enter marka / mark"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {/* PRODUCT TYPE */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Product Type *
            </label>

            <div className="grid gap-3 sm:grid-cols-2">

              {/* TRADING */}
              <button
                type="button"
                onClick={() =>
                  handleProductTypeChange(
                    "TRADING"
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  productType ===
                  "TRADING"
                    ? "border-[#17357A] bg-blue-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-bold text-slate-900">
                  Trading Product
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Product is purchased or resold and does not use a BOM.
                </p>
              </button>

              {/* MANUFACTURING */}
              <button
                type="button"
                onClick={() =>
                  handleProductTypeChange(
                    "MANUFACTURING"
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  productType ===
                  "MANUFACTURING"
                    ? "border-[#17357A] bg-blue-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-bold text-slate-900">
                  Manufacturing Product
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Product is manufactured. A BOM can be linked if maintained in the system.
                </p>
              </button>

            </div>
          </div>

          {/* BOM */}
          {productType ===
            "MANUFACTURING" && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Bill of Materials

                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <select
                value={bom}
                onChange={(e) =>
                  setBom(
                    e.target.value
                  )
                }
                disabled={
                  loadingBOMs
                }
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingBOMs
                    ? "Loading BOMs..."
                    : "No BOM / Select BOM"}
                </option>

                {boms.map(
                  (item) => (
                    <option
                      key={
                        item._id
                      }
                      value={
                        item._id
                      }
                    >
                      {item
                        .finishedProduct
                        ?.name ||
                        "Unnamed BOM"}
                    </option>
                  )
                )}
              </select>

              <p className="mt-1.5 text-xs text-slate-500">
                Leave empty if this manufacturing product does not have a BOM maintained in the ERP.
              </p>
            </div>
          )}

          {/* CATEGORY */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Category
            </label>

            <input
              type="text"
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              placeholder="e.g. Toys, Games, Educational"
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Describe the product..."
              rows={4}
              className="w-full resize-none rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          {/* PRICE + UNIT + MOQ */}
          <div className="grid gap-4 sm:grid-cols-3">

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Price
              </label>

              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                placeholder="Optional"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Unit
              </label>

              <input
                type="text"
                value={unit}
                onChange={(e) =>
                  setUnit(
                    e.target.value
                  )
                }
                placeholder="e.g. piece, set, box"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                MOQ
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={moq}
                onChange={(e) =>
                  setMoq(
                    e.target.value
                  )
                }
                placeholder="e.g. 12"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
              />

              <p className="mt-1 text-xs text-slate-500">
                Minimum order quantity
              </p>
            </div>

          </div>

          {/* ACTIVE */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-slate-50 p-3">

            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) =>
                setIsActive(
                  e.target.checked
                )
              }
              className="h-4 w-4"
            />

            <div>
              <p className="text-sm font-semibold">
                Active Product
              </p>

              <p className="text-xs text-slate-500">
                Inactive products can be hidden from the catalogue.
              </p>
            </div>

          </label>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#17357A] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : isEditing
                ? "Update Product"
                : "Add Product"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default CatalogueModal;