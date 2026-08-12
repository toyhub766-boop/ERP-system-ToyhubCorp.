import clsx from "clsx";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer = ({
  children,
  className,
}: PageContainerProps) => {
  return (
    <section
      className={clsx(
        `
          mx-auto
          flex
          min-h-0
          w-full
          max-w-[1440px]
          flex-col
        `,
        className
      )}
    >
      {children}
    </section>
  );
};

export default PageContainer;