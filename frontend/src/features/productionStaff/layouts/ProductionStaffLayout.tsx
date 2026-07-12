import { Outlet } from "react-router-dom";
import ProductionSidebar from "../components/ProductionSidebar";

const ProductionStaffLayout = () => {
  return (
    <div className="min-h-screen flex bg-slate-100">

      <ProductionSidebar />

      <main className="flex-1 overflow-y-auto">

        <div className="mx-auto w-full max-w-[1450px] px-4 lg:px-8 py-8 pt-20 lg:pt-8">
          <Outlet />
        </div>

      </main>

    </div>
  );
};

export default ProductionStaffLayout;