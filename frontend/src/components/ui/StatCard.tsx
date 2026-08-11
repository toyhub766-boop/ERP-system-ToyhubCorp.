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
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        px-5
        py-4
        shadow-[0_1px_3px_rgba(15,23,42,0.04)]
        transition-all
        duration-200
        hover:-translate-y-[1px]
        hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)]
        `,
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
        </div>

        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;