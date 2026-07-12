import type { ReactNode } from "react";
import clsx from "clsx";

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
};

const StatCard = ({
  title,
  value,
  icon,
  className,
}: StatCardProps) => {
  return (
    <div
      className={clsx(
        `
        bg-white
        border
        border-slate-200
        rounded-xl
        shadow-sm

        px-4
        py-4

        flex
        items-center
        justify-between

        transition-all
        duration-200

        hover:shadow-md
        `,
        className
      )}
    >
      <div className="min-w-0">

        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {title}
        </p>

        <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 leading-none">
          {value}
        </h2>

      </div>

      {icon && (
        <div className="ml-4 shrink-0 text-2xl text-slate-300">
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatCard;