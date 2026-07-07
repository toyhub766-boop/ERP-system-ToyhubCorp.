import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../app/layouts/AdminLayout";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/category.service";

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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Category Management
          </h1>

          <p className="text-slate-500 mt-2">
            Manage product categories for inventory.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);

            setNewCategory({
              name: "",
              description: "",
              status: "ACTIVE",
            });

            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-medium shadow-sm"
        >
          + Add Category
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="bg-white border rounded-2xl p-5">
          <p className="text-slate-500 text-sm">
            Total Categories
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {categories.length}
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p className="text-slate-500 text-sm">
            Active Categories
          </p>

          <h2 className="text-3xl font-bold mt-2 text-green-600">
            {
              categories.filter(
                (c) => c.status === "ACTIVE"
              ).length
            }
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border rounded-2xl p-5 mb-6">
        <input
          type="text"
          placeholder="Search category..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full md:w-80 px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-orange-500"
        />
      </div>

            {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
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
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="px-6 py-5 font-medium">
                      {category.name}
                    </td>

                    <td className="px-6 py-5">
                      {category.description}
                    </td>

                    <td className="px-6 py-5">
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

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">
                        <button
                          className="text-blue-600 hover:text-blue-800"
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

                        <button
                          className="text-red-600 hover:text-red-800"
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
      </div>

            {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingCategory
                  ? "Edit Category"
                  : "Add Category"}
              </h2>

              <button
                onClick={() =>
                  setShowModal(false)
                }
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    name: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <textarea
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description:
                      e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <select
                value={newCategory.status}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    status:
                      e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="ACTIVE">
                  ACTIVE
                </option>

                <option value="INACTIVE">
                  INACTIVE
                </option>
              </select>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="px-5 py-3 border rounded-xl"
                >
                  Cancel
                </button>

                <button
                  className="px-5 py-3 bg-orange-500 text-white rounded-xl"
                  onClick={async () => {
                    try {
                      if (
                        editingCategory
                      ) {
                        await updateCategory(
                          editingCategory._id,
                          newCategory
                        );
                      } else {
                        await createCategory(
                          newCategory
                        );
                      }

                      await fetchCategories();

                      setShowModal(false);

                      setEditingCategory(
                        null
                      );

                      setNewCategory({
                        name: "",
                        description: "",
                        status:
                          "ACTIVE",
                      });
                    } catch (error) {
                      console.error(
                        error
                      );
                    }
                  }}
                >
                  {editingCategory
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default CategoryPage;

      