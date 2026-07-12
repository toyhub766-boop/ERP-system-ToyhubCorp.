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

const chipStyle = (active: boolean) =>
  `
    px-4
    py-2
    rounded-xl
    text-sm
    font-medium
    transition-all
    duration-200
    border
    ${
      active
        ? "bg-[#17357A] border-[#17357A] text-white shadow-sm"
        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
    }
  `;

const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
      {title}
    </h4>

    <div className="flex flex-wrap gap-2">
      {children}
    </div>
  </div>
);

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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 lg:p-6">

      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-900">
          Filters
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Narrow down products using category, warehouse, type and status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Category */}

        <FilterSection title="Category">

          <button
            onClick={() => onCategoryChange("All")}
            className={chipStyle(selectedCategory === "All")}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={chipStyle(selectedCategory === category)}
            >
              {category}
            </button>
          ))}

        </FilterSection>

        {/* Warehouse */}

        <FilterSection title="Warehouse">

          <button
            onClick={() => onWarehouseChange("")}
            className={chipStyle(selectedWarehouse === "")}
          >
            All
          </button>

          {warehouses.map((warehouse) => (
            <button
              key={warehouse._id}
              onClick={() => onWarehouseChange(warehouse._id)}
              className={chipStyle(selectedWarehouse === warehouse._id)}
            >
              {warehouse.name}
            </button>
          ))}

        </FilterSection>

        {/* Product Type */}

        <FilterSection title="Product Type">

          {productTypes.map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={chipStyle(selectedType === type)}
            >
              {type === "RAW"
                ? "Raw Material"
                : type === "FINISHED"
                ? "Finished Product"
                : "All"}
            </button>
          ))}

        </FilterSection>

        {/* Status */}

        <FilterSection title="Status">

          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={chipStyle(selectedStatus === status)}
            >
              {status}
            </button>
          ))}

        </FilterSection>

      </div>

    </div>
  );
};

export default InventoryFilters;