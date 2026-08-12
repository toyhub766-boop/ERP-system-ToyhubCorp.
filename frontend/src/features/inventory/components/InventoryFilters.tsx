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
    inline-flex
    min-h-9
    max-w-full
    items-center
    justify-center
    rounded-xl
    border
    px-3
    py-2
    text-xs
    font-medium
    leading-4
    transition-all
    duration-200
    active:scale-[0.98]
    sm:px-4
    sm:text-sm
    ${
      active
        ? "border-[#17357A] bg-[#17357A] text-white shadow-sm"
        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
    }
  `;

const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="min-w-0 space-y-2.5">
    <h4
      className="
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.08em]
        text-slate-400
        sm:text-xs
        sm:tracking-wider
        sm:text-slate-500
      "
    >
      {title}
    </h4>

    <div
      className="
        flex
        max-w-full
        flex-wrap
        gap-1.5
        sm:gap-2
      "
    >
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
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        sm:p-5
        lg:p-6
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          mb-5
          sm:mb-6
        "
      >
        <h3
          className="
            text-base
            font-semibold
            tracking-tight
            text-slate-900
          "
        >
          Filters
        </h3>

        <p
          className="
            mt-1
            max-w-2xl
            text-xs
            leading-5
            text-slate-400
            sm:text-sm
            sm:text-slate-500
          "
        >
          Narrow down products using
          category, warehouse, type and
          status.
        </p>
      </div>

      {/* =====================================================
          FILTER GROUPS
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-5
          sm:gap-6
          lg:grid-cols-2
          lg:gap-8
        "
      >
        {/* ===================================================
            CATEGORY
        =================================================== */}

        <FilterSection title="Category">
          <button
            type="button"
            onClick={() =>
              onCategoryChange("All")
            }
            className={chipStyle(
              selectedCategory === "All"
            )}
          >
            All
          </button>

          {categories.map(
            (category) => (
              <button
                type="button"
                key={category}
                onClick={() =>
                  onCategoryChange(
                    category
                  )
                }
                className={chipStyle(
                  selectedCategory ===
                    category
                )}
              >
                <span className="max-w-full truncate">
                  {category}
                </span>
              </button>
            )
          )}
        </FilterSection>

        {/* ===================================================
            WAREHOUSE
        =================================================== */}

        <FilterSection title="Warehouse">
          <button
            type="button"
            onClick={() =>
              onWarehouseChange("")
            }
            className={chipStyle(
              selectedWarehouse === ""
            )}
          >
            All
          </button>

          {warehouses.map(
            (warehouse) => (
              <button
                type="button"
                key={warehouse._id}
                onClick={() =>
                  onWarehouseChange(
                    warehouse._id
                  )
                }
                className={chipStyle(
                  selectedWarehouse ===
                    warehouse._id
                )}
              >
                <span className="max-w-full truncate">
                  {warehouse.name}
                </span>
              </button>
            )
          )}
        </FilterSection>

        {/* ===================================================
            PRODUCT TYPE
        =================================================== */}

        <FilterSection title="Product Type">
          {productTypes.map(
            (type) => (
              <button
                type="button"
                key={type}
                onClick={() =>
                  onTypeChange(type)
                }
                className={chipStyle(
                  selectedType === type
                )}
              >
                {type === "RAW"
                  ? "Raw Material"
                  : type === "FINISHED"
                    ? "Finished Product"
                    : "All"}
              </button>
            )
          )}
        </FilterSection>

        {/* ===================================================
            STATUS
        =================================================== */}

        <FilterSection title="Status">
          {statuses.map(
            (status) => (
              <button
                type="button"
                key={status}
                onClick={() =>
                  onStatusChange(status)
                }
                className={chipStyle(
                  selectedStatus === status
                )}
              >
                {status}
              </button>
            )
          )}
        </FilterSection>
      </div>
    </div>
  );
};

export default InventoryFilters;