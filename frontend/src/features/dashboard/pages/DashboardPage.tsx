import AdminLayout from "../../../app/layouts/AdminLayout";
import StatCard from "../../../components/ui/StatCard";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  getProducts,
  getInventoryTransactions,
  getAttendance,
  getProduction,
} from "../services/dashboard.service";

const DashboardCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <h3 className="font-semibold text-lg text-slate-800 mb-5">
      {title}
    </h3>

    {children}
  </div>
);

const DashboardPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [production, setProduction] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          productsData,
          transactionData,
          attendanceData,
          productionData,
        ] = await Promise.all([
          getProducts(),
          getInventoryTransactions(),
          getAttendance(),
          getProduction(),
        ]);

        setProducts(productsData);
        setTransactions(transactionData);
        setAttendance(attendanceData);
        setProduction(productionData);
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);



  const stockMovement = useMemo(() => {
    const stockIn = transactions
      .filter((t) => t.type === "IN")
      .reduce((sum, t) => sum + t.quantity, 0);

    const stockOut = transactions
      .filter((t) => t.type === "OUT")
      .reduce((sum, t) => sum + t.quantity, 0);

    return [
      {
        name: "Stock In",
        quantity: stockIn,
      },
      {
        name: "Stock Out",
        quantity: stockOut,
      },
    ];
  }, [transactions]);

  const warehouseDistribution = useMemo(() => {
    const map: Record<string, number> = {};

    products.forEach((p) => {
      const warehouse =
        p.warehouse?.name || "Unknown";

      map[warehouse] = (map[warehouse] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [products]);

  const COLORS = [
    "#172B6B",
    "#3B82F6",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
  ];

  const attendanceSummary = useMemo(() => ({
    present: attendance.filter(a => a.status === "Present").length,
    absent: attendance.filter(a => a.status === "Absent").length,
    halfDay: attendance.filter(a => a.status === "Half Day").length,
    leave: attendance.filter(a => a.status === "Leave").length,
  }), [attendance]);

  const productionSummary = useMemo(() => ({
    draft: production.filter(p => p.status === "Draft").length,

    inProgress: production.filter(p =>
      p.status === "Started" ||
      p.status === "In Progress"
    ).length,

    completed: production.filter(p =>
      p.status === "Completed"
    ).length,
  }), [production]);

  const recentActivity = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const lowStockProducts = useMemo(() => {
    return products.filter(
      (p) => p.currentStock <= p.minimumStock
    );
  }, [products]);




  const dashboardStats = useMemo(() => {
    const totalProducts = products.length;

    const finishedGoods = products.filter(
      (p) => p.type === "FINISHED"
    ).length;

    const rawMaterials = products.filter(
      (p) => p.type === "RAW"
    ).length;

    const lowStock = products.filter(
      (p) => p.currentStock <= p.minimumStock
    ).length;

    return {
      totalProducts,
      finishedGoods,
      rawMaterials,
      lowStock,
    };
  }, [products]);


  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, Govind 👋
        </h1>

        <p className="text-slate-500 mt-2">
          Here's your business overview for today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={loading ? "..." : dashboardStats.totalProducts}
        />

        <StatCard
          title="Finished Goods"
          value={loading ? "..." : dashboardStats.finishedGoods}
        />

        <StatCard
          title="Raw Materials"
          value={loading ? "..." : dashboardStats.rawMaterials}
        />

        <StatCard
          title="Low Stock Items"
          value={loading ? "..." : dashboardStats.lowStock}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border p-6 h-[350px]">
          <h3 className="font-semibold text-lg mb-4">
            Stock Movement
          </h3>

          <div className="h-full flex items-center justify-center text-slate-400">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stockMovement}>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="quantity"
                  fill="#172B6B"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6 h-[350px]">
          <h3 className="font-semibold text-lg mb-4">
            Warehouse Distribution
          </h3>

          <div className="h-full flex items-center justify-center text-slate-400">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={warehouseDistribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {warehouseDistribution.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Legend />

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
            <div className="space-y-3">
              {recentActivity.map((t) => (
                <div
                  key={t._id}
                  className="flex justify-between items-center border-b border-slate-100 pb-3"
                >
                  <div>
                    <p className="font-medium">
                      {t.product?.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {t.type === "IN" ? "Stock In" : "Stock Out"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-semibold ${t.type === "IN"
                        ? "text-green-600"
                        : "text-red-600"
                        }`}
                    >
                      {t.type === "IN" ? "+" : "-"}
                      {t.quantity}
                    </p>

                    <p className="text-xs text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-semibold text-lg mb-4">
            Warehouse Overview
          </h3>

          <div className="space-y-4">
            <div className="space-y-4">
              {warehouseDistribution.map((warehouse) => (
                <div
                  key={warehouse.name}
                  className="flex justify-between"
                >
                  <span>{warehouse.name}</span>

                  <span>{warehouse.value} Products</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-semibold text-lg mb-4">
            Low Stock Alerts
          </h3>

          <div className="space-y-3">
            {lowStockProducts.map((p) => (
              <div
                key={p._id}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {p.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {p.currentStock} / {p.minimumStock}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${p.currentStock === 0
                    ? "bg-red-100 text-red-700"
                    : p.currentStock <= p.minimumStock / 2
                      ? "bg-orange-100 text-orange-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {p.currentStock === 0
                    ? "Out of Stock"
                    : p.currentStock <= p.minimumStock / 2
                      ? "Critical"
                      : "Low"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-semibold text-lg mb-5">
            Attendance Summary
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <StatCard title="Present" value={attendanceSummary.present} />
            <StatCard title="Absent" value={attendanceSummary.absent} />
            <StatCard title="Half Day" value={attendanceSummary.halfDay} />
            <StatCard title="Leave" value={attendanceSummary.leave} />

          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">

          <h3 className="font-semibold text-lg mb-5">
            Production Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <StatCard
              title="Draft"
              value={productionSummary.draft}
            />

            <StatCard
              title="In Progress"
              value={productionSummary.inProgress}
            />

            <StatCard
              title="Completed"
              value={productionSummary.completed}
            />

          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;