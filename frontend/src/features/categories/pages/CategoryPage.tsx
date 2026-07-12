import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../app/layouts/AdminLayout";

import PageHeader from "../../../components/ui/PageHeader";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/category.service";
import StatCard from "../../../components/ui/StatCard";
import SectionCard from "../../../components/ui/SectionCard";

type Category = {
  _id: string;
  name: string;
  description: string;
  status: string;
};

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [newCategory, setNewCategory] =
    useState({
      name: "",
      description: "",
      status: "ACTIVE",
    });

  const fetchCategories = async () => {
    try {
      const data =
        await getCategories();

      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories =
    useMemo(() => {

        return categories.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          category.description
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }, [categories, search]);

          return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <PageHeader
      title="Category Management"
      subtitle="Create and organize product categories used across your inventory."
    />
  </div>

  <button
    onClick={() => {
      setEditingCategory(null);
      setShowModal(true);
    }}
    className="
      inline-flex
      items-center
      justify-center
      rounded-xl
      bg-[#172B6B]
      px-5
      py-3
      text-sm
      font-semibold
      text-white
      shadow-sm
      transition
      hover:bg-[#20398F]
      w-full
      sm:w-auto
    "
  >
    + Add Category
  </button>
</div>


      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

  <StatCard
    title="Total Categories"
    value={categories.length}
  />

  <StatCard
    title="Active"
    value={
      categories.filter(
        (c) => c.status === "ACTIVE"
      ).length
    }
  />

  <StatCard
    title="Inactive"
    value={
      categories.filter(
        (c) => c.status === "INACTIVE"
      ).length
    }
  />

  <StatCard
    title="Search Results"
    value={filteredCategories.length}
  />

</div>

      {/* Search */}
      <SectionCard>

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    <div>

      <h3 className="text-base font-semibold text-slate-900">
        Categories
      </h3>

      <p className="text-sm text-slate-500 mt-1">
        Search and manage product categories.
      </p>

    </div>

    <input
      type="text"
      placeholder="Search category..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="
        w-full
        md:w-80
        h-11
        rounded-xl
        border
        border-slate-300
        bg-white
        px-4
        text-sm
        outline-none
        transition

        focus:border-orange-500
        focus:ring-4
        focus:ring-orange-100
      "
    />

  </div>

</SectionCard>

            {/* Table */}
      <SectionCard className="overflow-hidden">

<div className="overflow-x-auto">

<table className="w-full min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4">
                  Category
                </th>

                <th className="text-left px-6 py-4">
                  Description
                </th>

                <th className="text-left px-6 py-4">
                  Status
                </th>

                <th className="text-right px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map(
                (category) => (
                  <tr
                    key={category._id}
                    className="
border-b
border-slate-100

hover:bg-slate-50

transition-colors
"
                  >
                    <td className="px-6 py-4 font-medium">
                      {category.name}
                    </td>

                    <td className="px-6 py-4">
                      {category.description}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          category.status ===
                          "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {category.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setEditingCategory(
                              category
                            );

                            setNewCategory({
                              name: category.name,
                              description:
                                category.description,
                              status:
                                category.status,
                            });

                            setShowModal(true);
                          }}
                        >
                          Edit
                        </button>

                        <button className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                          onClick={async () => {
                            if (
                              window.confirm(
                                `Delete ${category.name}?`
                              )
                            ) {
                              try {
                                await deleteCategory(
                                  category._id
                                );

                                fetchCategories();
                              } catch (
                                error
                              ) {
                                console.log(
                                  error
                                );
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

        {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

    <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-200 px-7 py-5">

        <div>

          <h2 className="text-xl font-bold text-slate-900">
            {editingCategory ? "Edit Category" : "New Category"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Fill in the details below.
          </p>

        </div>

        <button
          onClick={() => setShowModal(false)}
          className="
          h-10
          w-10
          rounded-xl
          hover:bg-slate-100
          transition
        "
        >
          ✕
        </button>

      </div>

      {/* Body */}

      <div className="space-y-6 p-7">

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category Name *
          </label>

          <input
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({
                ...newCategory,
                name: e.target.value,
              })
            }
            placeholder="Electronics"
            className="
            h-11
            w-full
            rounded-xl
            border
            border-slate-300
            px-4
            text-sm
            outline-none

            focus:border-orange-500
            focus:ring-4
            focus:ring-orange-100
          "
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            rows={4}
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({
                ...newCategory,
                description: e.target.value,
              })
            }
            placeholder="Short description..."
            className="
            w-full
            rounded-xl
            border
            border-slate-300
            px-4
            py-3
            text-sm
            outline-none

            resize-none

            focus:border-orange-500
            focus:ring-4
            focus:ring-orange-100
          "
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            value={newCategory.status}
            onChange={(e) =>
              setNewCategory({
                ...newCategory,
                status: e.target.value,
              })
            }
            className="
            h-11
            w-full
            rounded-xl
            border
            border-slate-300
            px-4
            text-sm
            outline-none

            focus:border-orange-500
            focus:ring-4
            focus:ring-orange-100
          "
          >
            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>

          </select>

        </div>

      </div>

      {/* Footer */}

      <div className="flex justify-end gap-3 border-t border-slate-200 px-7 py-5">

        <button
          onClick={() => setShowModal(false)}
          className="
          rounded-xl
          border
          border-slate-300
          px-5
          py-2.5
          text-sm
          font-medium

          hover:bg-slate-50
        "
        >
          Cancel
        </button>

        <button
  onClick={async () => {
    try {
      if (editingCategory) {
        await updateCategory(
          editingCategory._id,
          newCategory
        );
      } else {
        await createCategory(newCategory);
      }

      await fetchCategories();

      setShowModal(false);

      setEditingCategory(null);

      setNewCategory({
        name: "",
        description: "",
        status: "ACTIVE",
      });
    } catch (error) {
      console.error(error);
    }
  }}
  className="
    rounded-xl
    bg-orange-500
    px-5
    py-2.5
    text-sm
    font-semibold
    text-white
    shadow-sm
    hover:bg-orange-600
    transition-colors
  "
>
  {editingCategory ? "Update Category" : "Create Category"}
</button>

      </div>

    </div>

  </div>
)}
    </AdminLayout>
  );
};

export default CategoryPage;

      