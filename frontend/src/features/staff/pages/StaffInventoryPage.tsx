import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCategories } from "../../categories/services/category.service";
import { getWarehouses } from "../../warehouses/services/warehouse.service";

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

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [selectedWarehouse, setSelectedWarehouse] = useState("All");

  const [selectedStatus, setSelectedStatus] = useState("All");

  const [selectedType, setSelectedType] = useState("All");

  const [categories, setCategories] = useState<any[]>([]);

  const [warehouses, setWarehouses] = useState<any[]>([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();

      console.log("Products:", data);

      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      console.log("Fetching categories...");
      const categoryData = await getCategories();
      console.log("Categories:", categoryData);
      setCategories(categoryData);

      console.log("Fetching warehouses...");
      const warehouseData = await getWarehouses();
      console.log("Warehouses:", warehouseData);
      setWarehouses(warehouseData);
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
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category.name === selectedCategory;

      const matchesWarehouse =
        selectedWarehouse === "All" ||
        product.warehouse.name === selectedWarehouse;

      const matchesStatus =
        selectedStatus === "All" || product.status === selectedStatus;

      const matchesType =
        selectedType === "All" || product.type === selectedType;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWarehouse &&
        matchesStatus &&
        matchesType
      );
    });
  }, [products, search, selectedCategory, selectedWarehouse, selectedStatus]);

  console.log("Products state:", products);
  console.log("Filtered:", filteredProducts);
return (
  <div className="min-h-screen bg-slate-100">

    <PageContainer>

      <div className="mx-auto flex w-full justify-center">

        <div className="w-full max-w-4xl space-y-8">

          <PageHeader
            title="Inventory"
            subtitle={`${filteredProducts.length} products available`}
          />

          {/* Stats */}

          <div className="grid grid-cols-2 gap-5">

            <StatCard
              title="Products"
              value={filteredProducts.length}
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

          {/* Search + Actions */}

          <SectionCard className="space-y-5">

        <InventorySearch
          value={search}
          onChange={setSearch}
        />
        <div className="h-3"/>

        <div className="grid grid-cols-2 gap-3">

          <button
            onClick={() => setShowCategoryModal(true)}
            className="
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              py-3.5
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-100
            "
          >
            + Add Category
          </button>

          <button
            onClick={() => setShowProductModal(true)}
            className="
              rounded-xl
              bg-[#17357A]
              py-3.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#23428f]
            "
          >
            + Add Product
          </button>

        </div>
        <div className="h-3"/>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="
            w-full
            rounded-xl
            border
            border-slate-200
            bg-white
            py-3
            text-sm
            font-medium
            text-slate-700
            transition
            hover:bg-slate-50
          "
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

      </SectionCard>

      

      {/* Filters */}

      {showFilters && (

        <SectionCard className="space-y-6">

          <div>

            <h3 className="text-base font-semibold text-slate-800">
              Filters
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Narrow down products using category, warehouse, product type and stock status.
            </p>

          </div>
          

          {/* Category */}

          <div className="space-y-3">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Category
            </p>

            <div className="flex flex-wrap gap-2">

              {["All", ...categories.map((c) => c.name)].map((item) => (

                <button
                  key={item}
                  onClick={() => setSelectedCategory(item)}
                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    transition

                    ${
                      selectedCategory === item
                        ? "bg-[#17357A] text-white"
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

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Warehouse
            </p>

            <div className="flex flex-wrap gap-2">

              {["All", ...warehouses.map((w) => w.name)].map((item) => (

                <button
                  key={item}
                  onClick={() => setSelectedWarehouse(item)}
                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    transition

                    ${
                      selectedWarehouse === item
                        ? "bg-[#17357A] text-white"
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

          <div className="space-y-5">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Product Type
            </p>

            <div className="flex flex-wrap gap-2">

              {["All", "RAW", "FINISHED"].map((item) => (

                <button
                  key={item}
                  onClick={() => setSelectedType(item)}
                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    transition

                    ${
                      selectedType === item
                        ? "bg-[#17357A] text-white"
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

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Stock Status
            </p>

            <div className="flex flex-wrap gap-2">

              {["All", "Healthy", "Low Stock", "Critical"].map((item) => (

                <button
                  key={item}
                  onClick={() => setSelectedStatus(item)}
                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    transition

                    ${
                      selectedStatus === item
                        ? "bg-[#17357A] text-white"
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

      

            <div className="space-y-4">

        {loading ? (

          <SectionCard>

            <div className="py-16 text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#17357A]" />

              <p className="font-medium text-slate-600">
                Loading inventory...
              </p>

            </div>

          </SectionCard>

        ) : filteredProducts.length === 0 ? (

          <SectionCard>

            <div className="py-16 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                📦
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                No Products Found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filter selection.
              </p>

            </div>

          </SectionCard>

        ) : (

          filteredProducts.map((product) => (

            <SectionCard
              key={product._id}
              className="space-y-5"
            >

              {/* Top */}

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                    📦
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {product.sku}
                    </p>

                    <p className="text-sm text-slate-500">
                      {product.warehouse.name}
                    </p>

                  </div>

                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    product.status === "Healthy"
                      ? "bg-green-100 text-green-700"
                      : product.status === "Low Stock"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.status}
                </span>

              </div>
              <div className="h-5"/>

              {/* Stats */}

              <div className="grid grid-cols-3 gap-3">

                <div className="rounded-xl bg-slate-50 p-3 text-center">

                  <p className="text-xs uppercase text-slate-500">
                    Current
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-[#17357A]">
                    {product.currentStock}
                  </h3>

                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center">

                  <p className="text-xs uppercase text-slate-500">
                    Minimum
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    {product.minimumStock}
                  </h3>

                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center">

                  <p className="text-xs uppercase text-slate-500">
                    Type
                  </p>

                  <h3 className="mt-1 text-sm font-semibold">

                    {product.type === "RAW"
                      ? "Raw"
                      : "Finished"}

                  </h3>

                </div>

              </div>

              {/* Buttons */}
              <div className="h-5"/>

              <div className="grid grid-cols-2 gap-3">

                <button
                  onClick={() =>
                    navigate(`/staff/stock-in/${product._id}`)
                  }
                  className="
                    rounded-xl
                    bg-green-100
                    py-3
                    font-semibold
                    text-green-700
                    transition
                    hover:bg-green-200
                  "
                >
                  Stock In
                </button>

                <button
                  onClick={() =>
                    navigate(`/staff/stock-out/${product._id}`)
                  }
                  className="
                    rounded-xl
                    bg-red-100
                    py-3
                    font-semibold
                    text-red-700
                    transition
                    hover:bg-red-200
                  "
                >
                  Stock Out
                </button>

              </div>
              

            </SectionCard>
            

          ))
          

        )}
        <div className="h-5"/>

      </div>
      </div>


    <AddProductModal
      open={showProductModal}
      onClose={() => setShowProductModal(false)}
      onSuccess={fetchProducts}
    />

    <AddCategoryModal
      open={showCategoryModal}
      onClose={() => setShowCategoryModal(false)}
      onSuccess={() => {
        fetchFilters();
        setShowCategoryModal(false);
      }}
    />

    <BottomNavigation />

  </div>
  </PageContainer>
  </div>
);
};

export default StaffInventoryPage;
