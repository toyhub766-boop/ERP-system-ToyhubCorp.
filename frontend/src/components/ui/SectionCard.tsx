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
    <section
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
    </section>
  );
};

export default SectionCard;