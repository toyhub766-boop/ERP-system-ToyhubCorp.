import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../../app/layouts/AdminLayout";

import InventorySearch from "../components/InventorySearch";
import InventoryFilters from "../components/InventoryFilters";
import InventoryCard from "../components/InventoryCard";

import { getProducts } from "../services/product.service";
import { getCategories } from "../../categories/services/category.service";

import type { Product } from "../../staff/types/inventory.types";

import { getWarehouses } from "../../warehouses/services/warehouse.service";

import type { Category } from "../../categories/types/category.types";

import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import DeleteProductModal from "../components/DeleteProductModal";

import PageContainer from "../../../components/ui/PageContainer";
import SectionCard from "../../../components/ui/SectionCard";
import PageHeader from "../../../components/ui/PageHeader";
import StatCard from "../../../components/ui/StatCard";

const InventoryPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedStatus, setSelectedStatus] =
    useState("All");

  const [showProductModal, setShowProductModal] =
    useState(false);

  const [warehouses, setWarehouses] =
    useState<any[]>([]);

  const [selectedWarehouse, setSelectedWarehouse] =
    useState("");

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [selectedType, setSelectedType] =
    useState("All");

  /* ============================================================
     FETCH DATA
  ============================================================ */

  const fetchData = async () => {
    try {
      const [
        productsData,
        categoriesData,
        warehousesData,
      ] = await Promise.all([
        getProducts(),
        getCategories(),
        getWarehouses(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setWarehouses(warehousesData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ============================================================
     FILTER PRODUCTS
  ============================================================ */

  const filteredProducts = products.filter(
    (product) => {
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

      const matchesStatus =
        selectedStatus === "All" ||
        product.status ===
          selectedStatus;

      const matchesWarehouse =
        selectedWarehouse === "" ||
        product.warehouse._id ===
          selectedWarehouse;

      const matchesType =
        selectedType === "All" ||
        product.type ===
          selectedType;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesWarehouse &&
        matchesType
      );
    }
  );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <AdminLayout>
      <PageContainer
        className="
          space-y-6
          sm:space-y-8
          lg:space-y-10
        "
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <PageHeader
          title="Inventory Management"
          subtitle="Track products, stock levels and warehouse inventory."
          action={
            <button
              type="button"
              onClick={() =>
                setShowProductModal(true)
              }
              className="
                flex
                h-10
                w-full
                items-center
                justify-center
                rounded-xl
                bg-[#172B6B]
                px-4
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-[#20398F]
                active:scale-[0.98]
                sm:h-11
                sm:w-auto
                sm:px-5
              "
            >
              + Add Product
            </button>
          }
        />

        {/* =====================================================
            KPI CARDS
        ===================================================== */}

        <section className="space-y-3 sm:space-y-4">
          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:gap-5
              lg:grid-cols-4
              lg:gap-6
            "
          >
            <StatCard
              title="Products"
              value={
                filteredProducts.length
              }
            />

            <StatCard
              title="Categories"
              value={
                categories.length
              }
            />

            <StatCard
              title="Warehouses"
              value={
                warehouses.length
              }
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
        </section>

        {/* =====================================================
            SEARCH + FILTERS
        ===================================================== */}

        <section
          className="
            space-y-4
            sm:space-y-5
            lg:space-y-6
          "
        >
          <InventorySearch
            value={search}
            onChange={setSearch}
          />

          <InventoryFilters
            categories={categories.map(
              (c) => c.name
            )}
            warehouses={warehouses}
            selectedCategory={
              selectedCategory
            }
            selectedStatus={
              selectedStatus
            }
            selectedWarehouse={
              selectedWarehouse
            }
            selectedType={
              selectedType
            }
            onCategoryChange={
              setSelectedCategory
            }
            onStatusChange={
              setSelectedStatus
            }
            onWarehouseChange={
              setSelectedWarehouse
            }
            onTypeChange={
              setSelectedType
            }
          />
        </section>

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        <section
          className="
            space-y-4
            sm:space-y-5
          "
        >
          {/* SECTION HEADER */}

          <div
            className="
              flex
              min-w-0
              flex-col
              gap-1
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div className="min-w-0">
              <h2
                className="
                  text-lg
                  font-semibold
                  tracking-tight
                  text-slate-900
                  sm:text-xl
                "
              >
                Products
              </h2>

              <p
                className="
                  text-xs
                  text-slate-400
                  sm:text-sm
                  sm:text-slate-500
                "
              >
                {filteredProducts.length}{" "}
                product
                {filteredProducts.length !==
                1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          {/* PRODUCT LIST */}

          <div
            className="
              mx-auto
              w-full
              max-w-[1100px]
              space-y-4
              sm:space-y-5
            "
          >
            {filteredProducts.length >
            0 ? (
              filteredProducts.map(
                (product) => (
                  <InventoryCard
                    key={product._id}
                    product={product}
                    onView={(id) =>
                      navigate(
                        `/inventory/${id}`
                      )
                    }
                    onEdit={(product) => {
                      setSelectedProduct(
                        product
                      );
                      setShowEditModal(
                        true
                      );
                    }}
                    onDelete={(product) => {
                      setSelectedProduct(
                        product
                      );
                      setShowDeleteModal(
                        true
                      );
                    }}
                  />
                )
              )
            ) : (
              <SectionCard>
                <div
                  className="
                    px-4
                    py-12
                    text-center
                    sm:py-16
                  "
                >
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
                      text-slate-400
                      sm:text-sm
                      sm:text-slate-500
                    "
                  >
                    Try changing your
                    search or filters.
                  </p>
                </div>
              </SectionCard>
            )}
          </div>
        </section>

        {/* =====================================================
            MODALS
        ===================================================== */}

        <AddProductModal
          open={showProductModal}
          onClose={() =>
            setShowProductModal(false)
          }
          onSuccess={fetchData}
        />

        <EditProductModal
          open={showEditModal}
          onClose={() =>
            setShowEditModal(false)
          }
          onSuccess={fetchData}
          product={selectedProduct}
        />

        <DeleteProductModal
          open={showDeleteModal}
          onClose={() =>
            setShowDeleteModal(false)
          }
          onSuccess={fetchData}
          product={selectedProduct}
        />
      </PageContainer>
    </AdminLayout>
  );
};

export default InventoryPage;