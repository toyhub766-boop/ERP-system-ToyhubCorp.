import clsx from "clsx";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
};

const PageHeader = ({
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) => {
  return (
    <div
      className={clsx(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 text-sm text-slate-500 max-w-xl">
            {subtitle}
          </p>
        )}

      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;