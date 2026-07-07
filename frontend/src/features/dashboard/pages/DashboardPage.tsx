import AdminLayout from "../../../app/layouts/AdminLayout";
import StatCard from "../../../components/ui/StatCard";

const DashboardPage = () => {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Good Evening, Govind 👋
        </h1>

        <p className="mt-2 text-slate-500">
          Here's what's happening across Toy Hub Corporation today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Products" value={12} />
        <StatCard title="Finished Goods" value={4} />
        <StatCard title="Raw Materials" value={6} />
        <StatCard title="Low Stock Items" value={3} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border p-6 h-[350px]">
          <h3 className="font-semibold text-lg mb-4">
            Stock Movement
          </h3>

          <div className="h-full flex items-center justify-center text-slate-400">
            Chart Coming Soon
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6 h-[350px]">
          <h3 className="font-semibold text-lg mb-4">
            Warehouse Distribution
          </h3>

          <div className="h-full flex items-center justify-center text-slate-400">
            Pie Chart Coming Soon
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-semibold text-lg mb-4">
            Recent Activity
          </h3>

          <div className="space-y-4">
            <div>+200 Princess Doll</div>
            <div>-160 Doll Dress</div>
            <div>+2000 Plastic Pellets</div>
            <div>-50 Toy Car Set</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-semibold text-lg mb-4">
            Warehouse Overview
          </h3>

          <div className="space-y-4">
            <div>Warehouse 1 — PKR 2.5M</div>
            <div>Warehouse 2 — PKR 1.8M</div>
            <div>Warehouse 3 — PKR 0.9M</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;