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

  const handleClose = () => {
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        p-3
        backdrop-blur-[1px]
        sm:p-5
        lg:p-6
      "
    >
      <div
        className="
          flex
          max-h-[calc(100vh-24px)]
          w-full
          max-w-lg
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
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
            border-slate-200
            px-4
            py-4
            sm:px-6
            sm:py-5
          "
        >
          <div className="min-w-0 pr-3">
            <h2
              className="
                text-lg
                font-bold
                tracking-tight
                text-slate-900
                sm:text-2xl
              "
            >
              Add Category
            </h2>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-slate-400
                sm:text-sm
                sm:text-slate-500
              "
            >
              Create a new inventory category.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="
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
              active:scale-95
            "
          >
            <X size={19} />
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
            p-4
            sm:p-6
          "
        >
          <div className="space-y-5">
            {/* CATEGORY NAME */}

            <div>
              <label
                htmlFor="category-name"
                className="
                  mb-2
                  block
                  text-xs
                  font-semibold
                  text-slate-700
                  sm:text-sm
                "
              >
                Category Name
              </label>

              <input
                id="category-name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter category name"
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  hover:border-slate-300
                  focus:border-[#17357A]
                  focus:ring-2
                  focus:ring-[#17357A]/10
                  sm:h-12
                  sm:rounded-2xl
                  sm:px-4
                "
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label
                htmlFor="category-description"
                className="
                  mb-2
                  block
                  text-xs
                  font-semibold
                  text-slate-700
                  sm:text-sm
                "
              >
                Description
              </label>

              <textarea
                id="category-description"
                rows={5}
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Write a short description..."
                className="
                  min-h-[120px]
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  py-3
                  text-sm
                  leading-5
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  hover:border-slate-300
                  focus:border-[#17357A]
                  focus:ring-2
                  focus:ring-[#17357A]/10
                  sm:rounded-2xl
                  sm:px-4
                "
              />
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
            border-slate-200
            bg-slate-50/60
            px-4
            py-3
            sm:flex-row
            sm:justify-end
            sm:px-6
            sm:py-5
          "
        >
          <button
            type="button"
            onClick={handleClose}
            className="
              h-10
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              text-sm
              font-medium
              text-slate-700
              transition
              hover:bg-slate-100
              active:scale-[0.98]
              sm:h-11
              sm:w-auto
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="
              h-10
              w-full
              rounded-xl
              bg-[#17357A]
              px-5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#21479f]
              active:scale-[0.98]
              sm:h-11
              sm:w-auto
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