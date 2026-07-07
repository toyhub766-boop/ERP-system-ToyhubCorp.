import { useEffect, useState } from "react";
import { getBOMs } from "../../bom/services/bom.service";
import AdminLayout from "../../../app/layouts/AdminLayout";
import {
  getProductions,
  calculateProduction,
  createProduction,
  updateProduction,
  getMaterialConsumption,
} from "../services/production.services";

const ProductionPage = () => {
  const [productions, setProductions] = useState<any[]>([]);

  const [selectedProduction, setSelectedProduction] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const [availability, setAvailability] = useState<any>(null);

  const [materialConsumption, setMaterialConsumption] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [boms, setBoms] = useState<any[]>([]);

  const [selectedBOM, setSelectedBOM] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [team, setTeam] = useState("");

  const [targetDate, setTargetDate] = useState("");

  const [notes, setNotes] = useState("");

  const [activeTab, setActiveTab] = useState<"orders" | "calculator">("orders");

  const [calculatorBOM, setCalculatorBOM] = useState("");

  const [calculatorQuantity, setCalculatorQuantity] = useState(1);

  const [calculatorResult, setCalculatorResult] = useState<any>(null);

  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [actualQuantity, setActualQuantity] = useState(0);

  const [completionRemarks, setCompletionRemarks] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [productionData, bomData] = await Promise.all([
        getProductions(),
        getBOMs(),
      ]);

      setProductions(productionData);
      setBoms(bomData);

      if (productionData.length > 0) {
        setSelectedProduction(productionData[0]);
        await loadAvailability(productionData[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async (production: any) => {
    try {
      const result = await calculateProduction({
        bom: production.bom._id,
        quantity: production.quantity,
      });

      setAvailability(result);
      const consumption = await getMaterialConsumption(production._id);

      setMaterialConsumption(consumption);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduction = async () => {
    if (!selectedBOM) {
      alert("Select a BOM");
      return;
    }

    if (quantity <= 0) {
      alert("Enter valid quantity");
      return;
    }

    try {
      await createProduction({
        bom: selectedBOM,

        quantity,

        team,

        targetDate,

        notes,
      });

      setShowModal(false);

      setSelectedBOM("");

      setQuantity(1);

      setTeam("");

      setTargetDate("");

      setNotes("");

      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selectedProduction) return;

    try {
      await updateProduction(selectedProduction._id, {
        ...selectedProduction,
        status,
        bom: selectedProduction.bom._id,
      });

      const productionData = await getProductions();

      setProductions(productionData);

      const updated = productionData.find(
        (p: any) => p._id === selectedProduction._id,
      );

      if (updated) {
        setSelectedProduction(updated);
        await loadAvailability(updated);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCalculate = async () => {
    try {
      const result = await calculateProduction({
        bom: calculatorBOM,
        quantity: calculatorQuantity,
      });

      setCalculatorResult(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteProduction = async () => {
    if (!selectedProduction) return;

    if (actualQuantity <= 0) {
      alert("Enter actual produced quantity");
      return;
    }

    try {
      await updateProduction(selectedProduction._id, {
        ...selectedProduction,
        bom: selectedProduction.bom._id,
        status: "Completed",
        actualQuantity,
        completedAt: new Date().toISOString(),
        remarks: completionRemarks,
      });

      setShowCompletionModal(false);

      setActualQuantity(0);

      setCompletionRemarks("");

      const productionData = await getProductions();

      setProductions(productionData);

      const updated = productionData.find(
        (p: any) => p._id === selectedProduction._id,
      );

      if (updated) {
        setSelectedProduction(updated);
        await loadAvailability(updated);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Production Management</h1>

        <p className="text-slate-500 mt-1">
          Production orders, batch tracking and capacity planning
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-2 rounded-xl ${
            activeTab === "orders" ? "bg-blue-700 text-white" : "border"
          }`}
        >
          📦 Production Orders
        </button>

        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-5 py-2 rounded-xl ${
            activeTab === "calculator" ? "bg-blue-700 text-white" : "border"
          }`}
        >
          🧮 Calculator
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">{productions.length}</p>

          <p className="text-slate-500">Total Orders</p>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">
            {productions.filter((p) => p.status === "In Progress").length}
          </p>

          <p className="text-slate-500">Active</p>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">
            {productions.filter((p) => p.status === "Completed").length}
          </p>

          <p className="text-slate-500">Completed</p>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">
            {productions.filter((p) => p.status === "Draft").length}
          </p>

          <span className="px-2 py-1 rounded-full bg-slate-100 text-xs">
            Draft
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-700 text-white px-5 py-2 rounded-xl"
        >
          + New Order
        </button>
      </div>

      {activeTab === "orders" ? (
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-lg mb-5">Production Orders</h2>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-slate-500">Loading...</p>
                ) : productions.length === 0 ? (
                  <p className="text-slate-500">No production orders found.</p>
                ) : (
                  productions.map((production) => (
                    <div
                      key={production._id}
                      onClick={() => {
                        setSelectedProduction(production);
                        loadAvailability(production);
                      }}
                      className={`border rounded-xl p-4 cursor-pointer transition ${
                        selectedProduction?._id === production._id
                          ? "border-blue-600"
                          : "hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold text-blue-700">
                            {production.orderNumber}
                          </p>

                          <h3 className="text-lg font-semibold mt-1">
                            {production.finishedProduct?.name}
                          </h3>
                        </div>

                        <span className="text-xs px-3 py-1 rounded-full bg-slate-100">
                          {production.status}
                        </span>
                      </div>

                      <div className="flex justify-between mt-4 text-sm text-slate-500">
                        <span>{production.quantity} units</span>

                        <span>{production.team}</span>
                      </div>

                      <div className="mt-3 text-sm text-slate-500">
                        Target:{" "}
                        {new Date(production.targetDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="bg-white rounded-xl border p-6">
              {!selectedProduction ? (
                <div className="text-center text-slate-500 py-20">
                  Select a production order
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">
                    {selectedProduction.finishedProduct?.name}
                  </h2>

                  <p className="text-slate-500 mb-6">
                    {selectedProduction.orderNumber}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-500 text-sm">Quantity</p>

                      <p className="font-semibold">
                        {selectedProduction.quantity}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">Team</p>

                      <p className="font-semibold">{selectedProduction.team}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">Status</p>

                      <p className="font-semibold">
                        {selectedProduction.status}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">Target Date</p>

                      <p className="font-semibold">
                        {new Date(
                          selectedProduction.targetDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedProduction.notes && (
                    <div className="mt-6">
                      <p className="text-slate-500 text-sm">Notes</p>

                      <p className="mt-2">{selectedProduction.notes}</p>
                    </div>
                  )}

                  {selectedProduction.status === "Completed" && (
                    <div className="mt-6 border rounded-xl p-4 bg-green-50">
                      <h3 className="font-semibold mb-4">Production Entry</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500">
                            Actual Quantity
                          </p>

                          <p className="font-semibold">
                            {selectedProduction.actualQuantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500">Completed On</p>

                          <p className="font-semibold">
                            {selectedProduction.completedAt
                              ? new Date(
                                  selectedProduction.completedAt,
                                ).toLocaleDateString()
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {selectedProduction.remarks && (
                        <div className="mt-4">
                          <p className="text-sm text-slate-500">Remarks</p>

                          <p className="mt-1">{selectedProduction.remarks}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {materialConsumption.length > 0 && (

  <div className="mt-6 border rounded-xl p-4">

    <h3 className="font-semibold text-lg mb-4">
      Material Consumption
    </h3>

    <div className="space-y-3">

      {materialConsumption.map((item: any) => (

        <div
          key={item._id}
          className="flex justify-between border-b pb-2"
        >

          <div>

            <p className="font-medium">
              {item.material?.name}
            </p>

            <p className="text-sm text-slate-500">
              {item.material?.unit || ""}
            </p>

          </div>

          <div className="text-right">

            <p className="font-semibold">
              {item.requiredQuantity}
            </p>

          </div>

        </div>

      ))}

    </div>

  </div>

)}

                  <div className="mt-6">
                    {selectedProduction.status === "Draft" && (
                      <button
                        onClick={() => handleStatusUpdate("Approved")}
                        className="w-full bg-blue-700 text-white py-3 rounded-xl"
                      >
                        Approve Order
                      </button>
                    )}

                    {selectedProduction.status === "Approved" && (
                      <button
                        onClick={() => handleStatusUpdate("Started")}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl"
                      >
                        Start Production
                      </button>
                    )}

                    {selectedProduction.status === "Started" && (
                      <button
                        onClick={() => handleStatusUpdate("In Progress")}
                        className="w-full bg-orange-500 text-white py-3 rounded-xl"
                      >
                        Mark In Progress
                      </button>
                    )}

                    {selectedProduction.status === "In Progress" && (
                      <button
                        onClick={() => {
                          console.log("Complete clicked");
                          setShowCompletionModal(true);
                        }}
                        className="w-full bg-green-600 text-white py-3 rounded-xl"
                      >
                        Complete Production
                      </button>
                    )}

                    {selectedProduction.status !== "Completed" &&
                      selectedProduction.status !== "Cancelled" && (
                        <button
                          onClick={() => handleStatusUpdate("Cancelled")}
                          className="w-full mt-3 bg-red- text-red-600 py-3 rounded-xl"
                        >
                          Cancel Order
                        </button>
                      )}
                  </div>

                  <hr className="my-6" />

                  <h3 className="font-semibold text-lg mb-4">
                    Material Availability
                  </h3>

                  {availability && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 mb-5">
                      <p className="text-sm text-slate-500">
                        Maximum Producible
                      </p>

                      <h2 className="text-4xl font-bold">
                        {availability.maximumProducible}
                      </h2>

                      <p className="text-red-600 mt-2">
                        Bottleneck: {availability.bottleneck}
                      </p>
                    </div>
                  )}

                  {availability?.materials?.map((item: any) => (
                    <div
                      key={item.product}
                      className={`border rounded-xl p-4 mb-3 ${
                        item.sufficient
                          ? "border-green-300 bg-green-50"
                          : "border-red-300 bg-red-50"
                      }`}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.product}</h4>

                        <span
                          className={
                            item.sufficient ? "text-green-600" : "text-red-600"
                          }
                        >
                          {item.sufficient ? "✓ OK" : "✗ Short"}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm mt-2">
                        <span>Need: {item.required}</span>

                        <span>Have: {item.available}</span>
                      </div>

                      {!item.sufficient && (
                        <p className="text-sm text-red-600 mt-1">
                          Shortage: {item.shortage}
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-6 max-w-3xl">
          <h2 className="text-xl font-semibold mb-6">
            Material Capacity Calculator
          </h2>

          <div className="space-y-4">
            <select
              className="w-full border rounded-lg p-3"
              value={calculatorBOM}
              onChange={(e) => setCalculatorBOM(e.target.value)}
            >
              <option value="">Select BOM</option>

              {boms.map((bom: any) => (
                <option key={bom._id} value={bom._id}>
                  {bom.finishedProduct?.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              className="w-full border rounded-lg p-3"
              placeholder="Production Quantity"
              value={calculatorQuantity}
              onChange={(e) => setCalculatorQuantity(Number(e.target.value))}
            />

            <button
              onClick={handleCalculate}
              className="w-full bg-blue-700 text-white py-3 rounded-xl"
            >
              Calculate Production Capacity
            </button>
          </div>
        </div>
      )}

      {calculatorResult && (
        <div className="bg-white rounded-xl border p-6 mt-6 max-w-3xl">
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">Maximum Producible Quantity</p>

            <h1 className="text-6xl font-bold mt-2">
              {calculatorResult.maximumProducible}
            </h1>

            <p className="text-gray-600 mt-2">
              units of{" "}
              <span className="font-semibold">
                {
                  boms.find((b: any) => b._id === calculatorBOM)
                    ?.finishedProduct?.name
                }
              </span>
            </p>

            <p className="text-red-600 mt-4 font-medium">
              Bottleneck: {calculatorResult.bottleneck}
            </p>
          </div>

          <h3 className="font-semibold mt-6 mb-4">Material Breakdown</h3>

          {calculatorResult.materials.map((item: any) => (
            <div
              key={item.product}
              className={`border rounded-xl p-4 mb-3 ${
                item.sufficient
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              <div className="flex justify-between">
                <span className="font-medium">{item.product}</span>

                <span
                  className={
                    item.sufficient ? "text-green-600" : "text-red-600"
                  }
                >
                  {item.sufficient ? "✓ OK" : "✗ Short"}
                </span>
              </div>

              <div className="flex justify-between mt-3 text-sm text-gray-600">
                <span>Need: {item.required}</span>

                <span>Have: {item.available}</span>
              </div>

              {!item.sufficient && (
                <p className="text-red-600 text-sm mt-2">
                  Shortage: {item.shortage}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[600px]">
            <h2 className="text-xl font-semibold mb-5">
              Create Production Order
            </h2>

            <div className="space-y-4">
              <select
                className="w-full border rounded-lg p-3"
                value={selectedBOM}
                onChange={(e) => setSelectedBOM(e.target.value)}
              >
                <option value="">Select BOM</option>

                {boms.map((bom) => (
                  <option key={bom._id} value={bom._id}>
                    {bom.finishedProduct?.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Quantity"
                className="w-full border rounded-lg p-3"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />

              <input
                type="text"
                placeholder="Team"
                className="w-full border rounded-lg p-3"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
              />

              <input
                type="date"
                className="w-full border rounded-lg p-3"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />

              <textarea
                rows={3}
                placeholder="Notes"
                className="w-full border rounded-lg p-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateProduction}
                className="px-5 py-2 bg-blue-700 text-white rounded-lg"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[500px]">
            <h2 className="text-xl font-semibold mb-5">Production Entry</h2>

            <div className="space-y-4">
              <input
                type="number"
                placeholder="Actual Produced Quantity"
                className="w-full border rounded-lg p-3"
                value={actualQuantity}
                onChange={(e) => setActualQuantity(Number(e.target.value))}
              />

              <textarea
                rows={3}
                placeholder="Remarks"
                className="w-full border rounded-lg p-3"
                value={completionRemarks}
                onChange={(e) => setCompletionRemarks(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-5 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleCompleteProduction}
                className="px-5 py-2 bg-green-600 text-white rounded-lg"
              >
                Complete Production
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  </AdminLayout>
  );
};

export default ProductionPage;
