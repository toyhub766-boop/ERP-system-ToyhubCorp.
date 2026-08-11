import AdminLayout from "../../../app/layouts/AdminLayout";
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
  AreaChart,
  Area,
} from "recharts";

import {
  FiBox,
  FiUsers,
  FiActivity,
  FiAlertTriangle,
  FiArrowUp,
  FiArrowDown,
  FiLayers,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

import {
  getProducts,
  getInventoryTransactions,
  getAttendance,
  getProduction,
} from "../services/dashboard.service";

const COLORS = [
  "#4F46E5",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#F43F5E",
  "#8B5CF6",
];

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

  /* ================= INVENTORY ================= */

  const stockMovement = useMemo(() => {
    const stockIn = transactions
      .filter((t) => t.type === "IN")
      .reduce(
        (sum, t) => sum + Number(t.quantity || 0),
        0
      );

    const stockOut = transactions
      .filter((t) => t.type === "OUT")
      .reduce(
        (sum, t) => sum + Number(t.quantity || 0),
        0
      );

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

      map[warehouse] =
        (map[warehouse] || 0) + 1;
    });

    return Object.entries(map).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [products]);

  const inventoryTrend = useMemo(() => {
    const map: Record<
      string,
      { stockIn: number; stockOut: number }
    > = {};

    transactions.forEach((t) => {
      const date = t.createdAt
        ? new Date(t.createdAt).toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
            }
          )
        : "Unknown";

      if (!map[date]) {
        map[date] = {
          stockIn: 0,
          stockOut: 0,
        };
      }

      if (t.type === "IN") {
        map[date].stockIn += Number(
          t.quantity || 0
        );
      }

      if (t.type === "OUT") {
        map[date].stockOut += Number(
          t.quantity || 0
        );
      }
    });

    return Object.entries(map)
      .slice(-7)
      .map(([date, values]) => ({
        date,
        ...values,
      }));
  }, [transactions]);

  const lowStockProducts = useMemo(() => {
    return products.filter(
      (p) =>
        Number(p.currentStock || 0) <=
        Number(p.minimumStock || 0)
    );
  }, [products]);

  const dashboardStats = useMemo(() => {
    const totalProducts =
      products.length;

    const finishedGoods =
      products.filter(
        (p) => p.type === "FINISHED"
      ).length;

    const rawMaterials =
      products.filter(
        (p) => p.type === "RAW"
      ).length;

    const lowStock =
      lowStockProducts.length;

    const totalStock = products.reduce(
      (sum, p) =>
        sum + Number(p.currentStock || 0),
      0
    );

    return {
      totalProducts,
      finishedGoods,
      rawMaterials,
      lowStock,
      totalStock,
    };
  }, [products, lowStockProducts]);

  /* ================= ATTENDANCE ================= */

  const attendanceSummary = useMemo(
    () => ({
      present: attendance.filter(
        (a) => a.status === "Present"
      ).length,

      absent: attendance.filter(
        (a) => a.status === "Absent"
      ).length,

      halfDay: attendance.filter(
        (a) => a.status === "Half Day"
      ).length,

      leave: attendance.filter(
        (a) => a.status === "Leave"
      ).length,
    }),
    [attendance]
  );

  const attendanceChart = [
    {
      name: "Present",
      value: attendanceSummary.present,
    },
    {
      name: "Absent",
      value: attendanceSummary.absent,
    },
    {
      name: "Half Day",
      value: attendanceSummary.halfDay,
    },
    {
      name: "Leave",
      value: attendanceSummary.leave,
    },
  ];

  /* ================= PRODUCTION ================= */

  const productionSummary = useMemo(
    () => ({
      draft: production.filter(
        (p) => p.status === "Draft"
      ).length,

      inProgress: production.filter(
        (p) =>
          p.status === "Started" ||
          p.status === "In Progress"
      ).length,

      completed: production.filter(
        (p) => p.status === "Completed"
      ).length,
    }),
    [production]
  );

  const productionChart = [
    {
      name: "Draft",
      value: productionSummary.draft,
    },
    {
      name: "In Progress",
      value: productionSummary.inProgress,
    },
    {
      name: "Completed",
      value: productionSummary.completed,
    },
  ];

  /* ================= ACTIVITY ================= */

  const recentActivity = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      )
      .slice(0, 6);
  }, [transactions]);

  const totalStockIn = stockMovement[0].quantity;
  const totalStockOut = stockMovement[1].quantity;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F6F8FC]">

        <div className="mx-auto w-full max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* =====================================================
              HERO
          ====================================================== */}

          <section className="relative overflow-hidden rounded-[28px] bg-[#14245C] px-6 py-8 text-white shadow-[0_20px_60px_rgba(20,36,92,0.18)] sm:px-8 lg:px-10 lg:py-10">

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

              <div>
                <div className="mb-4 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />

                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">
                    Operations Command Center
                  </span>

                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  TOY HUB{" "}
                  <span className="text-blue-300">
                    Corporation
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                  A live operational view across
                  inventory, production, attendance
                  and business activity.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-5 backdrop-blur-md">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                    <FiActivity size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-blue-200">
                      System status
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {loading
                        ? "Syncing data..."
                        : "All systems operational"}
                    </p>
                  </div>

                </div>

                <p className="mt-4 text-xs text-blue-200">
                  Live operational metrics
                </p>

              </div>

            </div>
          </section>

          {/* =====================================================
              EXECUTIVE SNAPSHOT
          ====================================================== */}

          <section className="mt-10">

            <div className="mb-5 flex items-end justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Executive Snapshot
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  Business at a glance
                </h2>
              </div>

              <span className="hidden text-xs font-medium text-slate-400 sm:block">
                Live operational metrics
              </span>

            </div>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">

              <PremiumStat
                label="Products"
                value={
                  loading
                    ? "..."
                    : dashboardStats.totalProducts
                }
                description={`${dashboardStats.finishedGoods} finished goods`}
                icon={<FiBox />}
                iconClass="bg-blue-50 text-blue-600"
              />

              <PremiumStat
                label="Customers"
                value="—"
                description="CRM data available in CRM module"
                icon={<FiUsers />}
                iconClass="bg-violet-50 text-violet-600"
              />

              <PremiumStat
                label="Stock Units"
                value={
                  loading
                    ? "..."
                    : dashboardStats.totalStock.toLocaleString()
                }
                description={`${totalStockIn.toLocaleString()} received`}
                icon={<FiLayers />}
                iconClass="bg-emerald-50 text-emerald-600"
              />

              <PremiumStat
                label="Production"
                value={
                  loading
                    ? "..."
                    : production.length
                }
                description={`${productionSummary.inProgress} in progress`}
                icon={<FiActivity />}
                iconClass="bg-orange-50 text-orange-600"
              />

              <PremiumStat
                label="Low Stock"
                value={
                  loading
                    ? "..."
                    : dashboardStats.lowStock
                }
                description={
                  dashboardStats.lowStock
                    ? "Requires attention"
                    : "Inventory healthy"
                }
                icon={<FiAlertTriangle />}
                iconClass={
                  dashboardStats.lowStock
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
                }
              />

            </div>
          </section>

          {/* =====================================================
              INVENTORY INTELLIGENCE
          ====================================================== */}

          <DashboardSection
            number="01"
            eyebrow="Inventory Intelligence"
            title="Inventory control"
            description="Stock movement, warehouse distribution and inventory health."
          />

          <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">

            {/* Stock movement */}

            <ChartCard
              title="Stock movement"
              subtitle="Inbound versus outbound inventory"
            >

              <div className="h-[300px]">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={stockMovement}
                    barGap={24}
                  >

                    <CartesianGrid
                      stroke="#E8ECF3"
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#64748B",
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#94A3B8",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      cursor={{
                        fill: "#F8FAFC",
                      }}
                    />

                    <Bar
                      dataKey="quantity"
                      radius={[
                        10,
                        10,
                        4,
                        4,
                      ]}
                    >
                      {stockMovement.map(
                        (_, index) => (
                          <Cell
                            key={index}
                            fill={
                              index === 0
                                ? "#4F46E5"
                                : "#06B6D4"
                            }
                          />
                        )
                      )}
                    </Bar>

                  </BarChart>
                </ResponsiveContainer>

              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">

                <MetricStrip
                  label="Stock In"
                  value={totalStockIn}
                  icon={<FiArrowDown />}
                  className="text-emerald-600"
                />

                <MetricStrip
                  label="Stock Out"
                  value={totalStockOut}
                  icon={<FiArrowUp />}
                  className="text-rose-600"
                />

              </div>

            </ChartCard>

            {/* Warehouse */}

            <ChartCard
              title="Warehouse distribution"
              subtitle="Products across warehouse locations"
            >

              <div className="h-[300px]">

                {warehouseDistribution.length ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie
                        data={warehouseDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={4}
                      >
                        {warehouseDistribution.map(
                          (_, index) => (
                            <Cell
                              key={index}
                              fill={
                                COLORS[
                                  index %
                                    COLORS.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip />

                      <Legend
                        verticalAlign="bottom"
                        height={30}
                      />

                    </PieChart>

                  </ResponsiveContainer>

                ) : (
                  <EmptyChart
                    icon={<FiBox />}
                    title="No warehouse data"
                    text="Warehouse distribution will appear here."
                  />
                )}

              </div>

            </ChartCard>

          </div>

          {/* Inventory trend */}

          <div className="mt-6">

            <ChartCard
              title="Inventory activity trend"
              subtitle="Recent stock movement across recorded transactions"
            >

              <div className="h-[280px]">

                {inventoryTrend.length ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <AreaChart data={inventoryTrend}>

                      <defs>
                        <linearGradient
                          id="stockInGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#4F46E5"
                            stopOpacity={0.28}
                          />
                          <stop
                            offset="100%"
                            stopColor="#4F46E5"
                            stopOpacity={0}
                          />
                        </linearGradient>

                        <linearGradient
                          id="stockOutGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#F43F5E"
                            stopOpacity={0.22}
                          />
                          <stop
                            offset="100%"
                            stopColor="#F43F5E"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="#E8ECF3"
                        strokeDasharray="4 4"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748B",
                          fontSize: 11,
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip />

                      <Area
                        type="monotone"
                        dataKey="stockIn"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        fill="url(#stockInGradient)"
                      />

                      <Area
                        type="monotone"
                        dataKey="stockOut"
                        stroke="#F43F5E"
                        strokeWidth={3}
                        fill="url(#stockOutGradient)"
                      />

                      <Legend />

                    </AreaChart>

                  </ResponsiveContainer>

                ) : (
                  <EmptyChart
                    icon={<FiActivity />}
                    title="No transaction trend yet"
                    text="Recorded inventory transactions will build this chart."
                  />
                )}

              </div>

            </ChartCard>

          </div>

          {/* =====================================================
              PEOPLE + PRODUCTION
          ====================================================== */}

          <DashboardSection
            number="02"
            eyebrow="People & Production"
            title="Operational performance"
            description="Attendance health and production execution at a glance."
          />

          <div className="grid gap-6 xl:grid-cols-2">

            {/* Attendance */}

            <ChartCard
              title="Attendance health"
              subtitle="Current attendance status distribution"
            >

              <div className="grid items-center gap-4 md:grid-cols-[1fr_0.9fr]">

                <div className="h-[280px]">

                  {attendance.length ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <PieChart>

                        <Pie
                          data={attendanceChart}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={62}
                          outerRadius={100}
                          paddingAngle={4}
                        >
                          {attendanceChart.map(
                            (_, index) => (
                              <Cell
                                key={index}
                                fill={
                                  [
                                    "#10B981",
                                    "#F43F5E",
                                    "#F59E0B",
                                    "#8B5CF6",
                                  ][index]
                                }
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip />

                      </PieChart>

                    </ResponsiveContainer>

                  ) : (
                    <EmptyChart
                      icon={<FiUsers />}
                      title="No attendance data"
                      text="Attendance records will appear here."
                    />
                  )}

                </div>

                <div className="space-y-3">

                  <StatusRow
                    label="Present"
                    value={
                      attendanceSummary.present
                    }
                    className="text-emerald-600"
                  />

                  <StatusRow
                    label="Absent"
                    value={
                      attendanceSummary.absent
                    }
                    className="text-rose-600"
                  />

                  <StatusRow
                    label="Half Day"
                    value={
                      attendanceSummary.halfDay
                    }
                    className="text-amber-600"
                  />

                  <StatusRow
                    label="Leave"
                    value={
                      attendanceSummary.leave
                    }
                    className="text-violet-600"
                  />

                </div>

              </div>

            </ChartCard>

            {/* Production */}

            <ChartCard
              title="Production pipeline"
              subtitle="Production orders by execution stage"
            >

              <div className="h-[280px]">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={productionChart}
                    layout="vertical"
                    margin={{
                      left: 20,
                      right: 20,
                    }}
                  >

                    <CartesianGrid
                      stroke="#E8ECF3"
                      strokeDasharray="4 4"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      radius={[
                        0,
                        10,
                        10,
                        0,
                      ]}
                    >
                      {productionChart.map(
                        (_, index) => (
                          <Cell
                            key={index}
                            fill={
                              [
                                "#8B5CF6",
                                "#F59E0B",
                                "#10B981",
                              ][index]
                            }
                          />
                        )
                      )}
                    </Bar>

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </ChartCard>

          </div>

          {/* =====================================================
              ACTIVITY + ALERTS
          ====================================================== */}

          <DashboardSection
            number="03"
            eyebrow="Operational Signals"
            title="What needs attention"
            description="Recent activity and inventory exceptions."
          />

          <div className="grid gap-6 xl:grid-cols-2">

            {/* Activity */}

            <ChartCard
              title="Recent activity"
              subtitle="Latest inventory transactions"
            >

              <div className="divide-y divide-slate-100">

                {recentActivity.length ? (

                  recentActivity.map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            t.type === "IN"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {t.type === "IN" ? (
                            <FiArrowDown />
                          ) : (
                            <FiArrowUp />
                          )}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-bold text-slate-900">
                            {t.product?.name ||
                              "Inventory item"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {t.type === "IN"
                              ? "Stock received"
                              : "Stock dispatched"}
                          </p>

                        </div>

                      </div>

                      <div className="shrink-0 text-right">

                        <p
                          className={`text-sm font-bold ${
                            t.type === "IN"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {t.type === "IN"
                            ? "+"
                            : "-"}
                          {t.quantity}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {t.createdAt
                            ? new Date(
                                t.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </p>

                      </div>

                    </div>
                  ))

                ) : (

                  <EmptyState
                    icon={<FiActivity />}
                    title="No recent activity"
                    text="Inventory transactions will appear here."
                  />

                )}

              </div>

            </ChartCard>

            {/* Low stock */}

            <ChartCard
              title="Inventory alerts"
              subtitle="Products currently below their minimum stock level"
            >

              <div className="space-y-3">

                {lowStockProducts.length ? (

                  lowStockProducts
                    .slice(0, 6)
                    .map((p) => {

                      const current =
                        Number(
                          p.currentStock || 0
                        );

                      const minimum =
                        Number(
                          p.minimumStock || 0
                        );

                      const critical =
                        current === 0;

                      return (
                        <div
                          key={p._id}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                        >

                          <div className="flex min-w-0 items-center gap-3">

                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                critical
                                  ? "bg-red-50 text-red-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              <FiAlertTriangle />
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-bold text-slate-900">
                                {p.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {current} / {minimum} units
                              </p>

                            </div>

                          </div>

                          <span
                            className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                              critical
                                ? "bg-red-100 text-red-700"
                                : current <=
                                  minimum / 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {critical
                              ? "OUT"
                              : current <=
                                minimum / 2
                              ? "CRITICAL"
                              : "LOW"}
                          </span>

                        </div>
                      );
                    })

                ) : (

                  <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 text-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                      <FiCheckCircle size={24} />
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-slate-900">
                      Inventory looks healthy
                    </h3>

                    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                      No products are currently
                      below their minimum stock
                      level.
                    </p>

                  </div>

                )}

              </div>

            </ChartCard>

          </div>

          {/* =====================================================
              WAREHOUSE + PRODUCTION SUMMARY
          ====================================================== */}

          <div className="mt-6 grid gap-6 xl:grid-cols-2">

            <ChartCard
              title="Warehouse overview"
              subtitle="Current product distribution"
            >

              <div className="space-y-4">

                {warehouseDistribution.length ? (

                  warehouseDistribution.map(
                    (warehouse, index) => {

                      const percentage =
                        dashboardStats.totalProducts
                          ? Math.round(
                              (warehouse.value /
                                dashboardStats.totalProducts) *
                                100
                            )
                          : 0;

                      return (
                        <div
                          key={warehouse.name}
                        >

                          <div className="mb-2 flex items-center justify-between">

                            <div className="flex items-center gap-2">

                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    COLORS[
                                      index %
                                        COLORS.length
                                    ],
                                }}
                              />

                              <span className="text-sm font-semibold text-slate-700">
                                {warehouse.name}
                              </span>

                            </div>

                            <span className="text-sm font-bold text-slate-900">
                              {warehouse.value}
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor:
                                  COLORS[
                                    index %
                                      COLORS.length
                                  ],
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )

                ) : (

                  <EmptyState
                    icon={<FiLayers />}
                    title="No warehouse data"
                    text="Warehouse distribution will appear here."
                  />

                )}

              </div>

            </ChartCard>

            <ChartCard
              title="Production summary"
              subtitle="Current production workload"
            >

              <div className="grid grid-cols-3 gap-3">

                <MiniMetric
                  label="Draft"
                  value={
                    productionSummary.draft
                  }
                  icon={<FiClock />}
                  className="bg-violet-50 text-violet-600"
                />

                <MiniMetric
                  label="In Progress"
                  value={
                    productionSummary.inProgress
                  }
                  icon={<FiActivity />}
                  className="bg-amber-50 text-amber-600"
                />

                <MiniMetric
                  label="Completed"
                  value={
                    productionSummary.completed
                  }
                  icon={<FiCheckCircle />}
                  className="bg-emerald-50 text-emerald-600"
                />

              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Production orders
                    </p>

                    <p className="mt-1 text-3xl font-black text-slate-900">
                      {production.length}
                    </p>

                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                    <FiActivity size={21} />
                  </div>

                </div>

              </div>

            </ChartCard>

          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

/* =============================================================
   COMPONENTS
============================================================= */

const DashboardSection = ({
  number,
  eyebrow,
  title,
  description,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
}) => (
  <section className="mb-5 mt-12">

    <div className="flex items-start gap-3">

      <span className="mt-1 rounded-lg bg-[#172B6B] px-2 py-1 text-[10px] font-black tracking-wider text-white">
        {number}
      </span>

      <div>

        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>

      </div>

    </div>

  </section>
);

const ChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">

    <div className="mb-6">

      <h3 className="text-base font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        {subtitle}
      </p>

    </div>

    {children}

  </div>
);

const PremiumStat = ({
  label,
  value,
  description,
  icon,
  iconClass,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) => (
  <div className="group rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_6px_25px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(15,23,42,0.08)]">

    <div className="flex items-start justify-between gap-3">

      <div>

        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </p>

        <p className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          {value}
        </p>

      </div>

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

    </div>

    <p className="mt-4 truncate text-xs text-slate-500">
      {description}
    </p>

  </div>
);

const MetricStrip = ({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) => (
  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

    <div className="flex items-center gap-2">

      <span className={className}>
        {icon}
      </span>

      <span className="text-xs font-semibold text-slate-600">
        {label}
      </span>

    </div>

    <span className="text-sm font-black text-slate-900">
      {value.toLocaleString()}
    </span>

  </div>
);

const StatusRow = ({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) => (
  <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">

    <div className="flex items-center gap-2">

      <span
        className={`h-2.5 w-2.5 rounded-full ${className.replace(
          "text-",
          "bg-"
        )}`}
      />

      <span className="text-sm font-semibold text-slate-600">
        {label}
      </span>

    </div>

    <span className="text-sm font-black text-slate-900">
      {value}
    </span>

  </div>
);

const MiniMetric = ({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) => (
  <div
    className={`rounded-2xl p-4 ${className}`}
  >

    <div className="flex items-center justify-between">

      <span className="text-lg">
        {icon}
      </span>

      <span className="text-2xl font-black">
        {value}
      </span>

    </div>

    <p className="mt-3 text-xs font-bold">
      {label}
    </p>

  </div>
);

const EmptyChart = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) => (
  <div className="flex h-full flex-col items-center justify-center text-center">

    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      {icon}
    </div>

    <p className="mt-4 text-sm font-bold text-slate-700">
      {title}
    </p>

    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
      {text}
    </p>

  </div>
);

const EmptyState = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center text-center">

    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
      {icon}
    </div>

    <p className="mt-3 text-sm font-bold text-slate-700">
      {title}
    </p>

    <p className="mt-1 max-w-xs text-xs text-slate-400">
      {text}
    </p>

  </div>
);

export default DashboardPage;