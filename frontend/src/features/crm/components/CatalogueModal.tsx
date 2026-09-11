import { useEffect, useState } from "react";
import {
  createCatalogue,
  updateCatalogue,
} from "../services/catalogue.service";

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
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(catalogue);

  useEffect(() => {
    if (!open) return;

    setName(catalogue?.name || "");
    setDescription(catalogue?.description || "");
    setCategory(catalogue?.category || "");
    setPrice(
      catalogue?.price !== undefined &&
        catalogue?.price !== null
        ? String(catalogue.price)
        : ""
    );
    setUnit(catalogue?.unit || "");
    setIsActive(catalogue?.isActive ?? true);

    setImage(null);
    setPreview(catalogue?.image || "");
  }, [open, catalogue]);

  if (!open) return null;

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Product name is required.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("description", description);
      formData.append("category", category);
      formData.append("unit", unit);
      formData.append("isActive", String(isActive));

      if (price !== "") {
        formData.append("price", price);
      }

      if (image) {
        formData.append("image", image);
      }

      if (isEditing) {
        await updateCatalogue(
          catalogue._id,
          formData
        );
      } else {
        await createCatalogue(formData);
      }

      onSaved();
      onClose();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to save catalogue product."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
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
          {/* Image */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Product Photograph
            </label>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border bg-slate-50 sm:w-40">
                {preview ? (
                  <img
                    src={preview}
                    alt={name || "Product preview"}
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
                  onChange={handleImageChange}
                  className="block w-full rounded-lg border p-2 text-sm"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Upload a clear product photograph.
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
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

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Category
            </label>

            <input
              type="text"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              placeholder="e.g. Toys, Games, Educational"
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe the product..."
              rows={4}
              className="w-full resize-none rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          {/* Price + Unit */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Price
              </label>

              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
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
                  setUnit(e.target.value)
                }
                placeholder="e.g. piece, set, box"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Active */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-slate-50 p-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) =>
                setIsActive(e.target.checked)
              }
              className="h-4 w-4"
            />

            <div>
              <p className="text-sm font-semibold">
                Active Product
              </p>

              <p className="text-xs text-slate-500">
                Inactive products can be hidden from the
                catalogue.
              </p>
            </div>
          </label>

          {/* Actions */}
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