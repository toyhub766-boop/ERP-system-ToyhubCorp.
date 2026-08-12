import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCategories } from "../../categories/services/category.service";
// import { getWarehouses } from "../../warehouses/services/warehouse.service";

import { getProducts } from "../services/inventory.service";
import type { Product } from "../types/inventory.types";

import BottomNavigation from "../components/BottomNavigation";
import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";
import SectionCard from "../../../components/ui/SectionCard";
import StatCard from "../../../components/ui/StatCard";
import InventorySearch from "../../inventory/components/InventorySearch";

import AddProductModal from "../../inventory/components/AddProductModal";
import AddCategoryModal from "../components/AddCategoryModal";

const StaffInventoryPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [showFilters, setShowFilters] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedWarehouse, setSelectedWarehouse] =
    useState("All");

  const [selectedStatus, setSelectedStatus] =
    useState("All");

  const [selectedType, setSelectedType] =
    useState("All");

  const [categories, setCategories] =
    useState<any[]>([]);

  const [warehouses] =
    useState<any[]>([]);

  const [showCategoryModal, setShowCategoryModal] =
    useState(false);

  const [showProductModal, setShowProductModal] =
    useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const data =
        await getProducts();

      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const categoryData =
        await getCategories();

      setCategories(categoryData);
    } catch (err) {
      console.error("Filter Error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchFilters();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchTerm =
        search.toLowerCase();

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(searchTerm) ||
        product.sku
          .toLowerCase()
          .includes(searchTerm);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category.name ===
          selectedCategory;

      const matchesWarehouse =
        selectedWarehouse === "All" ||
        product.warehouse.name ===
          selectedWarehouse;

      const matchesStatus =
        selectedStatus === "All" ||
        product.status === selectedStatus;

      const matchesType =
        selectedType === "All" ||
        product.type === selectedType;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWarehouse &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    products,
    search,
    selectedCategory,
    selectedWarehouse,
    selectedStatus,
    selectedType,
  ]);

  return (
    <div
      className="
        min-h-screen
        bg-slate-100
        pb-24
      "
    >
      <PageContainer>
        <div
          className="
            mx-auto
            w-full
            max-w-4xl
            space-y-5
            sm:space-y-6
            lg:space-y-8
          "
        >
          {/* =====================================================
              HEADER
          ===================================================== */}

          <PageHeader
            title="Inventory"
            subtitle={`${filteredProducts.length} products available`}
          />

          {/* =====================================================
              STATS
          ===================================================== */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:gap-5
            "
          >
            <StatCard
              title="Products"
              value={filteredProducts.length}
            />

            <StatCard
              title="Low Stock"
              value={
                products.filter(
                  (p) =>
                    p.currentStock <=
                    p.minimumStock
                ).length
              }
            />
          </div>

          {/* =====================================================
              SEARCH + ACTIONS
          ===================================================== */}

          <SectionCard
            className="
              space-y-4
              sm:space-y-5
            "
          >
            <InventorySearch
              value={search}
              onChange={setSearch}
            />

            <div
              className="
                grid
                grid-cols-2
                gap-2.5
                sm:gap-3
              "
            >
              <button
                type="button"
                onClick={() =>
                  setShowCategoryModal(true)
                }
                className="
                  min-h-11
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  py-3
                  text-xs
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-100
                  active:scale-[0.98]
                  sm:text-sm
                "
              >
                + Add Category
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowProductModal(true)
                }
                className="
                  min-h-11
                  rounded-xl
                  bg-[#17357A]
                  px-3
                  py-3
                  text-xs
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#23428f]
                  active:scale-[0.98]
                  sm:text-sm
                "
              >
                + Add Product
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  !showFilters
                )
              }
              className="
                min-h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                font-medium
                text-slate-700
                transition
                hover:bg-slate-50
                active:scale-[0.99]
              "
            >
              {showFilters
                ? "Hide Filters"
                : "Show Filters"}
            </button>
          </SectionCard>

          {/* =====================================================
              FILTERS
          ===================================================== */}

          {showFilters && (
            <SectionCard
              className="
                space-y-6
                sm:space-y-7
              "
            >
              <div>
                <h3
                  className="
                    text-base
                    font-semibold
                    text-slate-800
                  "
                >
                  Filters
                </h3>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                    sm:text-sm
                  "
                >
                  Narrow down products using
                  category, warehouse, product
                  type and stock status.
                </p>
              </div>

              {/* Category */}

              <div className="space-y-3">
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                    sm:text-xs
                    sm:tracking-wide
                  "
                >
                  Category
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    "All",
                    ...categories.map(
                      (c) => c.name
                    ),
                  ].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() =>
                        setSelectedCategory(
                          item
                        )
                      }
                      className={`
                        min-h-9
                        rounded-full
                        px-3
                        py-2
                        text-xs
                        font-medium
                        transition
                        active:scale-[0.97]
                        sm:px-4
                        sm:text-sm
                        ${
                          selectedCategory ===
                          item
                            ? "bg-[#17357A] text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }
                      `}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warehouse */}

              <div className="space-y-3">
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                    sm:text-xs
                    sm:tracking-wide
                  "
                >
                  Warehouse
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    "All",
                    ...warehouses.map(
                      (w) => w.name
                    ),
                  ].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() =>
                        setSelectedWarehouse(
                          item
                        )
                      }
                      className={`
                        min-h-9
                        rounded-full
                        px-3
                        py-2
                        text-xs
                        font-medium
                        transition
                        active:scale-[0.97]
                        sm:px-4
                        sm:text-sm
                        ${
                          selectedWarehouse ===
                          item
                            ? "bg-[#17357A] text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }
                      `}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Type */}

              <div className="space-y-3">
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                    sm:text-xs
                    sm:tracking-wide
                  "
                >
                  Product Type
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    "All",
                    "RAW",
                    "FINISHED",
                  ].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() =>
                        setSelectedType(
                          item
                        )
                      }
                      className={`
                        min-h-9
                        rounded-full
                        px-3
                        py-2
                        text-xs
                        font-medium
                        transition
                        active:scale-[0.97]
                        sm:px-4
                        sm:text-sm
                        ${
                          selectedType ===
                          item
                            ? "bg-[#17357A] text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }
                      `}
                    >
                      {item === "RAW"
                        ? "Raw Material"
                        : item === "FINISHED"
                        ? "Finished Product"
                        : "All"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}

              <div className="space-y-3">
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                    sm:text-xs
                    sm:tracking-wide
                  "
                >
                  Stock Status
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    "All",
                    "Healthy",
                    "Low Stock",
                    "Critical",
                  ].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() =>
                        setSelectedStatus(
                          item
                        )
                      }
                      className={`
                        min-h-9
                        rounded-full
                        px-3
                        py-2
                        text-xs
                        font-medium
                        transition
                        active:scale-[0.97]
                        sm:px-4
                        sm:text-sm
                        ${
                          selectedStatus ===
                          item
                            ? "bg-[#17357A] text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }
                      `}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>
          )}

          {/* =====================================================
              PRODUCTS
          ===================================================== */}

          <div className="space-y-4">
            {loading ? (
              <SectionCard>
                <div className="py-14 text-center sm:py-16">
                  <div
                    className="
                      mx-auto
                      mb-4
                      h-10
                      w-10
                      animate-spin
                      rounded-full
                      border-4
                      border-slate-200
                      border-t-[#17357A]
                    "
                  />

                  <p
                    className="
                      text-sm
                      font-medium
                      text-slate-600
                    "
                  >
                    Loading inventory...
                  </p>
                </div>
              </SectionCard>
            ) : filteredProducts.length === 0 ? (
              <SectionCard>
                <div className="py-14 text-center sm:py-16">
                  <div
                    className="
                      mx-auto
                      mb-4
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-slate-100
                      text-2xl
                      sm:h-16
                      sm:w-16
                      sm:text-3xl
                    "
                  >
                    📦
                  </div>

                  <h3
                    className="
                      text-base
                      font-semibold
                      text-slate-800
                      sm:text-lg
                    "
                  >
                    No Products Found
                  </h3>

                  <p
                    className="
                      mx-auto
                      mt-2
                      max-w-sm
                      text-xs
                      leading-5
                      text-slate-500
                      sm:text-sm
                    "
                  >
                    Try changing your search
                    or filter selection.
                  </p>
                </div>
              </SectionCard>
            ) : (
              filteredProducts.map(
                (product) => (
                  <SectionCard
                    key={product._id}
                    className="
                      space-y-4
                      sm:space-y-5
                    "
                  >
                    {/* Product Header */}

                    <div
                      className="
                        flex
                        items-start
                        gap-3
                        sm:gap-4
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
                          rounded-xl
                          bg-slate-100
                          text-xl
                          sm:h-14
                          sm:w-14
                          sm:rounded-2xl
                          sm:text-2xl
                        "
                      >
                        📦
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2
                          className="
                            truncate
                            text-base
                            font-bold
                            text-slate-900
                            sm:text-lg
                          "
                        >
                          {product.name}
                        </h2>

                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                            text-slate-500
                            sm:text-sm
                          "
                        >
                          {product.sku}
                        </p>

                        <p
                          className="
                            truncate
                            text-xs
                            text-slate-500
                            sm:text-sm
                          "
                        >
                          {product.warehouse.name}
                        </p>
                      </div>

                      <span
                        className={`
                          shrink-0
                          rounded-full
                          px-2.5
                          py-1
                          text-[10px]
                          font-semibold
                          sm:px-3
                          sm:text-xs
                          ${
                            product.status ===
                            "Healthy"
                              ? "bg-green-100 text-green-700"
                              : product.status ===
                                "Low Stock"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }
                        `}
                      >
                        {product.status}
                      </span>
                    </div>

                    {/* Stats */}

                    <div
                      className="
                        grid
                        grid-cols-3
                        gap-2
                        sm:gap-3
                      "
                    >
                      <div
                        className="
                          rounded-xl
                          bg-slate-50
                          p-2.5
                          text-center
                          sm:p-3
                        "
                      >
                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-wide
                            text-slate-500
                            sm:text-xs
                          "
                        >
                          Current
                        </p>

                        <h3
                          className="
                            mt-1
                            text-xl
                            font-bold
                            text-[#17357A]
                            sm:text-2xl
                          "
                        >
                          {product.currentStock}
                        </h3>
                      </div>

                      <div
                        className="
                          rounded-xl
                          bg-slate-50
                          p-2.5
                          text-center
                          sm:p-3
                        "
                      >
                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-wide
                            text-slate-500
                            sm:text-xs
                          "
                        >
                          Minimum
                        </p>

                        <h3
                          className="
                            mt-1
                            text-lg
                            font-semibold
                            text-slate-800
                            sm:text-xl
                          "
                        >
                          {product.minimumStock}
                        </h3>
                      </div>

                      <div
                        className="
                          rounded-xl
                          bg-slate-50
                          p-2.5
                          text-center
                          sm:p-3
                        "
                      >
                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-wide
                            text-slate-500
                            sm:text-xs
                          "
                        >
                          Type
                        </p>

                        <h3
                          className="
                            mt-1
                            text-xs
                            font-semibold
                            text-slate-800
                            sm:text-sm
                          "
                        >
                          {product.type ===
                          "RAW"
                            ? "Raw"
                            : "Finished"}
                        </h3>
                      </div>
                    </div>

                    {/* Actions */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-2.5
                        sm:gap-3
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/staff/stock-in/${product._id}`
                          )
                        }
                        className="
                          min-h-11
                          rounded-xl
                          bg-green-100
                          px-3
                          py-3
                          text-xs
                          font-semibold
                          text-green-700
                          transition
                          hover:bg-green-200
                          active:scale-[0.98]
                          sm:text-sm
                        "
                      >
                        Stock In
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/staff/stock-out/${product._id}`
                          )
                        }
                        className="
                          min-h-11
                          rounded-xl
                          bg-red-100
                          px-3
                          py-3
                          text-xs
                          font-semibold
                          text-red-700
                          transition
                          hover:bg-red-200
                          active:scale-[0.98]
                          sm:text-sm
                        "
                      >
                        Stock Out
                      </button>
                    </div>
                  </SectionCard>
                )
              )
            )}

            <div className="h-2 sm:h-5" />
          </div>
        </div>

        {/* =====================================================
            MODALS
        ===================================================== */}

        <AddProductModal
          open={showProductModal}
          onClose={() =>
            setShowProductModal(false)
          }
          onSuccess={fetchProducts}
        />

        <AddCategoryModal
          open={showCategoryModal}
          onClose={() =>
            setShowCategoryModal(false)
          }
          onSuccess={() => {
            fetchFilters();
            setShowCategoryModal(false);
          }}
        />
      </PageContainer>

      <BottomNavigation />
    </div>
  );
};

export default StaffInventoryPage;