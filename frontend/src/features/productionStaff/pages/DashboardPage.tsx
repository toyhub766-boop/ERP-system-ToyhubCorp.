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
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border p-8">
        <h1 className="text-3xl font-bold">
          👋 {greeting}, {user.name}
        </h1>

        <p className="text-slate-500 mt-2">Employee ID: {user.employeeId}</p>

        <span className="inline-block mt-4 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium">
          {user.role} STAFF
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">{boms.length}</p>

          <p className="text-slate-500">BOMs</p>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">
            {productions.filter((p: any) => p.status === "In Progress").length}
          </p>

          <p className="text-slate-500">Active Orders</p>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">
            {dispatches.filter((d: any) => d.status === "Pending").length}
          </p>

          <p className="text-slate-500">Pending Dispatch</p>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">{dispatches.length}</p>

          <p className="text-slate-500">Total Dispatches</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-xl font-semibold mb-5">Quick Actions</h2>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/production-staff/bom")}
            className="border rounded-xl p-6 hover:bg-blue-50 transition text-left"
          >
            <p className="text-3xl">📋</p>

            <h3 className="font-semibold mt-3">BOM</h3>

            <p className="text-sm text-slate-500 mt-1">
              Manage Bill of Materials
            </p>
          </button>

          <button
            onClick={() => navigate("/production-staff/production")}
            className="border rounded-xl p-6 hover:bg-green-50 transition text-left"
          >
            <p className="text-3xl">🏭</p>

            <h3 className="font-semibold mt-3">Production</h3>

            <p className="text-sm text-slate-500 mt-1">Production Orders</p>
          </button>

          <button
            onClick={() => navigate("/production-staff/dispatch")}
            className="border rounded-xl p-6 hover:bg-orange-50 transition text-left"
          >
            <p className="text-3xl">🚚</p>

            <h3 className="font-semibold mt-3">Dispatch</h3>

            <p className="text-sm text-slate-500 mt-1">Dispatch Management</p>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-xl font-semibold mb-5">Recent Production Orders</h2>

        <div className="space-y-3">
          {productions.slice(0, 5).map((production: any) => (
            <div
              key={production._id}
              className="flex justify-between items-center border rounded-lg p-4"
            >
              <div>
                <p className="font-semibold">
                  {production.finishedProduct?.name}
                </p>

                <p className="text-sm text-slate-500">
                  {production.orderNumber}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-slate-100 text-sm">
                {production.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-sm text-green-700">Completed</p>

          <h2 className="text-3xl font-bold mt-2">
            {productions.filter((p: any) => p.status === "Completed").length}
          </h2>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <p className="text-sm text-yellow-700">Draft</p>

          <h2 className="text-3xl font-bold mt-2">
            {productions.filter((p: any) => p.status === "Draft").length}
          </h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-sm text-blue-700">In Progress</p>

          <h2 className="text-3xl font-bold mt-2">
            {productions.filter((p: any) => p.status === "In Progress").length}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
