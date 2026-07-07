interface InventorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

const InventorySearch = ({
  value,
  onChange,
}: InventorySearchProps) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
          />
        </svg>

        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            w-full
            pl-12
            pr-4
            py-3
            border
            border-slate-200
            rounded-2xl
            bg-white
            outline-none
            focus:border-[#17357A]
            transition
          "
        />
      </div>
    </div>
  );
};

export default InventorySearch;