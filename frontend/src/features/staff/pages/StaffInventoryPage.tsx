import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCategories } from "../../categories/services/category.service";

import {
  X,
  Package,
  SlidersHorizontal,
  Plus,
  MapPin,
  Warehouse,
  Search,
} from "lucide-react";

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

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showFilters, setShowFilters] = useState(false);

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

  const [showCategoryModal, setShowCategoryModal] =
    useState(false);

  const [showProductModal, setShowProductModal] =
    useState(false);

  const [previewImage, setPreviewImage] =
    useState<string | null>(null);

  /* =========================================================
     FETCH PRODUCTS
  ========================================================= */

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const data = await getProducts();

      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FETCH FILTER DATA
  ========================================================= */

  const fetchFilters = async () => {
    try {
      const categoryData = await getCategories();

      setCategories(categoryData);
    } catch (error) {
      console.error(
        "Failed to fetch filter data:",
        error
      );
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchFilters();
  }, []);

  /* =========================================================
     DERIVED WAREHOUSES
     We derive these from the products so the filter actually
     works without requiring another API request.
  ========================================================= */

  const warehouses = useMemo(() => {
    const warehouseMap = new Map<
      string,
      string
    >();

    products.forEach((product) => {
      if (
        product.warehouse?._id &&
        product.warehouse?.name
      ) {
        warehouseMap.set(
          product.warehouse._id,
          product.warehouse.name
        );
      }
    });

    return Array.from(
      warehouseMap.entries()
    ).map(([id, name]) => ({
      id,
      name,
    }));
  }, [products]);

  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

  const filteredProducts = useMemo(() => {
    const searchTerm =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name
          .toLowerCase()
          .includes(searchTerm) ||
        product.sku
          .toLowerCase()
          .includes(searchTerm);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category?.name ===
          selectedCategory;

      const matchesWarehouse =
        selectedWarehouse === "All" ||
        product.warehouse?.name ===
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

  /* =========================================================
     STATS
  ========================================================= */

  const lowStockCount = products.filter(
    (product) =>
      product.currentStock <=
      product.minimumStock
  ).length;

  const criticalStockCount = products.filter(
    (product) =>
      product.status === "Critical"
  ).length;

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedWarehouse("All");
    setSelectedStatus("All");
    setSelectedType("All");
    setSearch("");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedWarehouse !== "All" ||
    selectedStatus !== "All" ||
    selectedType !== "All";

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
            max-w-5xl
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
            subtitle={`${filteredProducts.length} ${
              filteredProducts.length === 1
                ? "product"
                : "products"
            } available`}
          />

          {/* =====================================================
              SUMMARY
          ===================================================== */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-4
              sm:gap-4
            "
          >
            <StatCard
              title="Products"
              value={products.length}
            />

            <StatCard
              title="Low Stock"
              value={lowStockCount}
            />

            <StatCard
              title="Critical"
              value={criticalStockCount}
            />

            <StatCard
              title="Warehouses"
              value={warehouses.length}
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
            <div className="relative">
              <InventorySearch
                value={search}
                onChange={setSearch}
              />
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-2.5
                sm:grid-cols-3
                sm:gap-3
              "
            >
              <button
                type="button"
                onClick={() =>
                  setShowCategoryModal(true)
                }
                className="
                  flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
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
                  hover:border-slate-300
                  hover:bg-white
                  active:scale-[0.98]
                  sm:text-sm
                "
              >
                <Plus size={16} />
                Add Category
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowProductModal(true)
                }
                className="
                  flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
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
                <Plus size={16} />
                Add Product
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    (current) => !current
                  )
                }
                className="
                  col-span-2
                  flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
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
                  sm:col-span-1
                "
              >
                <SlidersHorizontal
                  size={17}
                />

                {showFilters
                  ? "Hide Filters"
                  : "Filters"}

                {hasActiveFilters && (
                  <span
                    className="
                      flex
                      h-5
                      min-w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-[#17357A]
                      px-1.5
                      text-[10px]
                      font-bold
                      text-white
                    "
                  >
                    !
                  </span>
                )}
              </button>
            </div>
          </SectionCard>

          {/* =====================================================
              FILTER PANEL
          ===================================================== */}

          {showFilters && (
            <SectionCard
              className="
                space-y-6
                sm:space-y-7
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
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
                    <SlidersHorizontal
                      size={17}
                      className="text-[#17357A]"
                    />

                    <h3
                      className="
                        text-base
                        font-semibold
                        text-slate-900
                      "
                    >
                      Inventory Filters
                    </h3>
                  </div>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                      sm:text-sm
                    "
                  >
                    Narrow down the inventory
                    using the available filters.
                  </p>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      shrink-0
                      text-xs
                      font-semibold
                      text-[#17357A]
                      hover:underline
                      sm:text-sm
                    "
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* CATEGORY */}

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
                      (category) =>
                        category.name
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

              {/* WAREHOUSE */}

              <div className="space-y-3">
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Warehouse
                    size={14}
                    className="text-slate-400"
                  />

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
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    "All",
                    ...warehouses.map(
                      (warehouse) =>
                        warehouse.name
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

              {/* PRODUCT TYPE */}

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
                        setSelectedType(item)
                      }
                      className={`
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
                          selectedType === item
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

              {/* STATUS */}

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
              PRODUCTS HEADER
          ===================================================== */}

          <div
            className="
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-[#17357A]
                  sm:text-xs
                "
              >
                Stock Overview
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  tracking-tight
                  text-slate-900
                  sm:text-2xl
                "
              >
                Products
              </h2>
            </div>

            <p
              className="
                text-xs
                font-medium
                text-slate-500
                sm:text-sm
              "
            >
              {filteredProducts.length} found
            </p>
          </div>

          {/* =====================================================
              PRODUCT LIST
          ===================================================== */}

          <div className="space-y-4">
            {loading ? (
              <SectionCard>
                <div
                  className="
                    py-14
                    text-center
                    sm:py-16
                  "
                >
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
            ) : filteredProducts.length ===
              0 ? (
              <SectionCard>
                <div
                  className="
                    py-14
                    text-center
                    sm:py-16
                  "
                >
                  <div
                    className="
                      mx-auto
                      mb-5
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#17357A]/10
                    "
                  >
                    {hasActiveFilters ? (
                      <Search
                        className="
                          h-7
                          w-7
                          text-[#17357A]
                        "
                      />
                    ) : (
                      <Package
                        className="
                          h-7
                          w-7
                          text-[#17357A]
                        "
                      />
                    )}
                  </div>

                  <h3
                    className="
                      text-base
                      font-semibold
                      text-slate-900
                      sm:text-lg
                    "
                  >
                    {hasActiveFilters
                      ? "No matching products"
                      : "No products available"}
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
                    {hasActiveFilters
                      ? "Try changing your search or clearing some filters."
                      : "Products added to inventory will appear here."}
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="
                        mt-5
                        rounded-xl
                        bg-[#17357A]
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-[#23428f]
                      "
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </SectionCard>
            ) : (
              filteredProducts.map(
                (product) => (
                  <SectionCard
                    key={product._id}
                    className="
                      overflow-hidden
                      p-0
                    "
                  >
                    {/* =================================================
                        PRODUCT TOP
                    ================================================= */}

                    <div
                      className="
                        p-4
                        sm:p-5
                      "
                    >
                      <div
                        className="
                          flex
                          items-start
                          gap-3
                          sm:gap-4
                        "
                      >
                        {/* PRODUCT IMAGE */}

                        <button
                          type="button"
                          disabled={!product.image}
                          onClick={() => {
                            if (
                              product.image
                            ) {
                              setPreviewImage(
                                product.image
                              );
                            }
                          }}
                          className="
                            group
                            relative
                            flex
                            h-16
                            w-16
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-200
                            bg-slate-100
                            shadow-sm
                            transition
                            sm:h-20
                            sm:w-20
                          "
                          aria-label={
                            product.image
                              ? `View ${product.name} image`
                              : undefined
                          }
                        >
                          {product.image ? (
                            <>
                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                  transition
                                  duration-300
                                  group-hover:scale-105
                                "
                              />

                              <span
                                className="
                                  absolute
                                  inset-0
                                  flex
                                  items-center
                                  justify-center
                                  bg-black/0
                                  text-xs
                                  font-semibold
                                  text-white
                                  opacity-0
                                  transition
                                  group-hover:bg-black/20
                                  group-hover:opacity-100
                                "
                              >
                                View
                              </span>
                            </>
                          ) : (
                            <Package
                              className="
                                h-7
                                w-7
                                text-[#17357A]
                                sm:h-8
                                sm:w-8
                              "
                            />
                          )}
                        </button>

                        {/* PRODUCT INFORMATION */}

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >
                            <h3
                              className="
                                min-w-0
                                max-w-full
                                truncate
                                text-base
                                font-bold
                                text-slate-900
                                sm:text-lg
                              "
                            >
                              {product.name}
                            </h3>

                            <span
                              className={`
                                shrink-0
                                rounded-full
                                px-2
                                py-1
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-wide
                                sm:text-[10px]
                                ${
                                  product.type ===
                                  "FINISHED"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                                }
                              `}
                            >
                              {product.type ===
                              "FINISHED"
                                ? "Finished"
                                : "Raw"}
                            </span>
                          </div>

                          <p
                            className="
                              mt-1
                              truncate
                              text-xs
                              font-medium
                              text-slate-500
                              sm:text-sm
                            "
                          >
                            SKU {product.sku}
                          </p>

                          <div
                            className="
                              mt-2
                              flex
                              min-w-0
                              items-center
                              gap-1.5
                              text-xs
                              text-slate-500
                            "
                          >
                            <MapPin
                              size={13}
                              className="
                                shrink-0
                                text-[#17357A]
                              "
                            />

                            <span className="truncate">
                              {product.warehouse
                                ?.name ||
                                "Warehouse not assigned"}
                            </span>
                          </div>
                        </div>

                        {/* STATUS */}

                        <span
                          className={`
                            shrink-0
                            rounded-full
                            px-2.5
                            py-1.5
                            text-[9px]
                            font-bold
                            sm:px-3
                            sm:text-[10px]
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

                      {/* =================================================
                          STOCK INFORMATION
                      ================================================= */}

                      <div
                        className="
                          mt-5
                          grid
                          grid-cols-2
                          gap-2.5
                          sm:grid-cols-3
                          sm:gap-3
                        "
                      >
                        <div
                          className="
                            rounded-2xl
                            border
                            border-slate-100
                            bg-slate-50
                            p-3
                            sm:p-4
                          "
                        >
                          <p
                            className="
                              text-[9px]
                              font-semibold
                              uppercase
                              tracking-[0.08em]
                              text-slate-400
                              sm:text-[10px]
                            "
                          >
                            Current Stock
                          </p>

                          <p
                            className="
                              mt-1
                              text-2xl
                              font-bold
                              tracking-tight
                              text-[#17357A]
                              sm:text-3xl
                            "
                          >
                            {product.currentStock}
                          </p>
                        </div>

                        <div
                          className="
                            rounded-2xl
                            border
                            border-slate-100
                            bg-slate-50
                            p-3
                            sm:p-4
                          "
                        >
                          <p
                            className="
                              text-[9px]
                              font-semibold
                              uppercase
                              tracking-[0.08em]
                              text-slate-400
                              sm:text-[10px]
                            "
                          >
                            Minimum
                          </p>

                          <p
                            className="
                              mt-1
                              text-2xl
                              font-bold
                              tracking-tight
                              text-slate-800
                              sm:text-3xl
                            "
                          >
                            {product.minimumStock}
                          </p>
                        </div>

                        <div
                          className="
                            col-span-2
                            rounded-2xl
                            border
                            border-slate-100
                            bg-slate-50
                            p-3
                            sm:col-span-1
                            sm:p-4
                          "
                        >
                          <p
                            className="
                              text-[9px]
                              font-semibold
                              uppercase
                              tracking-[0.08em]
                              text-slate-400
                              sm:text-[10px]
                            "
                          >
                            Unit
                          </p>

                          <p
                            className="
                              mt-2
                              truncate
                              text-sm
                              font-bold
                              text-slate-800
                              sm:text-base
                            "
                          >
                            {product.unit}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-2
                        border-t
                        border-slate-100
                        bg-slate-50/70
                        p-3
                        sm:gap-3
                        sm:p-4
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
                          flex
                          min-h-11
                          items-center
                          justify-center
                          gap-2
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
                          flex
                          min-h-11
                          items-center
                          justify-center
                          gap-2
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

        {/* =========================================================
            MODALS
        ========================================================= */}

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

        {/* =========================================================
            IMAGE PREVIEW
        ========================================================= */}

        {previewImage && (
          <div
            className="
              fixed
              inset-0
              z-[9999]
              flex
              items-center
              justify-center
              bg-slate-950/85
              p-4
              backdrop-blur-md
              sm:p-6
            "
            onClick={() =>
              setPreviewImage(null)
            }
          >
            <button
              type="button"
              onClick={() =>
                setPreviewImage(null)
              }
              aria-label="Close image preview"
              className="
                absolute
                right-3
                top-3
                z-10
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                bg-white
                text-slate-700
                shadow-xl
                transition
                hover:bg-slate-100
                active:scale-95
                sm:right-6
                sm:top-6
              "
            >
              <X size={18} />
            </button>

            <div
              className="
                relative
                flex
                max-h-[90vh]
                max-w-[95vw]
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                bg-white
                p-1
                shadow-2xl
                sm:max-w-[90vw]
                sm:rounded-3xl
                sm:p-2
              "
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <img
                src={previewImage}
                alt="Product Preview"
                className="
                  max-h-[86vh]
                  max-w-[92vw]
                  rounded-xl
                  object-contain
                  sm:max-h-[88vh]
                  sm:max-w-[88vw]
                "
              />
            </div>
          </div>
        )}
      </PageContainer>

      <BottomNavigation />
    </div>
  );
};

export default StaffInventoryPage;