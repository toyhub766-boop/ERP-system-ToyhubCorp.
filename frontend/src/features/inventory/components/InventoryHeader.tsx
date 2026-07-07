interface InventoryHeaderProps {
  totalProducts: number;
  onAddProduct: () => void;
}

const InventoryHeader = ({
  totalProducts,
  onAddProduct,
}: InventoryHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Inventory Management
        </h1>

        <p className="text-slate-500 mt-1">
          {totalProducts} products across all warehouses
        </p>
      </div>

      <button
        onClick={onAddProduct}
        className="
          flex
          items-center
          gap-2
          bg-[#17357A]
          hover:bg-[#20469d]
          text-white
          px-6
          py-3
          rounded-2xl
          font-medium
          shadow-sm
          transition
        "
      >
        <span className="text-xl leading-none">+</span>
        Add Product
      </button>
    </div>
  );
};

export default InventoryHeader;