import { Outlet } from "react-router-dom";
import ProductionSidebar from "../components/ProductionSidebar";

const ProductionStaffLayout = () => {
  return (
    <div className="flex h-screen bg-slate-100">

      <ProductionSidebar />

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>

    </div>
  );
};

export default ProductionStaffLayout;