type InputProps = {
  label: string;
  placeholder?: string;
  type?: string;
};

const Input = ({
  label,
  placeholder,
  type = "text",
}: InputProps) => {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="
          w-full
          border
          border-slate-300
          rounded-xl
          px-4
          py-3
          outline-none
          focus:border-[#2444A4]
        "
      />
    </div>
  );
};

export default Input;