interface InventorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

const InventorySearch = ({
  value,
  onChange,
}: InventorySearchProps) => {
  return (
    <div className="mb-8">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">

        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Search Inventory
        </label>

        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full
            h-12
            rounded-xl
            border
            border-slate-300
            bg-slate-50
            px-4
            text-sm
            text-slate-800
            placeholder:text-slate-400
            outline-none
            transition-all
            duration-200
            focus:bg-white
            focus:border-[#17357A]
            focus:ring-4
            focus:ring-[#17357A]/10
          "
        />

      </div>
    </div>
  );
};

export default InventorySearch;