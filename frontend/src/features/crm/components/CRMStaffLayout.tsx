import type { ReactNode } from "react";
import CRMSidebar from "./CRMSidebar";

interface Props {
  children: ReactNode;
}

const CRMStaffLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-slate-100">

      <CRMSidebar />

      <main className="overflow-y-auto">

        <div className="mx-auto w-full max-w-[1450px] px-4 lg:px-8 py-8 pt-20">

          {children}

        </div>

      </main>

    </div>
  );
};

export default CRMStaffLayout;