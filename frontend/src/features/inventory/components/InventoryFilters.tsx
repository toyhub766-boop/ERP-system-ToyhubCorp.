interface InventoryFiltersProps {
  selectedCategory: string;
  selectedStatus: string;
  selectedWarehouse: string;
  selectedType: string;

  categories: string[];

  warehouses: {
    _id: string;
    name: string;
  }[];

  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onWarehouseChange: (warehouse: string) => void;
  onTypeChange: (type: string) => void;
}

const statuses = [
  "All",
  "Healthy",
  "Low Stock",
  "Critical",
];

const productTypes = [
  "All",
  "RAW",
  "FINISHED",
];

const InventoryFilters = ({
  selectedCategory,
  selectedStatus,
  selectedWarehouse,
  selectedType,
  categories,
  warehouses,
  onCategoryChange,
  onStatusChange,
  onWarehouseChange,
  onTypeChange,
}: InventoryFiltersProps) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-6">

      {/* Category */}

      <p className="text-xs font-semibold uppercase text-slate-500 mb-3">
        Category
      </p>

      <div className="flex flex-wrap gap-2 mb-6">

        <button
          onClick={() =>
            onCategoryChange("All")
          }
          className={`px-4 py-2 rounded-full text-sm transition
          ${
            selectedCategory === "All"
              ? "bg-[#17357A] text-white"
              : "bg-slate-100"
          }`}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category}
            onClick={() =>
              onCategoryChange(category)
            }
            className={`px-4 py-2 rounded-full text-sm transition
            ${
              selectedCategory === category
                ? "bg-[#17357A] text-white"
                : "bg-slate-100"
            }`}
          >
            {category}
          </button>
        ))}

        
      </div>

<div className="mb-6">

  {/* Warehouse */}

<p className="text-xs font-semibold uppercase text-slate-500 mb-3">
  Warehouse
</p>

<div className="flex flex-wrap gap-2 mb-6">

  <button
    onClick={() => onWarehouseChange("")}
    className={`px-4 py-2 rounded-full text-sm transition ${
      selectedWarehouse === ""
        ? "bg-[#17357A] text-white"
        : "bg-slate-100"
    }`}
  >
    All
  </button>

  {warehouses.map((warehouse) => (
    <button
      key={warehouse._id}
      onClick={() => onWarehouseChange(warehouse._id)}
      className={`px-4 py-2 rounded-full text-sm transition ${
        selectedWarehouse === warehouse._id
          ? "bg-[#17357A] text-white"
          : "bg-slate-100"
      }`}
    >
      {warehouse.name}
    </button>
  ))}

</div>


{/* Product Type */}

<p className="text-xs font-semibold uppercase text-slate-500 mb-3">
  Product Type
</p>

<div className="flex flex-wrap gap-2 mb-6">
  {productTypes.map((type) => (
    <button
      key={type}
      onClick={() => onTypeChange(type)}
      className={`px-4 py-2 rounded-full text-sm transition ${
        selectedType === type
          ? "bg-[#17357A] text-white"
          : "bg-slate-100"
      }`}
    >
      {type === "RAW"
        ? "Raw Material"
        : type === "FINISHED"
        ? "Finished Product"
        : "All"}
    </button>
  ))}
</div>



      {/* Status */}

      <p className="text-xs font-semibold uppercase text-slate-500 mb-3">
        Status
      </p>

      <div className="flex flex-wrap gap-2">

        {statuses.map((status) => (
          <button
            key={status}
            onClick={() =>
              onStatusChange(status)
            }
            className={`px-4 py-2 rounded-full text-sm transition
            ${
              selectedStatus === status
                ? "bg-[#17357A] text-white"
                : "bg-slate-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

    </div>
    </div>
  );
};

export default InventoryFilters;