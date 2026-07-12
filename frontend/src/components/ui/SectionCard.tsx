import type { ReactNode } from "react";
import clsx from "clsx";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

const SectionCard = ({
  children,
  className,
}: SectionCardProps) => {
  return (
    <div
      className={clsx(
        `
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-[0_2px_10px_rgba(15,23,42,0.05)]
        p-4 sm:p-5
        transition-all
        duration-200
        `,
        className
      )}
    >
      {children}
    </div>
  );
};

export default SectionCard;