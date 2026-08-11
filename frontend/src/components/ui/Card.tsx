import type { ReactNode } from "react";
import clsx from "clsx";

type CardProps = {
  children: ReactNode;
  className?: string;
};

const Card = ({
  children,
  className,
}: CardProps) => {
  return (
    <div
      className={clsx(
        `
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        p-5
        shadow-[0_1px_3px_rgba(15,23,42,0.04)]
        transition-shadow
        duration-200
        `,
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;