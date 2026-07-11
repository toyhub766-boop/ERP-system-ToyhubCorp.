import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../app/layouts/AdminLayout";

import InventoryHeader from "../components/InventoryHeader";
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
    <div className="space-y-6">
      <InventoryHeader
        totalProducts={filteredProducts.length}
        onAddProduct={() => setShowProductModal(true)}
      />

      <InventorySearch value={search} onChange={setSearch} />

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

      <div className="grid gap-5">
        {filteredProducts.map((product) => (
          <InventoryCard
            key={product._id}
            product={product}
            onView={(id) => navigate(`/inventory/${id}`)}
            onEdit={(product) => {
              setSelectedProduct(product);
              setShowEditModal(true);
            }}
            onDelete={(product) => {
              setSelectedProduct(product);
              setShowDeleteModal(true);
            }}
          />
        ))}

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
      </div>
    </div>
    </AdminLayout>
  );
};

export default InventoryPage;
