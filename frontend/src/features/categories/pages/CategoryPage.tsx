import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCheck,
  FiEdit3,
  FiFolder,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
  FiAlertTriangle,
  FiLayers,
  FiPower,
} from "react-icons/fi";

import AdminLayout from "../../../app/layouts/AdminLayout";

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

  /* =========================================================
     STATE
  ========================================================= */

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [categoryToDelete, setCategoryToDelete] =
    useState<Category | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [newCategory, setNewCategory] =
    useState({
      name: "",
      description: "",
      status: "ACTIVE",
    });


  /* =========================================================
     FETCH
  ========================================================= */

  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      const data =
        await getCategories();

      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchCategories();
  }, []);


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredCategories =
    useMemo(() => {

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return categories;
      }

      return categories.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(query) ||
          category.description
            .toLowerCase()
            .includes(query)
      );

    }, [categories, search]);


  /* =========================================================
     STATS
  ========================================================= */

  const activeCount =
    categories.filter(
      (category) =>
        category.status === "ACTIVE"
    ).length;

  const inactiveCount =
    categories.filter(
      (category) =>
        category.status === "INACTIVE"
    ).length;


  /* =========================================================
     MODAL
  ========================================================= */

  const openCreateModal = () => {

    setEditingCategory(null);

    setNewCategory({
      name: "",
      description: "",
      status: "ACTIVE",
    });

    setShowModal(true);
  };


  const openEditModal = (
    category: Category
  ) => {

    setEditingCategory(category);

    setNewCategory({
      name: category.name,
      description:
        category.description,
      status: category.status,
    });

    setShowModal(true);
  };


  const closeModal = () => {

    if (isSaving) return;

    setShowModal(false);

    setEditingCategory(null);

    setNewCategory({
      name: "",
      description: "",
      status: "ACTIVE",
    });
  };


  /* =========================================================
     SAVE
  ========================================================= */

  const handleSaveCategory = async () => {

    const name =
      newCategory.name.trim();

    if (!name) {
      return;
    }

    try {

      setIsSaving(true);

      if (editingCategory) {

        await updateCategory(
          editingCategory._id,
          {
            ...newCategory,
            name,
          }
        );

      } else {

        await createCategory({
          ...newCategory,
          name,
        });

      }

      await fetchCategories();

      closeModal();

    } catch (error) {

      console.error(error);

    } finally {

      setIsSaving(false);

    }
  };


  /* =========================================================
     DELETE
  ========================================================= */

  const openDeleteModal = (
    category: Category
  ) => {

    setCategoryToDelete(category);

    setShowDeleteModal(true);
  };


  const closeDeleteModal = () => {

    if (isDeleting) return;

    setShowDeleteModal(false);

    setCategoryToDelete(null);
  };


  const handleDelete = async () => {

    if (!categoryToDelete) return;

    try {

      setIsDeleting(true);

      await deleteCategory(
        categoryToDelete._id
      );

      await fetchCategories();

      closeDeleteModal();

    } catch (error) {

      console.error(error);

    } finally {

      setIsDeleting(false);

    }
  };


  /* =========================================================
     KEYBOARD
  ========================================================= */

  useEffect(() => {

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {

      if (
        event.key === "Escape"
      ) {

        if (showDeleteModal) {
          closeDeleteModal();
        } else if (showModal) {
          closeModal();
        }

      }

    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, [
    showModal,
    showDeleteModal,
    isSaving,
    isDeleting,
  ]);


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <AdminLayout>

      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          space-y-7
          px-1
          pb-10
        "
      >

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          <div>

            {/* Breadcrumb */}

            <div
              className="
                mb-3
                flex
                items-center
                gap-2
                text-xs
                font-medium
                text-slate-400
              "
            >
              <span>Admin</span>

              <span>/</span>

              <span className="text-slate-600">
                Categories
              </span>
            </div>


            <div
              className="
                flex
                items-start
                gap-4
              "
            >

              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#172B6B]
                  text-white
                  shadow-sm
                "
              >
                <FiLayers
                  size={21}
                />
              </div>


              <div>

                <h1
                  className="
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-900
                    sm:text-3xl
                  "
                >
                  Category Management
                </h1>

                <p
                  className="
                    mt-1.5
                    max-w-2xl
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Create and organize product
                  categories used across your
                  inventory.
                </p>

              </div>

            </div>

          </div>


          {/* ADD */}

          <button
            type="button"
            onClick={openCreateModal}
            className="
              inline-flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#172B6B]
              px-5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              hover:bg-[#20398F]
              hover:shadow-md
              active:scale-[0.98]
              sm:w-auto
            "
          >
            <FiPlus
              size={17}
              strokeWidth={2.5}
            />

            Add Category
          </button>

        </div>


        {/* =====================================================
            STATS
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-2
            gap-4
            lg:grid-cols-4
          "
        >

          <StatCard
            title="Total Categories"
            value={categories.length}
            icon={
              <FiLayers />
            }
          />

          <StatCard
            title="Active"
            value={activeCount}
            icon={
              <FiCheck />
            }
          />

          <StatCard
            title="Inactive"
            value={inactiveCount}
            icon={
              <FiPower />
            }
          />

          <StatCard
            title="Search Results"
            value={
              filteredCategories.length
            }
            icon={
              <FiSearch />
            }
          />

        </div>


        {/* =====================================================
            SEARCH
        ===================================================== */}

        <SectionCard>

          <div
            className="
              flex
              flex-col
              gap-4
              md:flex-row
              md:items-center
              md:justify-between
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <h2
                  className="
                    text-base
                    font-bold
                    text-slate-900
                  "
                >
                  Categories
                </h2>

                <span
                  className="
                    rounded-full
                    bg-slate-100
                    px-2
                    py-0.5
                    text-[11px]
                    font-semibold
                    text-slate-500
                  "
                >
                  {filteredCategories.length}
                </span>

              </div>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Search and manage product
                categories.
              </p>

            </div>


            <div
              className="
                relative
                w-full
                md:w-[340px]
              "
            >

              <FiSearch
                size={17}
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search categories..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-10
                  pr-10
                  text-sm
                  text-slate-800
                  outline-none
                  transition-all
                  placeholder:text-slate-400
                  focus:border-[#172B6B]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-50
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    h-6
                    w-6
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-400
                    transition
                    hover:bg-slate-200
                    hover:text-slate-700
                  "
                  aria-label="Clear search"
                >
                  <FiX size={14} />
                </button>
              )}

            </div>

          </div>

        </SectionCard>


        {/* =====================================================
            TABLE
        ===================================================== */}

        <SectionCard
          className="
            overflow-hidden
            p-0
          "
        >

          <div
            className="
              overflow-x-auto
            "
          >

            <table
              className="
                w-full
                min-w-[760px]
              "
            >

              <thead>

                <tr
                  className="
                    border-b
                    border-slate-200
                    bg-slate-50/80
                  "
                >

                  <th
                    className="
                      px-6
                      py-4
                      text-left
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    Category
                  </th>

                  <th
                    className="
                      px-6
                      py-4
                      text-left
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    Description
                  </th>

                  <th
                    className="
                      px-6
                      py-4
                      text-left
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    Status
                  </th>

                  <th
                    className="
                      px-6
                      py-4
                      text-right
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {isLoading ? (

                  Array.from({
                    length: 5,
                  }).map((_, index) => (

                    <tr
                      key={index}
                      className="
                        border-b
                        border-slate-100
                      "
                    >

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
                          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
                      </td>

                      <td className="px-6 py-5">
                        <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                      </td>

                      <td className="px-6 py-5">
                        <div className="ml-auto h-9 w-28 animate-pulse rounded-xl bg-slate-100" />
                      </td>

                    </tr>

                  ))

                ) : filteredCategories.length === 0 ? (

                  <tr>

                    <td
                      colSpan={4}
                      className="
                        px-6
                        py-20
                        text-center
                      "
                    >

                      <div
                        className="
                          mx-auto
                          flex
                          max-w-sm
                          flex-col
                          items-center
                        "
                      >

                        <div
                          className="
                            mb-4
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-slate-100
                            text-slate-400
                          "
                        >
                          {search ? (
                            <FiSearch
                              size={22}
                            />
                          ) : (
                            <FiFolder
                              size={22}
                            />
                          )}
                        </div>

                        <h3
                          className="
                            text-sm
                            font-bold
                            text-slate-800
                          "
                        >
                          {search
                            ? "No categories found"
                            : "No categories yet"}
                        </h3>

                        <p
                          className="
                            mt-1
                            text-sm
                            leading-6
                            text-slate-500
                          "
                        >
                          {search
                            ? "Try adjusting your search term."
                            : "Create your first category to start organizing inventory."}
                        </p>

                        {!search && (
                          <button
                            type="button"
                            onClick={
                              openCreateModal
                            }
                            className="
                              mt-5
                              inline-flex
                              items-center
                              gap-2
                              rounded-xl
                              bg-[#172B6B]
                              px-4
                              py-2.5
                              text-sm
                              font-semibold
                              text-white
                              transition
                              hover:bg-[#20398F]
                            "
                          >
                            <FiPlus
                              size={15}
                            />

                            Add Category
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ) : (

                  filteredCategories.map(
                    (category) => (

                      <tr
                        key={category._id}
                        className="
                          group
                          border-b
                          border-slate-100
                          transition-colors
                          last:border-0
                          hover:bg-slate-50/70
                        "
                      >

                        {/* CATEGORY */}

                        <td className="px-6 py-4">

                          <div
                            className="
                              flex
                              items-center
                              gap-3
                            "
                          >

                            <div
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-50
                                text-[#172B6B]
                              "
                            >
                              <FiFolder
                                size={16}
                              />
                            </div>

                            <div>

                              <p
                                className="
                                  text-sm
                                  font-semibold
                                  text-slate-900
                                "
                              >
                                {category.name}
                              </p>

                              <p
                                className="
                                  mt-0.5
                                  text-[11px]
                                  text-slate-400
                                "
                              >
                                Category
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* DESCRIPTION */}

                        <td className="max-w-md px-6 py-4">

                          <p
                            className="
                              truncate
                              text-sm
                              text-slate-500
                            "
                            title={
                              category.description
                            }
                          >
                            {category.description ||
                              "No description provided"}
                          </p>

                        </td>


                        {/* STATUS */}

                        <td className="px-6 py-4">

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              px-2.5
                              py-1
                              text-[11px]
                              font-bold
                              ${
                                category.status ===
                                "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }
                            `}
                          >

                            <span
                              className={`
                                h-1.5
                                w-1.5
                                rounded-full
                                ${
                                  category.status ===
                                  "ACTIVE"
                                    ? "bg-emerald-500"
                                    : "bg-slate-400"
                                }
                              `}
                            />

                            {category.status ===
                            "ACTIVE"
                              ? "Active"
                              : "Inactive"}

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-6 py-4">

                          <div
                            className="
                              flex
                              justify-end
                              gap-2
                            "
                          >

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  category
                                )
                              }
                              className="
                                inline-flex
                                h-9
                                items-center
                                gap-1.5
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-3
                                text-xs
                                font-semibold
                                text-slate-600
                                shadow-sm
                                transition
                                hover:border-blue-200
                                hover:bg-blue-50
                                hover:text-[#172B6B]
                              "
                            >
                              <FiEdit3
                                size={14}
                              />

                              Edit
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                openDeleteModal(
                                  category
                                )
                              }
                              className="
                                inline-flex
                                h-9
                                items-center
                                gap-1.5
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-3
                                text-xs
                                font-semibold
                                text-slate-500
                                shadow-sm
                                transition
                                hover:border-red-200
                                hover:bg-red-50
                                hover:text-red-600
                              "
                            >
                              <FiTrash2
                                size={14}
                              />

                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </SectionCard>

      </div>


      {/* =======================================================
          CREATE / EDIT MODAL
      ======================================================= */}

      {showModal && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/55
            p-4
            backdrop-blur-[3px]
            animate-in
            fade-in
            duration-200
          "
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div
            role="dialog"
            aria-modal="true"
            className="
              relative
              w-full
              max-w-lg
              overflow-hidden
              rounded-3xl
              border
              border-white/60
              bg-white
              shadow-[0_25px_80px_rgba(15,23,42,0.22)]
              animate-in
              zoom-in-95
              slide-in-from-bottom-2
              duration-200
            "
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-start
                justify-between
                border-b
                border-slate-100
                px-6
                py-5
                sm:px-7
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-[#172B6B]
                  "
                >
                  {editingCategory ? (
                    <FiEdit3
                      size={18}
                    />
                  ) : (
                    <FiPlus
                      size={19}
                    />
                  )}
                </div>


                <div>

                  <h2
                    className="
                      text-lg
                      font-bold
                      text-slate-900
                    "
                  >
                    {editingCategory
                      ? "Edit Category"
                      : "Create Category"}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    {editingCategory
                      ? "Update the category information below."
                      : "Add a new category to your inventory system."}
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
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
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                aria-label="Close modal"
              >
                <FiX
                  size={19}
                />
              </button>

            </div>


            {/* MODAL BODY */}

            <div
              className="
                space-y-5
                px-6
                py-6
                sm:px-7
              "
            >

              {/* NAME */}

              <div>

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Category Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  autoFocus
                  value={
                    newCategory.name
                  }
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      name:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. Electronics"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-3.5
                    text-sm
                    text-slate-800
                    outline-none
                    transition-all
                    placeholder:text-slate-400
                    focus:border-[#172B6B]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-50
                  "
                />

                <p
                  className="
                    mt-1.5
                    text-[11px]
                    text-slate-400
                  "
                >
                  Use a clear name that
                  identifies this product group.
                </p>

              </div>


              {/* DESCRIPTION */}

              <div>

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Description
                </label>

                <textarea
                  rows={4}
                  value={
                    newCategory.description
                  }
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Describe what products belong to this category..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-3.5
                    py-3
                    text-sm
                    leading-6
                    text-slate-800
                    outline-none
                    transition-all
                    placeholder:text-slate-400
                    focus:border-[#172B6B]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-50
                  "
                />

              </div>


              {/* STATUS */}

              <div>

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Status
                </label>

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-2
                  "
                >

                  {/* ACTIVE */}

                  <button
                    type="button"
                    onClick={() =>
                      setNewCategory({
                        ...newCategory,
                        status:
                          "ACTIVE",
                      })
                    }
                    className={`
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      p-3
                      text-left
                      transition-all
                      ${
                        newCategory.status ===
                        "ACTIVE"
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }
                    `}
                  >

                    <div
                      className={`
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        ${
                          newCategory.status ===
                          "ACTIVE"
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-400"
                        }
                      `}
                    >
                      <FiCheck
                        size={15}
                      />
                    </div>

                    <div>

                      <p
                        className="
                          text-xs
                          font-bold
                          text-slate-800
                        "
                      >
                        Active
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          text-slate-400
                        "
                      >
                        Available
                      </p>

                    </div>

                  </button>


                  {/* INACTIVE */}

                  <button
                    type="button"
                    onClick={() =>
                      setNewCategory({
                        ...newCategory,
                        status:
                          "INACTIVE",
                      })
                    }
                    className={`
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      p-3
                      text-left
                      transition-all
                      ${
                        newCategory.status ===
                        "INACTIVE"
                          ? "border-slate-300 bg-slate-100"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }
                    `}
                  >

                    <div
                      className={`
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        ${
                          newCategory.status ===
                          "INACTIVE"
                            ? "bg-slate-500 text-white"
                            : "bg-slate-100 text-slate-400"
                        }
                      `}
                    >
                      <FiPower
                        size={15}
                      />
                    </div>

                    <div>

                      <p
                        className="
                          text-xs
                          font-bold
                          text-slate-800
                        "
                      >
                        Inactive
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          text-slate-400
                        "
                      >
                        Disabled
                      </p>

                    </div>

                  </button>

                </div>

              </div>

            </div>


            {/* MODAL FOOTER */}

            <div
              className="
                flex
                flex-col-reverse
                gap-2
                border-t
                border-slate-100
                bg-slate-50/70
                px-6
                py-4
                sm:flex-row
                sm:justify-end
                sm:px-7
              "
            >

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="
                  h-10
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={
                  handleSaveCategory
                }
                disabled={
                  isSaving ||
                  !newCategory.name.trim()
                }
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#172B6B]
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-[#20398F]
                  hover:shadow-md
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {isSaving ? (

                  <>
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                      "
                    />

                    Saving...
                  </>

                ) : (

                  <>
                    {editingCategory ? (
                      <FiCheck
                        size={16}
                      />
                    ) : (
                      <FiPlus
                        size={16}
                      />
                    )}

                    {editingCategory
                      ? "Update Category"
                      : "Create Category"}
                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =======================================================
          DELETE CONFIRMATION MODAL
      ======================================================= */}

      {showDeleteModal &&
        categoryToDelete && (

          <div
            className="
              fixed
              inset-0
              z-[110]
              flex
              items-center
              justify-center
              bg-slate-950/55
              p-4
              backdrop-blur-[3px]
              animate-in
              fade-in
              duration-200
            "
            onMouseDown={(event) => {

              if (
                event.target ===
                event.currentTarget
              ) {
                closeDeleteModal();
              }

            }}
          >

            <div
              role="alertdialog"
              aria-modal="true"
              className="
                w-full
                max-w-md
                overflow-hidden
                rounded-3xl
                bg-white
                shadow-[0_25px_80px_rgba(15,23,42,0.22)]
                animate-in
                zoom-in-95
                duration-200
              "
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >

              <div
                className="
                  px-6
                  pt-7
                  sm:px-7
                "
              >

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-red-50
                    text-red-600
                  "
                >
                  <FiAlertTriangle
                    size={22}
                  />
                </div>


                <h2
                  className="
                    mt-5
                    text-lg
                    font-bold
                    text-slate-900
                  "
                >
                  Delete category?
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  You're about to delete{" "}
                  <span
                    className="
                      font-semibold
                      text-slate-800
                    "
                  >
                    {categoryToDelete.name}
                  </span>
                  . This action cannot be
                  undone.
                </p>

              </div>


              <div
                className="
                  mx-6
                  my-5
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50/70
                  px-4
                  py-3
                  sm:mx-7
                "
              >

                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >

                  <FiAlertTriangle
                    size={16}
                    className="
                      mt-0.5
                      shrink-0
                      text-red-500
                    "
                  />

                  <p
                    className="
                      text-xs
                      leading-5
                      text-red-700
                    "
                  >
                    Make sure this category
                    is no longer required by
                    your inventory workflow
                    before continuing.
                  </p>

                </div>

              </div>


              <div
                className="
                  flex
                  flex-col-reverse
                  gap-2
                  border-t
                  border-slate-100
                  bg-slate-50/70
                  px-6
                  py-4
                  sm:flex-row
                  sm:justify-end
                  sm:px-7
                "
              >

                <button
                  type="button"
                  onClick={
                    closeDeleteModal
                  }
                  disabled={isDeleting}
                  className="
                    h-10
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>


                <button
                  type="button"
                  onClick={
                    handleDelete
                  }
                  disabled={isDeleting}
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-red-600
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-red-700
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {isDeleting ? (

                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      Deleting...
                    </>

                  ) : (

                    <>
                      <FiTrash2
                        size={15}
                      />

                      Delete Category
                    </>

                  )}

                </button>

              </div>

            </div>

          </div>

        )}

    </AdminLayout>
  );
};

export default CategoryPage;