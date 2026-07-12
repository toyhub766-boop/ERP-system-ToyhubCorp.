import { useState } from "react";
import { X } from "lucide-react";

import { createCategory } from "../../categories/services/category.service";

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCategoryModal = ({
  open,
  onClose,
  onSuccess,
}: AddCategoryModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      await createCategory({
        name,
        description,
      });

      setName("");
      setDescription("");

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create category");
    }
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

    <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            Add Category
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create a new inventory category.
          </p>

        </div>

        <button
          onClick={onClose}
          className="rounded-xl p-2 transition hover:bg-slate-100"
        >
          <X size={22} />
        </button>

      </div>

      {/* Body */}

      <div className="space-y-5 p-6">

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            className="
              w-full
              rounded-2xl
              border
              border-slate-200
              px-4
              py-3
              outline-none
              transition
              focus:border-[#17357A]
            "
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a short description..."
            className="
              w-full
              resize-none
              rounded-2xl
              border
              border-slate-200
              px-4
              py-3
              outline-none
              transition
              focus:border-[#17357A]
            "
          />

        </div>

      </div>

      {/* Footer */}

      <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">

        <button
          onClick={() => {
            setName("");
            setDescription("");
            onClose();
          }}
          className="
            rounded-xl
            border
            border-slate-200
            px-6
            py-3
            font-medium
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
            px-6
            py-3
            font-semibold
            text-white
            transition
            hover:bg-[#21479f]
          "
        >
          Save Category
        </button>

      </div>

    </div>

  </div>
);
};

export default AddCategoryModal;