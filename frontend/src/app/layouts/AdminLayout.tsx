import { useState } from "react";
import Sidebar from "../../components/ui/Sidebar";

type Props = {
  children: React.ReactNode;
};

const AdminLayout = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    
    <div className="min-h-screen bg-[#F4F7FB] flex">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content */}
      
      <div
        className={`
          flex-1 min-w-0 pl-3 lg:pl-5   
          transition-all
          duration-300
          ${collapsed ? "ml-20" : "ml-64"}
        `}
      >
        <main className="px-6 py-6 lg:px-10 lg:py-8">
  <div className="mx-auto w-full max-w-[1440px]">
    {children}
  </div>
</main>
      </div>
    </div>
  );
};

export default AdminLayout;