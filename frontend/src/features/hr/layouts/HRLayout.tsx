import type { ReactNode } from "react";
import HRSidebar from "../components/HRSidebar";

interface Props {
  children: ReactNode;
}

const HRLayout = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen bg-[#F7F8FC] text-slate-900">

      {/* Sidebar */}
      <HRSidebar />

      {/* Main Workspace */}
      <main className="min-w-0 flex-1 overflow-y-auto">

        <div
          className="
            mx-auto
            w-full
            max-w-[1550px]
            px-4
            py-6
            pt-20
            sm:px-6
            sm:py-8
            lg:px-8
            lg:py-8
            lg:pt-8
            xl:px-10
          "
        >
          {children}
        </div>

      </main>

    </div>
  );
};

export default HRLayout;