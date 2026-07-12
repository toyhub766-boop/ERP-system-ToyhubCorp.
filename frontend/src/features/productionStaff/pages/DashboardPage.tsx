import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBOMs } from "../../bom/services/bom.service";
import { getProductions } from "../../production/services/production.services";
import { getDispatches } from "../../dispatch/services/dispatch.service";

const DashboardPage = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [boms, setBoms] = useState<any[]>([]);
  const [productions, setProductions] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bomData, productionData, dispatchData] = await Promise.all([
          getBOMs(),
          getProductions(),
          getDispatches(),
        ]);

        setBoms(bomData);
        setProductions(productionData);
        setDispatches(dispatchData);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    return (
  <div className="mx-auto max-w-7xl space-y-8">

    {/* Welcome */}

    <div className="rounded-3xl bg-gradient-to-r from-[#172B6B] via-[#23408F] to-[#3458D4] p-8 text-white shadow-lg">

      <h1 className="text-3xl font-bold">
        👋 {greeting}, {user.name}
      </h1>

      <p className="mt-2 text-blue-100">
        Employee ID: {user.employeeId}
      </p>

      <span className="mt-5 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur">
        {user.role} STAFF
      </span>

    </div>

    {/* Statistics */}

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
        <p className="text-sm text-slate-500 uppercase">
          BOMs
        </p>

        <h2 className="mt-3 text-4xl font-bold text-[#172B6B]">
          {boms.length}
        </h2>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
        <p className="text-sm text-slate-500 uppercase">
          Active Orders
        </p>

        <h2 className="mt-3 text-4xl font-bold text-[#172B6B]">
          {
            productions.filter(
              (p: any) =>
                p.status === "In Progress"
            ).length
          }
        </h2>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
        <p className="text-sm text-slate-500 uppercase">
          Pending Dispatch
        </p>

        <h2 className="mt-3 text-4xl font-bold text-[#172B6B]">
          {
            dispatches.filter(
              (d: any) =>
                d.status === "Pending"
            ).length
          }
        </h2>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
        <p className="text-sm text-slate-500 uppercase">
          Total Dispatches
        </p>

        <h2 className="mt-3 text-4xl font-bold text-[#172B6B]">
          {dispatches.length}
        </h2>
      </div>

    </div>

    {/* Quick Actions */}

    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-8">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

          <p className="text-slate-500 mt-1">
            Jump to your daily production modules.
          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-5">

        <button
          onClick={() =>
            navigate("/production-staff/bom")
          }
          className="group rounded-2xl border border-slate-200 p-6 text-left transition hover:border-[#172B6B] hover:-translate-y-1 hover:shadow-lg"
        >

          <div className="text-5xl">
            📋
          </div>

          <h3 className="mt-5 text-xl font-semibold">
            BOM
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Manage Bill of Materials.
          </p>

        </button>

        <button
          onClick={() =>
            navigate("/production-staff/production")
          }
          className="group rounded-2xl border border-slate-200 p-6 text-left transition hover:border-green-500 hover:-translate-y-1 hover:shadow-lg"
        >

          <div className="text-5xl">
            🏭
          </div>

          <h3 className="mt-5 text-xl font-semibold">
            Production
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Track and manage production orders.
          </p>

        </button>

        <button
          onClick={() =>
            navigate("/production-staff/dispatch")
          }
          className="group rounded-2xl border border-slate-200 p-6 text-left transition hover:border-orange-500 hover:-translate-y-1 hover:shadow-lg"
        >

          <div className="text-5xl">
            🚚
          </div>

          <h3 className="mt-5 text-xl font-semibold">
            Dispatch
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Monitor pending dispatches.
          </p>

        </button>

      </div>

    </div>

    {/* Recent Orders */}

    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-8">

      <h2 className="text-2xl font-bold mb-6">
        Recent Production Orders
      </h2>

      <div className="space-y-4">

        {productions
          .slice(0, 5)
          .map((production: any) => (

            <div
              key={production._id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow"
            >

              <div>

                <h3 className="font-semibold text-lg">
                  {production.finishedProduct?.name}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {production.orderNumber}
                </p>

              </div>

              <span className="rounded-full bg-[#172B6B]/10 px-4 py-2 text-sm font-medium text-[#172B6B]">
                {production.status}
              </span>

            </div>

          ))}

      </div>

    </div>

    {/* Production Summary */}

    <div className="grid md:grid-cols-3 gap-5">

      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">

        <p className="text-sm text-green-700">
          Completed
        </p>

        <h2 className="mt-3 text-4xl font-bold text-green-700">
          {
            productions.filter(
              (p: any) =>
                p.status === "Completed"
            ).length
          }
        </h2>

      </div>

      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">

        <p className="text-sm text-yellow-700">
          Draft
        </p>

        <h2 className="mt-3 text-4xl font-bold text-yellow-700">
          {
            productions.filter(
              (p: any) =>
                p.status === "Draft"
            ).length
          }
        </h2>

      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">

        <p className="text-sm text-blue-700">
          In Progress
        </p>

        <h2 className="mt-3 text-4xl font-bold text-blue-700">
          {
            productions.filter(
              (p: any) =>
                p.status === "In Progress"
            ).length
          }
        </h2>

      </div>

    </div>

  </div>
);
};

export default DashboardPage;
