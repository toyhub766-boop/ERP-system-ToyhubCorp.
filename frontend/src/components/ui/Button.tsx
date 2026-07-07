type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
};

const Button = ({
  children,
  className = "",
  type = "button",
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`
        bg-[#2444A4]
        text-white
        rounded-xl
        px-5
        py-3
        font-medium
        hover:opacity-90
        transition
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;