import { useState } from "react";
import Sidebar from "../../components/ui/Sidebar";
import Topbar from "../../components/ui/Topbar";

type Props = {
  children: React.ReactNode;
};

const AdminLayout = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-slate-100 min-h-screen">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Topbar />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;