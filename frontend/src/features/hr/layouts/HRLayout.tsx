import type { ReactNode } from "react";
import HRSidebar from "../components/HRSidebar";

interface Props {
  children: ReactNode;
}

const HRLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen flex bg-slate-100">

      <HRSidebar />

      <main className="flex-1 overflow-y-auto">
  <div className="mx-auto w-full max-w-[1450px] px-4 lg:px-8 py-8 pt-20 lg:pt-8">
    {children}
  </div>
</main>

    </div>
  );
};

export default HRLayout;