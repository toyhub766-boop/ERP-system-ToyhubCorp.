import type { ReactNode } from "react";
import CRMSidebar from "./CRMSidebar";

interface Props {
  children: ReactNode;
}

const CRMStaffLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* CRM Navigation */}
      <CRMSidebar />

      {/* Main Workspace */}
      <main className="min-h-screen w-full">

        <div
          className="
            mx-auto
            w-full
            max-w-[1450px]
            px-4
            pb-10
            pt-20
            sm:px-6
            sm:pt-8
            lg:px-8
            lg:pb-12
          "
        >
          {children}
        </div>

      </main>

    </div>
  );
};

export default CRMStaffLayout;