interface InventorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

const InventorySearch = ({
  value,
  onChange,
}: InventorySearchProps) => {
  return (
    <div className="mb-5 sm:mb-6 lg:mb-8">
      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-3.5
          shadow-sm
          sm:p-4
        "
      >
        <label
          htmlFor="inventory-search"
          className="
            mb-2
            block
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.08em]
            text-slate-400
            sm:text-xs
            sm:tracking-wide
            sm:text-slate-500
          "
        >
          Search Inventory
        </label>

        <input
          id="inventory-search"
          type="text"
          placeholder="Search products by name or SKU..."
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            h-11
            w-full
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-3.5
            text-sm
            text-slate-800
            outline-none
            transition-all
            duration-200
            placeholder:text-slate-400
            hover:border-slate-300
            focus:border-[#17357A]
            focus:bg-white
            focus:ring-2
            focus:ring-[#17357A]/10
            sm:h-12
            sm:px-4
          "
        />
      </div>
    </div>
  );
};

export default InventorySearch;