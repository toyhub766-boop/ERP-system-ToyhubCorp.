import type { ReactNode } from "react";
import clsx from "clsx";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

const PageHeader = ({
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) => {
  return (
    <header
      className={clsx(
        "mb-7 flex flex-col gap-5",
        "sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Title */}
      <div className="min-w-0">
        <h1
          className="
            text-2xl
            font-semibold
            tracking-tight
            text-slate-900
            sm:text-3xl
          "
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="
              mt-1.5
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
            "
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Action */}
      {action && (
        <div className="flex shrink-0 items-center gap-2">
          {action}
        </div>
      )}
    </header>
  );
};

export default PageHeader;