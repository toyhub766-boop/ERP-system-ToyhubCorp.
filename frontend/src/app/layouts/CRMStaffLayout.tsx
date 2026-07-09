import type { ReactNode } from "react"; import CRMSidebar from "../../features/crm/components/CRMSidebar";
interface Props {
  children: ReactNode;
}

const CRMStaffLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <CRMSidebar />

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default CRMStaffLayout;