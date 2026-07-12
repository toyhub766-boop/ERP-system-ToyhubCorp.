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
  const [products, setProducts] = useState<Product[]>([]);

  const [ , setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [selectedStatus, setSelectedStatus] = useState("All");

  const [showProductModal, setShowProductModal] = useState(false);

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedType, setSelectedType] =
  useState("All");

  const fetchData = async () => {
    try {
      const [productsData, categoriesData, warehousesData] = await Promise.all([
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || product.category.name === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" || product.status === selectedStatus;

    const matchesWarehouse =
      selectedWarehouse === "" || product.warehouse._id === selectedWarehouse;

      const matchesType =
  selectedType === "All" ||
  product.type === selectedType;



    return (
      matchesSearch && matchesCategory && matchesStatus && matchesWarehouse && matchesType
    );
  });

  return (
  <AdminLayout>
    <PageContainer className="space-y-10">

      {/* Header */}

      <PageHeader
        title="Inventory Management"
        subtitle="Track products, stock levels and warehouse inventory."
        action={
          <button
            onClick={() => setShowProductModal(true)}
            className="
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
            "
          >
            + Add Product
          </button>
        }
      />

      {/* KPI Cards */}

      <section className="space-y-4">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

          <StatCard
            title="Products"
            value={filteredProducts.length}
          />

          <StatCard
            title="Categories"
            value={categories.length}
          />

          <StatCard
            title="Warehouses"
            value={warehouses.length}
          />

          <StatCard
            title="Low Stock"
            value={
              products.filter(
                (p) => p.currentStock <= p.minimumStock
              ).length
            }
          />

        </div>

      </section>

      {/* Search + Filters */}

      <section className="space-y-6">

        <InventorySearch
          value={search}
          onChange={setSearch}
        />

        <InventoryFilters
          categories={categories.map((c) => c.name)}
          warehouses={warehouses}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          selectedWarehouse={selectedWarehouse}
          selectedType={selectedType}
          onCategoryChange={setSelectedCategory}
          onStatusChange={setSelectedStatus}
          onWarehouseChange={setSelectedWarehouse}
          onTypeChange={setSelectedType}
        />

      </section>

      {/* Products */}

      <section className="space-y-5">

        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h2 className="text-xl font-semibold text-slate-900">
              Products
            </h2>

            <p className="text-sm text-slate-500">
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} found
            </p>

          </div>

        </div>

        <div className="mx-auto max-w-[1100px] space-y-5">

          {filteredProducts.length > 0 ? (

            filteredProducts.map((product) => (
              <InventoryCard
                key={product._id}
                product={product}
                onView={(id) =>
                  navigate(`/inventory/${id}`)
                }
                onEdit={(product) => {
                  setSelectedProduct(product);
                  setShowEditModal(true);
                }}
                onDelete={(product) => {
                  setSelectedProduct(product);
                  setShowDeleteModal(true);
                }}
              />
            ))

          ) : (

            <SectionCard>

              <div className="py-16 text-center">

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                  📦
                </div>

                <h3 className="text-lg font-semibold text-slate-800">
                  No Products Found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>

              </div>

            </SectionCard>

          )}

        </div>

      </section>

      {/* Modals */}

      <AddProductModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSuccess={fetchData}
      />

      <EditProductModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchData}
        product={selectedProduct}
      />

      <DeleteProductModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={fetchData}
        product={selectedProduct}
      />

    </PageContainer>
  </AdminLayout>
);
};

export default InventoryPage;
