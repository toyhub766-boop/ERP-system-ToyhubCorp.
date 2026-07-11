import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCategories } from "../../categories/services/category.service";
import { getWarehouses } from "../../warehouses/services/warehouse.service";

import { getProducts } from "../services/inventory.service";
import type { Product } from "../types/inventory.types";

import BottomNavigation from "../components/BottomNavigation";

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
      {/* Header */}
      <div className="bg-[#17357A] px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-white font-bold">
            TOY HUB <br /> CORPORATION
          </h1>

          <p className="text-blue-200 text-xs">Inventory</p>
        </div>

        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
          M
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setShowCategoryModal(true)}
          className="flex-1 bg-white border rounded-xl py-3 font-medium"
        >
          + Category
        </button>

        <button
          onClick={() => setShowProductModal(true)}
          className="flex-1 bg-[#17357A] text-white rounded-xl py-3 font-medium"
        >
          + Product
        </button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or SKU..."
            className="flex-1 rounded-xl border px-4 py-3"
          />

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 rounded-xl border-none bg-transparent"
          >
            🔎
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-4 space-y-5">
            {/* Category */}

            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 mb-3">
                Category
              </p>

              <div className="flex flex-wrap gap-2">
                {["All", ...categories.map((c) => c.name)].map((item) => (
                  <button
                    key={item}
                    onClick={() => setSelectedCategory(item)}
                    className={`px-4 py-2 rounded-full text-sm transition
              ${
                selectedCategory === item
                  ? "bg-[#17357A] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Warehouse */}

            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 mb-3">
                Warehouse
              </p>

              <div className="flex flex-wrap gap-2">
                {["All", ...warehouses.map((w) => w.name)].map((item) => (
                  <button
                    key={item}
                    onClick={() => setSelectedWarehouse(item)}
                    className={`px-4 py-2 rounded-full text-sm transition
              ${
                selectedWarehouse === item
                  ? "bg-[#17357A] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
        <p className="text-xs font-semibold uppercase text-slate-500 mb-3">
          Product Type
        </p>

        <div className="flex flex-wrap gap-2">
          {["All", "RAW", "FINISHED"].map((item) => (
            <button
              key={item}
              onClick={() => setSelectedType(item)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                selectedType === item
                  ? "bg-[#17357A] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

            {/* Status */}

            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 mb-3">
                Status
              </p>

              <div className="flex flex-wrap gap-2">
                {["All", "Healthy", "Low Stock", "Critical"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setSelectedStatus(item)}
                    className={`px-4 py-2 rounded-full text-sm transition
              ${
                selectedStatus === item
                  ? "bg-[#17357A] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}


      </div>


      {/* Products Card*/}

      <div className="px-4 pb-24 space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-sm border p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="font-bold text-lg">{product.name}</h2>

                  <p className="text-sm text-slate-500">
                    {product.warehouse.name} • {product.sku}
                  </p>

                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      product.type === "FINISHED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {product.type === "FINISHED"
                      ? "Finished Product"
                      : "Raw Material"}
                  </span>
                </div>

                <span
                  className={`ml-3 shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
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

              <div className="mt-4 flex items-end gap-2">
                <span className="text-3xl font-bold">
                  {product.currentStock}
                </span>

                <span className="text-slate-500">{product.unit}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <button
                  onClick={() => navigate(`/staff/stock-in/${product._id}`)}
                  className="rounded-xl py-3 bg-green-100 text-green-700 font-semibold"
                >
                  + Stock IN
                </button>

                <button
                  onClick={() => navigate(`/staff/stock-out/${product._id}`)}
                  className="rounded-xl py-3 bg-red-100 text-red-700 font-semibold"
                >
                  - Stock OUT
                </button>
              </div>
            </div>
          ))
        )}
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
  );
};

export default StaffInventoryPage;
