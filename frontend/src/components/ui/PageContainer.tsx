import type { ReactNode } from "react";
import clsx from "clsx";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

const PageContainer = ({
  children,
  className,
}: PageContainerProps) => {
  return (
    <section
      className={clsx(
        "w-full",
        "max-w-[1320px]",
        "mx-auto",
        "px-4",
        "sm:px-6",
        "lg:px-8",
        "py-6",
        className
      )}
    >
      {children}
    </section>
  );
};

export default PageContainer;