import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../../app/layouts/AdminLayout";

import { getProductById } from "../services/product.service";

import type { Product } from "../../staff/types/inventory.types";

import { getProductTransactions }
from "../../staff/services/inventory.service";

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";


const InventoryDetailsPage = () => {
    const navigate = useNavigate();
  const { id } = useParams();

const [product, setProduct] =
  useState<Product | null>(null);

  const [transactions, setTransactions] =
  useState<any[]>([]);

useEffect(() => {
  if (!id) return;

  const loadProduct = async () => {
    try {
      const [productData, transactionData] =
        await Promise.all([
          getProductById(id),
          getProductTransactions(id),
        ]);

      setProduct(productData);
      setTransactions(transactionData);
    } catch (err) {
      console.error(err);
    }
  };

  loadProduct();
}, [id]);

if (!product) {
  return <div>Loading...</div>;
}

return (
  <AdminLayout>
<div className="max-w-5xl mx-auto space-y-6">

  <div className="flex items-center gap-4">

    <button
      onClick={() => navigate(-1)}
      className="p-2 rounded-xl hover:bg-slate-100"
    >
      <ArrowLeft size={22}/>
    </button>

    <div>
      <h1 className="text-3xl font-bold">
        Product Details
      </h1>

      <p className="text-slate-500">
        Inventory Information
      </p>
    </div>

  </div>

  <div className="bg-white rounded-3xl shadow border p-8 space-y-8">

    <div className="flex justify-between items-start">

  <div>

    <h2 className="text-3xl font-bold">
      {product.name}
    </h2>

    <p className="text-slate-500 mt-1">
      SKU: {product.sku}
    </p>

  </div>

  <span
    className={`px-4 py-2 rounded-full text-sm font-semibold ${
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

<div className="grid grid-cols-2 gap-6">

  <div className="border rounded-2xl p-5">
    <p className="text-sm text-slate-500">
      Category
    </p>

    <p className="text-lg font-semibold mt-2">
      {product.category.name}
    </p>
  </div>

  <div className="border rounded-2xl p-5">
  <p className="text-sm text-slate-500">
    Product Type
  </p>

  <p className="text-lg font-semibold mt-2">
    {product.type === "FINISHED"
      ? "Finished Product"
      : "Raw Material"}
  </p>
</div>

  <div className="border rounded-2xl p-5">
    <p className="text-sm text-slate-500">
      Warehouse
    </p>

    <p className="text-lg font-semibold mt-2">
      {product.warehouse.name}
    </p>
  </div>

  <div className="border rounded-2xl p-5">
    <p className="text-sm text-slate-500">
      Unit
    </p>

    <p className="text-lg font-semibold mt-2">
      {product.unit}
    </p>
  </div>

  <div className="border rounded-2xl p-5">
    <p className="text-sm text-slate-500">
      Current Stock
    </p>

    <p className="text-3xl font-bold text-[#17357A] mt-2">
      {product.currentStock}
    </p>
  </div>

  <div className="border rounded-2xl p-5">
    <p className="text-sm text-slate-500">
      Minimum Stock
    </p>

    <p className="text-2xl font-semibold mt-2">
      {product.minimumStock}
    </p>
  </div>

  <div className="border rounded-2xl p-5">
    <p className="text-sm text-slate-500">
      Status
    </p>

    <p className="text-lg font-semibold mt-2">
      {product.status}
    </p>
  </div>

</div>
  </div>

  <div className="space-y-4">

<h2 className="text-xl font-bold">
Recent Transactions
</h2>

<div className="space-y-3">

{transactions.map((transaction) => (

<div
key={transaction._id}
className="border rounded-xl p-4 flex justify-between"
>

<div>

  <p className="font-semibold">
    {transaction.reason}
  </p>

  <p className="text-slate-500">
    Type: {transaction.type === "IN" ? "Stock In" : "Stock Out"}
  </p>

  <p className="text-slate-500">
    Qty: {transaction.quantity}
  </p>

  <p className="text-slate-500">
    By: {transaction.performedBy?.name}
  </p>

</div>

<div className="text-right">

  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      transaction.type === "IN"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {transaction.type}
  </span>

  <p className="text-sm mt-3">
    {new Date(transaction.createdAt).toLocaleDateString()}
  </p>

  <p className="text-xs text-slate-500">
    {new Date(transaction.createdAt).toLocaleTimeString()}
  </p>

</div>

</div>

))}

</div>

</div>
  </div>

  
</AdminLayout>
);

};

export default InventoryDetailsPage;
