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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl w-[420px] p-6">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Add Category
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="space-y-4">

          <input
            value={name}
            onChange={(e)=>
              setName(e.target.value)
            }
            placeholder="Category Name"
            className="w-full border rounded-xl px-4 py-3"
          />

          <textarea
            value={description}
            onChange={(e)=>
              setDescription(e.target.value)
            }
            placeholder="Description"
            className="w-full border rounded-xl px-4 py-3 h-24"
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="border rounded-xl px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-[#17357A] text-white rounded-xl px-5 py-2"
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
};

export default AddCategoryModal;