import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

const PageContainer = ({
  children,
  className = "",
}: PageContainerProps) => {
  return (
    <section
      className={`
        w-full
        min-w-0
        py-6
        sm:py-7
        lg:py-8
        ${className}
      `}
    >
      {children}
    </section>
  );
};

export default PageContainer;